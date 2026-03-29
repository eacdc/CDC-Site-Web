(function () {
  'use strict';

  const SESSION_KEY = 'cdc_session';
  const PROD_API_BASE_URL = 'https://cdcapi.onrender.com/api';
  const LOCAL_API_BASE_URL = 'http://localhost:3001/api';

  function resolveApiBaseUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const apiBase = params.get('apiBase') || params.get('api_base');
      if (apiBase) return apiBase.replace(/\/$/, '');
      const apiEnv = (params.get('apiEnv') || '').toLowerCase();
      if (apiEnv === 'local') return LOCAL_API_BASE_URL;
      if (apiEnv === 'prod' || apiEnv === 'production') return PROD_API_BASE_URL;
      const hostname = window.location.hostname || '';
      const protocol = window.location.protocol || '';
      if (hostname === 'localhost' || hostname === '127.0.0.1') return LOCAL_API_BASE_URL;
      if (protocol === 'file:') return LOCAL_API_BASE_URL;
    } catch (e) {}
    return PROD_API_BASE_URL;
  }

  const API_BASE_URL = resolveApiBaseUrl();

  /** Visible columns only (IDs used for reverse are not shown). */
  const DISPLAY_COLS = [
    'UserName',
    'FormNo',
    'ProcessName',
    'ClientName',
    'JobName',
    'ScheduledQty',
    'ProductionQty',
    'Status',
    'MachineName',
  ];

  let lastSearchText = '';

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function cellValue(row, col) {
    if (!row) return '';
    if (row[col] !== undefined && row[col] !== null) return row[col];
    const lower = col.charAt(0).toLowerCase() + col.slice(1);
    if (row[lower] !== undefined && row[lower] !== null) return row[lower];
    const keys = Object.keys(row);
    const match = keys.find((k) => k.toLowerCase() === col.toLowerCase());
    return match != null ? row[match] : '';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const str = String(s);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const form = document.getElementById('production-search-form');
  const input = document.getElementById('job-card-search-input');
  const submitBtn = document.getElementById('production-search-submit');
  const messageEl = document.getElementById('production-message');
  const resultsWrap = document.getElementById('production-results-wrap');
  const tbody = document.getElementById('production-results-body');
  const emptyEl = document.getElementById('production-empty');
  const userInfo = document.getElementById('user-info');
  const linkBack = document.getElementById('link-back-home');

  const session = getSession();
  if (!session || !session.database) {
    const qs = window.location.search || '';
    window.location.replace('index.html' + qs);
    return;
  }

  if (linkBack) {
    linkBack.href = 'index.html' + (window.location.search || '');
  }

  if (userInfo) {
    const u = session.username || 'User';
    const db = session.database || '';
    userInfo.textContent = `${u} (${db})`;
    userInfo.classList.remove('hidden');
  }

  function showMessage(text, isError) {
    if (!messageEl) return;
    messageEl.textContent = text || '';
    messageEl.classList.toggle('hidden', !text);
    if (isError) {
      messageEl.classList.add('production-error');
    } else {
      messageEl.classList.remove('production-error');
    }
  }

  async function runSearch(searchText) {
    const q = new URLSearchParams({
      searchText: searchText.trim(),
      database: String(session.database).toUpperCase(),
    });
    const url = `${API_BASE_URL}/production/search-by-job-card?${q.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    if (!data.status) {
      throw new Error(data.error || 'Search failed');
    }
    return Array.isArray(data.rows) ? data.rows : [];
  }

  async function callReverse(productionId) {
    const userId = session.userId;
    if (userId == null || userId === '' || !Number.isInteger(Number(userId))) {
      throw new Error('Missing user id. Sign out and sign in again.');
    }
    const res = await fetch(`${API_BASE_URL}/production/reverse`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserID: Number(userId),
        ProductionID: Number(productionId),
        database: String(session.database).toUpperCase(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    if (!data.status) {
      throw new Error(data.error || 'Reverse request failed');
    }
    return data;
  }

  function renderRows(rows) {
    if (!tbody) return;
    tbody.innerHTML = rows
      .map((row) => {
        const tds = DISPLAY_COLS.map(
          (col) => `<td title="${escapeHtml(cellValue(row, col))}">${escapeHtml(cellValue(row, col))}</td>`
        ).join('');
        const prodId = cellValue(row, 'ProductionID');
        const pid = prodId !== '' && prodId != null ? String(prodId).trim() : '';
        const disabled = !pid || Number.isNaN(Number(pid));
        const actionCell = `<td class="production-col-actions">
          <button type="button" class="btn-production-reverse-x" data-production-id="${escapeHtml(pid)}" title="Reverse production" ${disabled ? 'disabled' : ''} aria-label="Reverse production">×</button>
        </td>`;
        return `<tr>${tds}${actionCell}</tr>`;
      })
      .join('');

    const hasRows = rows.length > 0;
    resultsWrap.classList.toggle('hidden', !hasRows);
    emptyEl.classList.toggle('hidden', hasRows);
    showMessage('', false);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = (input && input.value) ? input.value.trim() : '';
    if (raw.length < 4) {
      showMessage('Enter at least 4 characters.', true);
      return;
    }

    submitBtn.disabled = true;
    showMessage('Searching…', false);
    resultsWrap.classList.add('hidden');
    emptyEl.classList.add('hidden');
    tbody.innerHTML = '';

    try {
      const rows = await runSearch(raw);
      lastSearchText = raw;
      renderRows(rows);
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'Search failed', true);
      resultsWrap.classList.add('hidden');
      emptyEl.classList.add('hidden');
    } finally {
      submitBtn.disabled = false;
    }
  });

  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-production-reverse-x');
      if (!btn || btn.disabled) return;
      const productionId = btn.getAttribute('data-production-id');
      if (!productionId || lastSearchText.length < 4) return;

      btn.disabled = true;
      showMessage('Reversing…', false);

      try {
        const data = await callReverse(productionId);
        if (data.reversed) {
          const rows = await runSearch(lastSearchText);
          renderRows(rows);
          showMessage('Reversed successfully.', false);
        } else {
          showMessage(data.spStatus || 'Reverse failed.', true);
        }
      } catch (err) {
        console.error(err);
        showMessage(err.message || 'Reverse failed', true);
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
