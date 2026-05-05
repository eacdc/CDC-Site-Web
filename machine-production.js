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

  const COLS = [
    'ProductionDate',
    'UserName',
    'FormNo',
    'JobCardContentNo',
    'ProcessName',
    'ClientName',
    'JobName',
    'ScheduledQty',
    'ProductionQty',
    'Status',
  ];

  let allRows = [];
  let filterValues = new Array(COLS.length).fill('');

  // ── Session ──────────────────────────────────────────────────────────────

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  const session = getSession();
  if (!session || !session.database) {
    window.location.replace('index.html' + (window.location.search || ''));
    return;
  }

  // ── DOM refs ─────────────────────────────────────────────────────────────

  const linkBack = document.getElementById('link-back-home');
  const userInfoEl = document.getElementById('user-info');
  const form = document.getElementById('mwp-form');
  const startInput = document.getElementById('mwp-start-date');
  const endInput = document.getElementById('mwp-end-date');
  const machineSelect = document.getElementById('mwp-machine');
  const submitBtn = document.getElementById('mwp-submit');
  const messageEl = document.getElementById('mwp-message');
  const loadingEl = document.getElementById('mwp-loading');
  const resultsWrap = document.getElementById('mwp-results-wrap');
  const tbody = document.getElementById('mwp-tbody');
  const emptyEl = document.getElementById('mwp-empty');
  const statusBar = document.getElementById('mwp-status-bar');
  const rowCountEl = document.getElementById('mwp-row-count');
  const filterCountEl = document.getElementById('mwp-filter-count');
  const filterInputs = document.querySelectorAll('.mwp-col-filter');
  const datePickerButtons = document.querySelectorAll('.mwp-date-picker-btn');

  // ── Init ─────────────────────────────────────────────────────────────────

  if (linkBack) {
    linkBack.href = 'index.html' + (window.location.search || '');
  }

  if (userInfoEl) {
    userInfoEl.textContent = `${session.username || 'User'} (${session.database || ''})`;
    userInfoEl.classList.remove('hidden');
  }

  // Default date range: last 30 days → today
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  if (endInput) endInput.value = formatDateInput(today);
  if (startInput) startInput.value = formatDateInput(thirtyDaysAgo);

  datePickerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target-input');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input || input.type !== 'date') return;
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
      input.focus();
      input.click();
    });
  });

  // Populate machine dropdown
  const machines = (session.machines || []).slice().sort((a, b) => {
    const na = (a.machineName || a.MachineName || '').toLowerCase();
    const nb = (b.machineName || b.MachineName || '').toLowerCase();
    return na < nb ? -1 : na > nb ? 1 : 0;
  });

  machines.forEach((m) => {
    const id = m.machineId || m.MachineID || '';
    const name = m.machineName || m.MachineName || `Machine ${id}`;
    const opt = document.createElement('option');
    opt.value = String(id);
    opt.textContent = name;
    machineSelect.appendChild(opt);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function formatDateInput(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatProductionDate(val) {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${mo}-${day} ${h}:${min}`;
    } catch (e) {
      return String(val);
    }
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cellValue(row, col) {
    if (!row) return '';
    if (row[col] !== undefined && row[col] !== null) return row[col];
    const lower = col.charAt(0).toLowerCase() + col.slice(1);
    if (row[lower] !== undefined && row[lower] !== null) return row[lower];
    const match = Object.keys(row).find((k) => k.toLowerCase() === col.toLowerCase());
    return match != null ? row[match] : '';
  }

  function statusClass(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'complete' || s === 'completed') return 'mwp-status-complete';
    if (s === 'running' || s === 'in progress' || s === 'inprogress') return 'mwp-status-running';
    if (s === 'pending') return 'mwp-status-pending';
    return 'mwp-status-other';
  }

  function showMessage(text, isError) {
    if (!messageEl) return;
    messageEl.textContent = text || '';
    messageEl.classList.toggle('hidden', !text);
    messageEl.classList.toggle('mwp-message--error', !!isError);
    messageEl.classList.toggle('mwp-message--info', !isError && !!text);
  }

  function setLoading(on) {
    loadingEl && loadingEl.classList.toggle('hidden', !on);
    if (submitBtn) submitBtn.disabled = on;
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  function applyFilters() {
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    let visible = 0;
    const hasFilter = filterValues.some((v) => v !== '');

    rows.forEach((tr) => {
      const cells = tr.querySelectorAll('td');
      let show = true;
      filterValues.forEach((fv, ci) => {
        if (!fv) return;
        const cellText = (cells[ci] ? cells[ci].textContent : '').toLowerCase();
        if (!cellText.includes(fv.toLowerCase())) show = false;
      });
      tr.classList.toggle('mwp-row-hidden', !show);
      if (show) visible++;
    });

    if (filterCountEl) {
      if (hasFilter) {
        filterCountEl.textContent = `${visible} of ${allRows.length} shown`;
        filterCountEl.classList.remove('hidden');
      } else {
        filterCountEl.classList.add('hidden');
      }
    }
  }

  filterInputs.forEach((input) => {
    input.addEventListener('input', () => {
      const col = Number(input.getAttribute('data-col'));
      filterValues[col] = input.value;
      applyFilters();
    });
  });

  // ── Render ────────────────────────────────────────────────────────────────

  function renderRows(rows) {
    if (!tbody) return;

    tbody.innerHTML = rows
      .map((row) => {
        const tds = COLS.map((col, i) => {
          let val = cellValue(row, col);
          let display = val != null ? String(val) : '';
          if (col === 'ProductionDate') display = formatProductionDate(val);
          if (col === 'Status') {
            return `<td data-col="${i}"><span class="mwp-status-badge ${escapeHtml(statusClass(val))}">${escapeHtml(display)}</span></td>`;
          }
          return `<td data-col="${i}" title="${escapeHtml(display)}">${escapeHtml(display)}</td>`;
        }).join('');
        return `<tr>${tds}</tr>`;
      })
      .join('');

    const hasRows = rows.length > 0;
    resultsWrap.classList.toggle('hidden', !hasRows);
    emptyEl.classList.toggle('hidden', hasRows);
    showMessage('', false);

    if (statusBar && rowCountEl) {
      rowCountEl.textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;
      statusBar.classList.toggle('hidden', !hasRows);
    }

    // Reset filters
    filterValues.fill('');
    filterInputs.forEach((inp) => { inp.value = ''; });
    if (filterCountEl) filterCountEl.classList.add('hidden');
  }

  // ── API call ──────────────────────────────────────────────────────────────

  async function fetchData(startDate, endDate, machineId) {
    const q = new URLSearchParams({
      startDate,
      endDate,
      machineId: String(machineId),
      database: String(session.database).toUpperCase(),
    });
    const url = `${API_BASE_URL}/production/search-by-machine?${q.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    if (!data.status) throw new Error(data.error || 'Fetch failed');
    return Array.isArray(data.rows) ? data.rows : [];
  }

  // ── Form submit ───────────────────────────────────────────────────────────

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const start = startInput.value.trim();
    const end = endInput.value.trim();
    const machineId = machineSelect.value;

    if (!start || !end) {
      showMessage('Please select a start and end date.', true);
      return;
    }
    if (new Date(start) > new Date(end)) {
      showMessage('Start date must be on or before end date.', true);
      return;
    }
    if (!machineId) {
      showMessage('Please select a machine.', true);
      return;
    }

    showMessage('', false);
    resultsWrap.classList.add('hidden');
    emptyEl.classList.add('hidden');
    statusBar && statusBar.classList.add('hidden');
    if (tbody) tbody.innerHTML = '';
    setLoading(true);

    try {
      const rows = await fetchData(start, end, machineId);
      allRows = rows;
      renderRows(rows);
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'Failed to load data', true);
      resultsWrap.classList.add('hidden');
      emptyEl.classList.add('hidden');
    } finally {
      setLoading(false);
    }
  });
})();
