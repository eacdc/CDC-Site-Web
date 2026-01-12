(function() {
  'use strict';

  // API Configuration
  const API_BASE_URL = 'https://cdcapi.onrender.com/api';

  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // State management
  const state = {
    currentUsername: null,
    currentUserId: null,
    currentLedgerId: null,
    selectedDatabase: null,
    machines: [],
    selectedMachine: null,
    processes: [],
    runningProcesses: new Map(), // processKey -> { startTime, process }
    currentJobCardNo: null,
    uniqueJobNumbers: [], // Store unique job numbers for voice notes
    displayedProcessCount: 10,
    qrScanner: null,
    currentScreen: 'login', // Track current screen for history management
    instructionsSearchTimeout: null, // For debouncing job number search
  };

  // Session storage keys
  const SESSION_KEY = 'cdc_session';
  const SESSION_ID_KEY = 'cdc_session_id';

  // DOM Elements
  const elements = {
    // Sections
    loginSection: document.getElementById('login-section'),
    machineSection: document.getElementById('machine-section'),
    searchSection: document.getElementById('search-section'),
    processListSection: document.getElementById('process-list-section'),
    runningProcessSection: document.getElementById('running-process-section'),
    runningMachinesSection: document.getElementById('running-machines-section'),
    instructionsSearchSection: document.getElementById('instructions-search-section'),
    instructionsResultsSection: document.getElementById('instructions-results-section'),
    
    // Login
    loginForm: document.getElementById('login-form'),
    usernameInput: document.getElementById('username'),
    databaseSelect: document.getElementById('database'),
    loginError: document.getElementById('login-error'),
    
    // Header
    userInfo: document.getElementById('user-info'),
    logoutBtn: document.getElementById('btn-logout'),
    
    // Machines
    machinesList: document.getElementById('machines-list'),
    viewRunningMachinesBtn: document.getElementById('btn-view-running-machines'),
    backToMachinesFromRunningBtn: document.getElementById('btn-back-to-machines-from-running'),
    
    // Running Machines
    runningMachinesList: document.getElementById('running-machines-list'),
    noRunningMachines: document.getElementById('no-running-machines'),
    showInstructionsBtn: document.getElementById('btn-show-instructions'),
    
    // Instructions Search
    instructionsManualEntryContainer: document.getElementById('instructions-manual-entry-container'),
    instructionsJobNumberInput: document.getElementById('instructions-job-number'),
    instructionsJobNumberDropdown: document.getElementById('instructions-job-number-dropdown'),
    searchInstructionsBtn: document.getElementById('btn-search-instructions'),
    backToRunningMachinesBtn: document.getElementById('btn-back-to-running-machines'),
    
    // Instructions Results
    instructionsLoading: document.getElementById('instructions-loading'),
    instructionsEmpty: document.getElementById('instructions-empty'),
    instructionsList: document.getElementById('instructions-list'),
    instructionsJobNumberDisplay: document.getElementById('instructions-job-number-display'),
    backToInstructionsSearchBtn: document.getElementById('btn-back-to-instructions-search'),
    
    // Search
    tabQr: document.getElementById('tab-qr'),
    tabManual: document.getElementById('tab-manual'),
    qrScannerContainer: document.getElementById('qr-scanner-container'),
    manualEntryContainer: document.getElementById('manual-entry-container'),
    jobCardNoInput: document.getElementById('job-card-no'),
    searchManualBtn: document.getElementById('btn-search-manual'),
    selectedMachineName: document.getElementById('selected-machine-name'),
    backToMachinesBtn: document.getElementById('btn-back-to-machines'),
    
    // Process List
    processMachineName: document.getElementById('process-machine-name'),
    processJobCard: document.getElementById('process-job-card'),
    runningProcessesContainer: document.getElementById('running-processes-container'),
    runningProcessesList: document.getElementById('running-processes-list'),
    runningCount: document.getElementById('running-count'),
    pendingProcessesContainer: document.getElementById('pending-processes-container'),
    pendingProcessesList: document.getElementById('pending-processes-list'),
    pendingCount: document.getElementById('pending-count'),
    noProcessesFound: document.getElementById('no-processes-found'),
    loadMoreContainer: document.getElementById('load-more-container'),
    loadMoreBtn: document.getElementById('btn-load-more'),
    backToSearchBtn: document.getElementById('btn-back-to-search'),
    
    // Running Process
    runningProcessDetails: document.getElementById('running-process-details'),
    
    // Voice Notes Modal
    voiceNotesBtn: document.getElementById('btn-voice-notes'),
    voiceNotesModal: document.getElementById('voice-notes-modal'),
    voiceNotesModalClose: document.getElementById('btn-voice-notes-modal-close'),
    voiceNotesLoading: document.getElementById('voice-notes-loading'),
    voiceNotesEmpty: document.getElementById('voice-notes-empty'),
    voiceNotesTableContainer: document.getElementById('voice-notes-table-container'),
    voiceNotesTableBody: document.getElementById('voice-notes-table-body'),
    voiceNotesModalTitle: document.getElementById('voice-notes-modal-title'),
    
    // Loading
    loadingOverlay: document.getElementById('loading-overlay'),
  };

  // Helper Functions
  function showLoading() {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.classList.remove('hidden');
      // Reset loading message to default
      const loadingMessage = elements.loadingOverlay.querySelector('p');
      if (loadingMessage) {
        loadingMessage.textContent = 'Loading...';
      }
    }
  }

  function hideLoading() {
    elements.loadingOverlay?.classList.add('hidden');
  }

  function showError(message, element = elements.loginError) {
    if (element) {
      element.textContent = message;
    }
  }

  function clearError(element = elements.loginError) {
    if (element) {
      element.textContent = '';
    }
  }

  // Voice Notes Functions
  function closeVoiceNotesModal() {
    elements.voiceNotesModal?.classList.add('hidden');
  }

  function openVoiceNotesModal() {
    if (!elements.voiceNotesModal) return;
    elements.voiceNotesModal.classList.remove('hidden');
  }

  // Convert UTC to IST and format
  function formatDateToIST(dateString) {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '-';
      
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(date.getTime() + istOffset);
      
      // Format as DD-MM-YYYY HH:MM:SS
      const day = String(istDate.getUTCDate()).padStart(2, '0');
      const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
      const year = istDate.getUTCFullYear();
      const hours = String(istDate.getUTCHours()).padStart(2, '0');
      const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }

  // Fetch voice notes for a job number
  async function fetchVoiceNotes(jobNumber) {
    try {
      const url = `https://cdcapi.onrender.com/api/voice-note-tool/audio/job/${encodeURIComponent(jobNumber)}/all`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voice notes: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching voice notes:', error);
      throw error;
    }
  }

  // Create audio element from base64 blob
  function createAudioElement(audioBlob, mimeType) {
    if (!audioBlob) return null;
    
    try {
      // Convert base64 to blob
      const binaryString = atob(audioBlob);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = url;
      audio.preload = 'metadata';
      
      return audio;
    } catch (error) {
      console.error('Error creating audio element:', error);
      return null;
    }
  }

  // Track currently playing audio
  let currentAudioCell = null;
  let currentAudioData = null;

  // Show summary in alert/popup
  function showSummaryPopup(summary) {
    if (!summary || summary === '-') {
      alert('No summary available');
      return;
    }
    alert(summary);
  }

  // Convert audio player back to play button
  function convertAudioToButton(cell, audioBlob, audioMimeType) {
    const playBtn = document.createElement('button');
    playBtn.className = 'btn-play-audio';
    playBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    playBtn.title = 'Play Audio';
    
    playBtn.addEventListener('click', () => {
      handleAudioPlayClick(cell, audioBlob, audioMimeType);
    });
    
    // Clear the cell and add the button
    cell.innerHTML = '';
    cell.appendChild(playBtn);
  }

  // Handle audio play button click
  function handleAudioPlayClick(cell, audioBlob, audioMimeType) {
    // If there's currently an audio player open, convert it back to a button
    if (currentAudioCell && currentAudioCell !== cell && currentAudioData) {
      convertAudioToButton(currentAudioCell, currentAudioData.blob, currentAudioData.mimeType);
    }
    
    // Create and play the new audio
    const audioElement = createAudioElement(audioBlob, audioMimeType);
    if (audioElement) {
      // Store current audio info
      currentAudioCell = cell;
      currentAudioData = { blob: audioBlob, mimeType: audioMimeType };
      
      // Replace button with audio player
      cell.innerHTML = '';
      cell.appendChild(audioElement);
      
      // Auto-play the audio
      audioElement.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      
      // Listen for when audio ends to convert back to button
      audioElement.addEventListener('ended', () => {
        convertAudioToButton(cell, audioBlob, audioMimeType);
        currentAudioCell = null;
        currentAudioData = null;
      });
    } else {
      alert('Unable to play audio');
    }
  }

  // Render grouped voice notes table (collapsible by job number)
  function renderGroupedVoiceNotesTable(voiceNotes) {
    if (!elements.voiceNotesTableBody) return;
    
    elements.voiceNotesLoading?.classList.add('hidden');
    
    if (!voiceNotes || voiceNotes.length === 0) {
      elements.voiceNotesEmpty?.classList.remove('hidden');
      elements.voiceNotesTableContainer?.classList.add('hidden');
      return;
    }
    
    elements.voiceNotesEmpty?.classList.add('hidden');
    elements.voiceNotesTableContainer?.classList.remove('hidden');
    
    elements.voiceNotesTableBody.innerHTML = '';
    
    // Reset current audio tracking
    currentAudioCell = null;
    currentAudioData = null;
    
    // Group voice notes by job number
    const groupedNotes = {};
    voiceNotes.forEach(note => {
      const jobNum = note.jobNumber || 'Unknown';
      if (!groupedNotes[jobNum]) {
        groupedNotes[jobNum] = [];
      }
      groupedNotes[jobNum].push(note);
    });
    
    // Render each group
    Object.keys(groupedNotes).sort().forEach((jobNumber, groupIndex) => {
      const notes = groupedNotes[jobNumber];
      const groupId = `job-group-${groupIndex}`;
      
      // Create group header row
      const headerRow = document.createElement('tr');
      headerRow.className = 'voice-notes-group-header';
      headerRow.innerHTML = `
        <td colspan="5" class="group-header-cell">
          <button class="group-toggle-btn" data-group-id="${groupId}">
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
            <span class="job-number-label">${jobNumber}</span>
            <span class="notes-count">${notes.length} recording(s)</span>
          </button>
        </td>
      `;
      
      headerRow.addEventListener('click', () => {
        toggleGroup(groupId);
      });
      
      elements.voiceNotesTableBody.appendChild(headerRow);
      
      // Create rows for this group (initially hidden)
      notes.forEach((note, noteIndex) => {
        const row = document.createElement('tr');
        row.className = `voice-notes-group-content ${groupId} hidden`;
        
        // Department
        const deptCell = document.createElement('td');
        deptCell.textContent = note.department || note.toDepartment || '-';
        row.appendChild(deptCell);
        
        // Audio
        const audioCell = document.createElement('td');
        if (note.audioBlob) {
          const playBtn = document.createElement('button');
          playBtn.className = 'btn-play-audio';
          playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          `;
          playBtn.title = 'Play Audio';
          
          playBtn.addEventListener('click', () => {
            handleAudioPlayClick(audioCell, note.audioBlob, note.audioMimeType);
          });
          
          audioCell.appendChild(playBtn);
        } else {
          audioCell.textContent = '-';
        }
        row.appendChild(audioCell);
        
        // Summary
        const summaryCell = document.createElement('td');
        const summary = note.summary || '-';
        
        if (summary !== '-') {
          const eyeBtn = document.createElement('button');
          eyeBtn.className = 'btn-view-summary';
          eyeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          `;
          eyeBtn.title = 'View Summary';
          
          eyeBtn.addEventListener('click', () => {
            showSummaryPopup(summary);
          });
          
          summaryCell.appendChild(eyeBtn);
        } else {
          summaryCell.textContent = '-';
        }
        row.appendChild(summaryCell);
        
        // Created By
        const createdByCell = document.createElement('td');
        createdByCell.textContent = note.createdBy || '-';
        row.appendChild(createdByCell);
        
        // Created At (IST)
        const createdAtCell = document.createElement('td');
        createdAtCell.textContent = formatDateToIST(note.createdAt);
        row.appendChild(createdAtCell);
        
        elements.voiceNotesTableBody.appendChild(row);
      });
    });
  }

  // Toggle group visibility
  function toggleGroup(groupId) {
    const groupRows = document.querySelectorAll(`.${groupId}`);
    const headerBtn = document.querySelector(`[data-group-id="${groupId}"]`);
    const chevron = headerBtn?.querySelector('.chevron-icon');
    
    groupRows.forEach(row => {
      row.classList.toggle('hidden');
    });
    
    // Rotate chevron
    if (chevron) {
      chevron.classList.toggle('rotated');
    }
  }

  // Render voice notes table (legacy function - kept for compatibility)
  function renderVoiceNotesTable(voiceNotes) {
    if (!elements.voiceNotesTableBody) return;
    
    elements.voiceNotesLoading?.classList.add('hidden');
    
    if (!voiceNotes || voiceNotes.length === 0) {
      elements.voiceNotesEmpty?.classList.remove('hidden');
      elements.voiceNotesTableContainer?.classList.add('hidden');
      return;
    }
    
    elements.voiceNotesEmpty?.classList.add('hidden');
    elements.voiceNotesTableContainer?.classList.remove('hidden');
    
    elements.voiceNotesTableBody.innerHTML = '';
    
    // Reset current audio tracking
    currentAudioCell = null;
    currentAudioData = null;
    
    voiceNotes.forEach((note, index) => {
      const row = document.createElement('tr');
      
      // Department
      const deptCell = document.createElement('td');
      deptCell.textContent = note.department || note.toDepartment || '-';
      row.appendChild(deptCell);
      
      // Audio
      const audioCell = document.createElement('td');
      if (note.audioBlob) {
        const playBtn = document.createElement('button');
        playBtn.className = 'btn-play-audio';
        playBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
        playBtn.title = 'Play Audio';
        
        playBtn.addEventListener('click', () => {
          handleAudioPlayClick(audioCell, note.audioBlob, note.audioMimeType);
        });
        
        audioCell.appendChild(playBtn);
      } else {
        audioCell.textContent = '-';
      }
      row.appendChild(audioCell);
      
      // Summary
      const summaryCell = document.createElement('td');
      const summary = note.summary || '-';
      
      if (summary !== '-') {
        const eyeBtn = document.createElement('button');
        eyeBtn.className = 'btn-view-summary';
        eyeBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        `;
        eyeBtn.title = 'View Summary';
        
        eyeBtn.addEventListener('click', () => {
          showSummaryPopup(summary);
        });
        
        summaryCell.appendChild(eyeBtn);
      } else {
        summaryCell.textContent = '-';
      }
      row.appendChild(summaryCell);
      
      // Created By
      const createdByCell = document.createElement('td');
      createdByCell.textContent = note.createdBy || '-';
      row.appendChild(createdByCell);
      
      // Created At (IST)
      const createdAtCell = document.createElement('td');
      createdAtCell.textContent = formatDateToIST(note.createdAt);
      row.appendChild(createdAtCell);
      
      elements.voiceNotesTableBody.appendChild(row);
    });
  }

  // Handle voice notes button click
  async function handleVoiceNotesClick() {
    const jobNumbers = state.uniqueJobNumbers;
    
    if (!jobNumbers || jobNumbers.length === 0) {
      alert('Job number not available');
      return;
    }
    
    openVoiceNotesModal();
    
    if (elements.voiceNotesModalTitle) {
      const displayText = jobNumbers.length === 1 
        ? `Voice Notes - ${jobNumbers[0]}` 
        : `Voice Notes - ${jobNumbers.length} Job(s)`;
      elements.voiceNotesModalTitle.textContent = displayText;
    }
    
    // Show loading state
    elements.voiceNotesLoading?.classList.remove('hidden');
    elements.voiceNotesEmpty?.classList.add('hidden');
    elements.voiceNotesTableContainer?.classList.add('hidden');
    
    try {
      // Fetch voice notes for all unique job numbers
      const allVoiceNotes = [];
      
      for (const jobNumber of jobNumbers) {
        try {
          const notes = await fetchVoiceNotes(jobNumber);
          // Add job number to each note
          notes.forEach(note => {
            note.jobNumber = jobNumber;
          });
          allVoiceNotes.push(...notes);
        } catch (error) {
          console.error(`Error fetching voice notes for ${jobNumber}:`, error);
        }
      }
      
      renderGroupedVoiceNotesTable(allVoiceNotes);
    } catch (error) {
      console.error('Error loading voice notes:', error);
      elements.voiceNotesLoading?.classList.add('hidden');
      elements.voiceNotesEmpty?.classList.remove('hidden');
      elements.voiceNotesTableContainer?.classList.add('hidden');
    }
  }

  // Session Management
  function saveSession(sessionData) {
    try {
      // Generate a unique session ID for this login
      const sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      console.log('Session saved:', sessionId);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  function loadSession() {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      clearSession();
    }
    return null;
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      console.log('Session cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  function getSessionId() {
    return localStorage.getItem(SESSION_ID_KEY);
  }

  function restoreSession() {
    const sessionData = loadSession();
    if (sessionData) {
      // Restore state from session
      state.currentUsername = sessionData.username;
      state.currentUserId = sessionData.userId;
      state.currentLedgerId = sessionData.ledgerId;
      state.selectedDatabase = sessionData.database;
      state.machines = sessionData.machines || [];
      
      updateUserInfo();
      showMachineSelection();
      console.log('Session restored for user:', sessionData.username);
      return true;
    }
    return false;
  }

  // Cross-tab session synchronization
  window.addEventListener('storage', (event) => {
    // Listen for changes to session storage
    if (event.key === SESSION_KEY) {
      if (event.newValue === null) {
        // Session was cleared (logout)
        console.log('Session cleared in another tab, logging out...');
        logout();
      } else if (event.oldValue !== null) {
        // Session was updated (new login in another tab)
        const newSession = JSON.parse(event.newValue);
        const currentSessionId = getSessionId();
        const newSessionId = localStorage.getItem(SESSION_ID_KEY);
        
        // If session ID changed, it means user logged in from another tab
        if (currentSessionId && newSessionId && currentSessionId !== newSessionId) {
          console.log('New login detected in another tab, logging out current session...');
          // Don't call logout() here as it will trigger another storage event
          // Just clear local state and show login
          state.currentUsername = null;
          state.currentUserId = null;
          state.currentLedgerId = null;
          state.selectedDatabase = null;
          state.machines = [];
          state.selectedMachine = null;
          state.processes = [];
          state.runningProcesses.clear();
          state.currentJobCardNo = null;
          
          if (elements.userInfo) {
            elements.userInfo.classList.add('hidden');
          }
          if (elements.logoutBtn) {
            elements.logoutBtn.classList.add('hidden');
          }
          
          stopQrScanner();
          
          alert('You have been logged out because a new login was detected in another tab.');
          
          // Clear browser history and go to login
          history.replaceState({ screen: 'login' }, '', '#login');
          showSection(elements.loginSection, 'login');
        }
      }
    }
  });

  function showSection(section, screenName = null) {
    // Stop QR scanners when switching sections
    if (section !== elements.searchSection) {
      stopQrScanner();
    }

    // Hide all sections
    Object.values(elements).forEach(el => {
      if (el && el.classList && (
        el.id === 'login-section' ||
        el.id === 'machine-section' ||
        el.id === 'search-section' ||
        el.id === 'process-list-section' ||
        el.id === 'running-process-section' ||
        el.id === 'running-machines-section' ||
        el.id === 'instructions-search-section' ||
        el.id === 'instructions-results-section'
      )) {
        el.classList.add('hidden');
      }
    });
    
    // Show target section
    if (section) {
      section.classList.remove('hidden');
      
      // Update current screen state
      if (screenName) {
        state.currentScreen = screenName;
        
        // Push state to history (except for login which should be initial)
        if (screenName !== 'login') {
          history.pushState({ screen: screenName }, '', `#${screenName}`);
        }
      }
      
      // Hide logout button on running process screen, show on other screens
      if (screenName === 'running-process') {
        if (elements.logoutBtn) {
          elements.logoutBtn.classList.add('hidden');
        }
      } else if (screenName !== 'login') {
        // Show logout button for all screens except login and running-process
        if (elements.logoutBtn) {
          elements.logoutBtn.classList.remove('hidden');
        }
      }
    }
  }

  async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // Create abort controller for timeout (3 minutes for process operations)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Operation took too long. Please try again.');
      }
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication
  async function login(username, database) {
    showLoading();
    clearError();
    
    try {
      const data = await apiRequest(`auth/login?username=${encodeURIComponent(username)}&database=${encodeURIComponent(database)}&_t=${Date.now()}`);
      
      if (data.status === true) {
        state.currentUsername = username;
        state.currentUserId = data.userId;
        state.currentLedgerId = data.ledgerId;
        state.selectedDatabase = database;
        state.machines = data.machines || [];
        
        // Save session to localStorage
        const sessionData = {
          username,
          userId: data.userId,
          ledgerId: data.ledgerId,
          database,
          machines: data.machines || [],
        };
        saveSession(sessionData);
        
        updateUserInfo();
        showMachineSelection();
        return true;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      showError(error.message);
      return false;
    } finally {
      hideLoading();
    }
  }

  function updateUserInfo() {
    if (elements.userInfo) {
      elements.userInfo.textContent = `${state.currentUsername} (${state.selectedDatabase})`;
      elements.userInfo.classList.remove('hidden');
    }
    if (elements.logoutBtn) {
      elements.logoutBtn.classList.remove('hidden');
    }
  }

  function logout() {
    state.currentUsername = null;
    state.currentUserId = null;
    state.currentLedgerId = null;
    state.selectedDatabase = null;
    state.machines = [];
    state.selectedMachine = null;
    state.processes = [];
    state.runningProcesses.clear();
    state.currentJobCardNo = null;
    
    if (elements.userInfo) {
      elements.userInfo.classList.add('hidden');
    }
    if (elements.logoutBtn) {
      elements.logoutBtn.classList.add('hidden');
    }
    
    stopQrScanner();
    
    // Clear session from localStorage
    clearSession();
    
    // Clear browser history and go to login
    history.replaceState({ screen: 'login' }, '', '#login');
    showSection(elements.loginSection, 'login');
  }

  // Machine Selection
  function showMachineSelection() {
    renderMachines();
    showSection(elements.machineSection, 'machines');
  }

  function renderMachines() {
    if (!elements.machinesList) return;
    
    elements.machinesList.innerHTML = state.machines.map(machine => {
      // Handle both camelCase and PascalCase
      const machineId = machine.MachineID || machine.machineId;
      const machineName = machine.MachineName || machine.machineName;
      
      return `
        <div class="machine-card" data-machine-id="${machineId}">
          <div class="machine-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
          </div>
          <h3>${machineName}</h3>
          <span class="machine-id">ID: ${machineId}</span>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    elements.machinesList.querySelectorAll('.machine-card').forEach(card => {
      card.addEventListener('click', () => {
        const machineId = parseInt(card.dataset.machineId);
        
        const machine = state.machines.find(m => {
          // Convert both to numbers for comparison (IDs come as strings from backend)
          const mId = parseInt(m.MachineID || m.machineId);
          return mId === machineId;
        });
        
        if (machine) {
          selectMachine(machine);
        } else {
          console.error('Machine not found:', machineId, 'Available machines:', state.machines);
        }
      });
    });
  }

  function selectMachine(machine) {
    state.selectedMachine = machine;
    state.processes = [];
    state.currentJobCardNo = null;
    state.displayedProcessCount = 10;
    
    // Handle both camelCase and PascalCase
    const machineName = machine.MachineName || machine.machineName;
    
    if (elements.selectedMachineName) {
      elements.selectedMachineName.textContent = machineName;
    }
    
    console.log('Machine selected:', machineName);
    showSearchSection();
  }

  // Search Section
  function showSearchSection() {
    showSection(elements.searchSection, 'search');
    
    // Restore machine name if a machine is selected
    if (state.selectedMachine && elements.selectedMachineName) {
      const machineName = state.selectedMachine.MachineName || state.selectedMachine.machineName;
      elements.selectedMachineName.textContent = machineName;
      console.log('Restored machine name:', machineName);
    }
    
    startQrScanner();
  }

  function startQrScanner() {
    if (!elements.qrScannerContainer || state.qrScanner) return;
    
    try {
      const qrReader = document.getElementById('qr-reader');
      if (!qrReader) return;
      
      const scanner = new Html5Qrcode("qr-reader");
      
      scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleQrScan(decodedText);
        },
        (error) => {
          // Ignore scan errors
        }
      ).then(() => {
        // Scanner started successfully
        state.qrScanner = scanner;
      }).catch(err => {
        console.error('QR Scanner error:', err);
        // Don't set state.qrScanner if it failed to start
        state.qrScanner = null;
      });
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      state.qrScanner = null;
    }
  }

  function stopQrScanner() {
    if (state.qrScanner) {
      // Check if scanner is actually running before trying to stop
      const scannerState = state.qrScanner.getState();
      if (scannerState === 2) { // 2 = SCANNING state
        state.qrScanner.stop().catch(err => console.error('Error stopping scanner:', err));
      }
      state.qrScanner = null;
    }
  }

  function handleQrScan(jobCardNo) {
    stopQrScanner();
    searchProcesses(jobCardNo.trim());
  }

  // Process Search
  async function searchProcesses(jobCardNo, isManualEntry = false) {
    if (!jobCardNo) {
      alert('Please enter a job card number');
      return;
    }
    
    state.currentJobCardNo = jobCardNo;
    showLoading();
    
    try {
      // Handle both camelCase and PascalCase
      const machineId = state.selectedMachine.MachineID || state.selectedMachine.machineId;
      
      const data = await apiRequest(
        `processes/pending?UserID=${state.currentUserId}&MachineID=${machineId}&jobcardcontentno=${encodeURIComponent(jobCardNo)}&isManualEntry=${isManualEntry}&database=${state.selectedDatabase}`
      );
      
      if (data.status === true) {
        state.processes = data.processes || [];
        state.displayedProcessCount = 10;
        
        // Extract unique job numbers (part before [)
        const jobNumbers = new Set();
        state.processes.forEach(process => {
          const jobCardNo = process.JobCardContentNo || process.jobcardContentNo || '';
          if (jobCardNo) {
            // Extract part before [ if it exists
            const cleanJobNumber = jobCardNo.split('[')[0].trim();
            if (cleanJobNumber) {
              jobNumbers.add(cleanJobNumber);
            }
          }
        });
        state.uniqueJobNumbers = Array.from(jobNumbers);
        
        showProcessList();
      } else {
        throw new Error(data.error || 'Failed to fetch processes');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      hideLoading();
    }
  }

  // Process List
  function showProcessList() {
    // Handle both camelCase and PascalCase
    const machineName = state.selectedMachine.MachineName || state.selectedMachine.machineName;
    
    if (elements.processMachineName) {
      elements.processMachineName.textContent = machineName;
    }
    if (elements.processJobCard) {
      elements.processJobCard.textContent = state.currentJobCardNo;
    }
    
    renderProcessList();
    showSection(elements.processListSection, 'process-list');
  }

  function renderProcessList() {
    const runningProcesses = state.processes.filter(p => {
      const status = p.CurrentStatus || p.currentStatus || '';
      return status.trim().toLowerCase() === 'running';
    });
    const pendingProcesses = state.processes.filter(p => {
      const status = p.CurrentStatus || p.currentStatus || '';
      return status.trim().toLowerCase() !== 'running';
    });
    
    // Sort pending processes by PWO date (old to new)
    const sortedPendingProcesses = pendingProcesses.sort((a, b) => {
      try {
        const dateA = new Date(a.PWODate || a.pwoDate);
        const dateB = new Date(b.PWODate || b.pwoDate);
        return dateA - dateB;
      } catch {
        return 0;
      }
    });
    
    const displayedPendingProcesses = sortedPendingProcesses.slice(0, state.displayedProcessCount);
    
    // Show/hide containers
    if (runningProcesses.length > 0) {
      elements.runningProcessesContainer?.classList.remove('hidden');
      if (elements.runningCount) elements.runningCount.textContent = runningProcesses.length;
      renderProcessCards(runningProcesses, elements.runningProcessesList, 0, true);
    } else {
      elements.runningProcessesContainer?.classList.add('hidden');
    }
    
    if (sortedPendingProcesses.length > 0) {
      elements.pendingProcessesContainer?.classList.remove('hidden');
      if (elements.pendingCount) {
        elements.pendingCount.textContent = `${displayedPendingProcesses.length} of ${sortedPendingProcesses.length}`;
      }
      renderProcessCards(displayedPendingProcesses, elements.pendingProcessesList, runningProcesses.length, false);
      
      // Show/hide load more button
      if (displayedPendingProcesses.length < sortedPendingProcesses.length) {
        elements.loadMoreContainer?.classList.remove('hidden');
      } else {
        elements.loadMoreContainer?.classList.add('hidden');
      }
    } else {
      elements.pendingProcessesContainer?.classList.add('hidden');
    }
    
    if (state.processes.length === 0) {
      elements.noProcessesFound?.classList.remove('hidden');
      elements.runningProcessesContainer?.classList.add('hidden');
      elements.pendingProcessesContainer?.classList.add('hidden');
    } else {
      elements.noProcessesFound?.classList.add('hidden');
    }
  }

  function renderProcessCards(processes, container, startIndex, isRunning) {
    if (!container) return;
    
    container.innerHTML = processes.map((process, index) => {
      // Handle both camelCase and PascalCase
      const paperIssuedQty = process.PaperIssuedQty || process.paperIssuedQty;
      const formNo = process.FormNo || process.formNo;
      const currentStatus = process.CurrentStatus || process.currentStatus;
      const processName = process.ProcessName || process.processName;
      const client = process.Client || process.client;
      const jobName = process.JobName || process.jobName;
      const componentName = process.ComponentName || process.componentName;
      const pwoNo = process.PWONo || process.pwoNo;
      const scheduleQty = process.ScheduleQty || process.scheduleQty;
      const qtyProduced = process.QtyProduced || process.qtyProduced;
      
      const isPaperIssued = paperIssuedQty && paperIssuedQty > 0;
      const formNumber = extractFormNumber(formNo);
      const processKey = getProcessKey(process);
      const isProcessRunning = (currentStatus || '').trim().toLowerCase() === 'running';
      
      return `
        <div class="process-card ${isProcessRunning ? 'running' : ''} ${!isPaperIssued ? 'paper-not-issued' : ''}">
          <div class="process-header">
            <div class="process-title">
              <div class="process-number">${startIndex + index + 1}</div>
              <div class="process-name">${processName}${formNumber ? ` (${formNumber})` : ''}</div>
            </div>
            <div class="process-actions">
              ${renderProcessAction(process, isPaperIssued, isProcessRunning)}
            </div>
          </div>
          <div class="process-details">
            <div class="detail-item">
              <svg class="detail-icon" style="color: #3b82f6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
              </svg>
              <div class="detail-content">
                <div class="detail-label">Client</div>
                <div class="detail-value">${client}</div>
              </div>
            </div>
            <div class="detail-item">
              <svg class="detail-icon" style="color: #22c55e" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
              </svg>
              <div class="detail-content">
                <div class="detail-label">Job</div>
                <div class="detail-value">${jobName}</div>
              </div>
            </div>
            <div class="detail-item">
              <svg class="detail-icon" style="color: #f59e0b" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
              </svg>
              <div class="detail-content">
                <div class="detail-label">Component</div>
                <div class="detail-value">${componentName}</div>
              </div>
            </div>
            <div class="detail-item">
              <svg class="detail-icon" style="color: #8b5cf6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              <div class="detail-content">
                <div class="detail-label">PWO No</div>
                <div class="detail-value">${pwoNo}</div>
              </div>
            </div>
          </div>
          <div class="process-quantities">
            <div class="quantity-badge success">
              <div class="quantity-label">Schedule</div>
              <div class="quantity-value">${scheduleQty}</div>
            </div>
            <div class="quantity-badge warning">
              <div class="quantity-label">Produced</div>
              <div class="quantity-value">${qtyProduced}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners
    container.querySelectorAll('.btn-start').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        // Use state.processes instead of the local processes parameter
        // because data-index refers to the index in the full state.processes array
        const process = state.processes[index];
        if (!process) {
          console.error('Process not found at index:', index, 'in state.processes');
          alert('Error: Process not found');
          return;
        }
        startProcess(process);
      });
    });
    
    container.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          showLoading();
          const index = parseInt(btn.dataset.index);
          // Use state.processes instead of the local processes parameter
          // because data-index refers to the index in the full state.processes array
          const process = state.processes[index];
          
          if (!process) {
            console.error('Process not found at index:', index, 'in state.processes');
            alert('Error: Process not found');
            hideLoading();
            return;
          }
          
          console.log('Viewing process:', process);
          viewRunningProcess(process);
          // Hide loading after a brief moment to allow rendering
          setTimeout(() => hideLoading(), 300);
        } catch (error) {
          console.error('Error viewing process:', error);
          alert('Error viewing process: ' + error.message);
          hideLoading();
        }
      });
    });
  }

  function renderProcessAction(process, isPaperIssued, isRunning) {
    if (!isPaperIssued) {
      return `
        <button class="btn-action btn-disabled" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Paper Not Issued
        </button>
      `;
    }
    
    if (isRunning) {
      // Check if the running machine ID matches the selected machine ID
      const runningMachineId = process.RunningMachineID || process.runningMachineID;
      const selectedMachineId = state.selectedMachine?.MachineID || state.selectedMachine?.machineId;
      
      const isMachineMatch = parseInt(runningMachineId) === parseInt(selectedMachineId);
      
      console.log('Machine ID check for View Status:', {
        runningMachineId,
        selectedMachineId,
        isMachineMatch,
        processName: process.ProcessName || process.processName
      });
      
      const processIndex = state.processes.findIndex(p => {
        const pId = p.ProcessID || p.processId;
        const pJobId = p.JobBookingJobCardContentsID || p.jobBookingJobCardContentsID || p.jobBookingJobcardContentsId;
        const pFormNo = p.FormNo || p.formNo;
        const targetPId = process.ProcessID || process.processId;
        const targetJobId = process.JobBookingJobCardContentsID || process.jobBookingJobCardContentsID || process.jobBookingJobcardContentsId;
        const targetFormNo = process.FormNo || process.formNo;
        return pId === targetPId && pJobId === targetJobId && pFormNo === targetFormNo;
      });
      
      if (!isMachineMatch) {
        // Show enabled Start button if machine doesn't match - allows starting on different machine
        return `
          <button class="btn-action btn-start" data-index="${processIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start (different machine)
          </button>
        `;
      }
      
      return `
        <button class="btn-action btn-view" data-index="${processIndex}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          View Status
        </button>
      `;
    }
    
    const processIndex = state.processes.findIndex(p => {
      const pId = p.ProcessID || p.processId;
      const pJobId = p.JobBookingJobCardContentsID || p.jobBookingJobCardContentsID || p.jobBookingJobcardContentsId;
      const pFormNo = p.FormNo || p.formNo;
      const targetPId = process.ProcessID || process.processId;
      const targetJobId = process.JobBookingJobCardContentsID || process.jobBookingJobCardContentsID || process.jobBookingJobcardContentsId;
      const targetFormNo = process.FormNo || process.formNo;
      return pId === targetPId && pJobId === targetJobId && pFormNo === targetFormNo;
    });
    return `
      <button class="btn-action btn-start" data-index="${processIndex}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Start
      </button>
    `;
  }

  function extractFormNumber(formNo) {
    if (!formNo) return '';
    const parts = formNo.split('_');
    return parts[parts.length - 1] || '';
  }

  function getProcessKey(process) {
    // Handle both camelCase and PascalCase
    const processId = process.ProcessID || process.processId;
    const jobBookingId = process.JobBookingJobCardContentsID || process.jobBookingJobCardContentsID || process.jobBookingJobcardContentsId;
    const formNo = process.FormNo || process.formNo;
    return `${processId}_${jobBookingId}_${formNo}`;
  }

  // Helper function to poll job status
  async function pollJobStatus(jobId, maxAttempts = 60) {
    // Poll every 3 seconds for up to 3 minutes
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await apiRequest(`jobs/${jobId}/status`);
        
        if (response.status && response.job) {
          const job = response.job;
          
          // Check if job is done first
          if (job.status === 'completed' || job.status === 'failed') {
            return job;
          }
          
          // Update loading message only for pending/processing states
          const messages = {
            'pending': 'Waiting to process...',
            'processing': 'Processing... Please wait...'
          };
          
          const loadingMessage = document.querySelector('#loading-overlay p');
          if (loadingMessage && messages[job.status]) {
            loadingMessage.textContent = messages[job.status];
          }
        }
        
        // Wait 3 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error('Polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error('Job timeout - Operation took longer than expected. Please try again.');
  }

  // Process Actions
  async function startProcess(process) {
    showLoading();
    
    try {
      // Handle both camelCase and PascalCase
      const machineId = state.selectedMachine.MachineID || state.selectedMachine.machineId;
      const processId = process.ProcessID || process.processId;
      const jobBookingId = process.JobBookingJobCardContentsID || process.jobBookingJobCardContentsID || process.jobBookingJobcardContentsId;
      const formNo = process.FormNo || process.formNo;
      
      // Step 1: Create async job
      const data = await apiRequest('processes/start-async', {
        method: 'POST',
        body: JSON.stringify({
          UserID: state.currentUserId,
          EmployeeID: state.currentLedgerId,
          ProcessID: processId,
          JobBookingJobCardContentsID: jobBookingId,
          MachineID: machineId,
          JobCardFormNo: formNo,
          database: state.selectedDatabase,
        }),
      });
      
      if (!data.status || !data.jobId) {
        throw new Error(data.error || 'Failed to create job');
      }
      
      // Step 2: Poll for job completion
      const job = await pollJobStatus(data.jobId);
      
      if (job.status === 'completed') {
        if (job.statusWarning) {
          alert(`Status Warning: ${job.statusWarning.message}\nStatus: ${job.statusWarning.statusValue}`);
        } else {
          // Extract ProductionID from the job result
          const productionId = job.productionId;
          
          if (!productionId) {
            throw new Error('ProductionID not returned from start operation');
          }
          
          console.log('ProductionID received:', productionId);
          
          // Track start time and ProductionID
          const processKey = getProcessKey(process);
          state.runningProcesses.set(processKey, {
            startTime: new Date(),
            process: process,
            productionId: productionId,  // Store ProductionID for later use
          });
          
          // Navigate to running process screen
          viewRunningProcess(process);
        }
      } else if (job.status === 'failed') {
        throw new Error(job.error || 'Failed to start process');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      hideLoading();
    }
  }

  async function completeProcess(process, productionQty, wastageQty) {
    showLoading();
    
    try {
      // Get ProductionID from running processes or from process data
      const processKey = getProcessKey(process);
      const runningInfo = state.runningProcesses.get(processKey);
      
      let productionId = runningInfo?.productionId;
      
      // If not in memory, try to get from process data (from database)
      if (!productionId) {
        productionId = process.RunningProductionID || process.runningProductionID;
      }
      
      if (!productionId) {
        throw new Error('ProductionID not found. Please search for the job card again.');
      }
      
      console.log('Using ProductionID for complete:', productionId);
      console.log('ProductionID source:', runningInfo?.productionId ? 'Memory' : 'Database');
      
      // Step 1: Create async job
      const data = await apiRequest('processes/complete-async', {
        method: 'POST',
        body: JSON.stringify({
          UserID: state.currentUserId,
          ProductionID: productionId,
          ProductionQty: parseInt(productionQty),
          WastageQty: parseInt(wastageQty),
          database: state.selectedDatabase,
        }),
      });
      
      if (!data.status || !data.jobId) {
        throw new Error(data.error || 'Failed to create job');
      }
      
      // Step 2: Poll for job completion
      const job = await pollJobStatus(data.jobId);
      
      if (job.status === 'completed') {
        if (job.statusWarning) {
          alert(`Status Warning: ${job.statusWarning.message}\nStatus: ${job.statusWarning.statusValue}`);
        } else {
          // Remove from running processes
          const processKey = getProcessKey(process);
          state.runningProcesses.delete(processKey);
          
          alert('Production completed successfully!');
          
          // Navigate back to search
          showSearchSection();
        }
      } else if (job.status === 'failed') {
        throw new Error(job.error || 'Failed to complete process');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      hideLoading();
    }
  }

  async function cancelProcess(process) {
    if (!confirm('Are you sure you want to cancel this process?')) {
      return;
    }
    
    showLoading();
    
    try {
      // Get ProductionID from running processes or from process data
      const processKey = getProcessKey(process);
      const runningInfo = state.runningProcesses.get(processKey);
      
      let productionId = runningInfo?.productionId;
      
      // If not in memory, try to get from process data (from database)
      if (!productionId) {
        productionId = process.RunningProductionID || process.runningProductionID;
      }
      
      if (!productionId) {
        throw new Error('ProductionID not found. Please search for the job card again.');
      }
      
      console.log('Using ProductionID for cancel:', productionId);
      console.log('ProductionID source:', runningInfo?.productionId ? 'Memory' : 'Database');
      
      // Step 1: Create async job
      const data = await apiRequest('processes/cancel-async', {
        method: 'POST',
        body: JSON.stringify({
          UserID: state.currentUserId,
          ProductionID: productionId,
          database: state.selectedDatabase,
        }),
      });
      
      if (!data.status || !data.jobId) {
        throw new Error(data.error || 'Failed to create job');
      }
      
      // Step 2: Poll for job completion
      const job = await pollJobStatus(data.jobId);
      
      if (job.status === 'completed') {
        if (job.statusWarning) {
          alert(`Status Warning: ${job.statusWarning.message}\nStatus: ${job.statusWarning.statusValue}`);
        } else {
          // Remove from running processes
          const processKey = getProcessKey(process);
          state.runningProcesses.delete(processKey);
          
          alert('Process cancelled successfully!');
          
          // Navigate back to search
          showSearchSection();
        }
      } else if (job.status === 'failed') {
        throw new Error(job.error || 'Failed to cancel process');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      hideLoading();
    }
  }

  // Running Machines
  async function fetchRunningMachines() {
    try {
      const data = await apiRequest('machine-status/latest', {
        method: 'POST',
        body: JSON.stringify({
          database: state.selectedDatabase,
        }),
      });
      
      if (data.status === true) {
        return data.data || [];
      } else {
        throw new Error(data.error || 'Failed to fetch running machines');
      }
    } catch (error) {
      console.error('Error fetching running machines:', error);
      throw error;
    }
  }

  function renderRunningMachines(machineStatuses) {
    const runningMachines = machineStatuses.filter(status => 
      status.MachineStatus && status.MachineStatus.toLowerCase() === 'running'
    );

    // Update running machines count
    const countElement = document.getElementById('running-machines-count');
    if (countElement) {
      countElement.textContent = runningMachines.length;
    }

    if (runningMachines.length === 0) {
      elements.runningMachinesList.classList.add('hidden');
      elements.noRunningMachines.classList.remove('hidden');
      return;
    }

    elements.runningMachinesList.classList.remove('hidden');
    elements.noRunningMachines.classList.add('hidden');

    // Sort running machines:
    // 1. First by permission (enabled View Status buttons first)
    // 2. Then by LastUpdated (older to newer)
    const sortedRunningMachines = runningMachines.sort((a, b) => {
      // Calculate permissions for both machines
      const aEmployeeId = a.EmployeeID;
      const aMachineId = a.MachineID;
      const aHasMachine = state.machines.some(m => 
        parseInt(m.MachineID || m.machineId) === parseInt(aMachineId)
      );
      const aHasEmployee = parseInt(aEmployeeId) === parseInt(state.currentLedgerId);
      const aCanView = aHasMachine && aHasEmployee;

      const bEmployeeId = b.EmployeeID;
      const bMachineId = b.MachineID;
      const bHasMachine = state.machines.some(m => 
        parseInt(m.MachineID || m.machineId) === parseInt(bMachineId)
      );
      const bHasEmployee = parseInt(bEmployeeId) === parseInt(state.currentLedgerId);
      const bCanView = bHasMachine && bHasEmployee;

      // First sort by permission (enabled first)
      if (aCanView && !bCanView) return -1;
      if (!aCanView && bCanView) return 1;

      // Then sort by LastUpdated (older to newer)
      const aTime = new Date(a.LastUpadted || a.LastUpdated || 0).getTime();
      const bTime = new Date(b.LastUpadted || b.LastUpdated || 0).getTime();
      return aTime - bTime; // older first
    });

    const html = sortedRunningMachines.map((status, index) => {
      console.log(`\n=== Checking permissions for machine card ${index} ===`);
      console.log('Full status object:', status);
      
      // Check if user has permission to view this machine's status
      const machineId = status.MachineID;
      const employeeId = status.EmployeeID;
      
      console.log('Step 1: Extract IDs from status');
      console.log('  - MachineID from status:', machineId, '(type:', typeof machineId + ')');
      console.log('  - EmployeeID from status:', employeeId, '(type:', typeof employeeId + ')');
      console.log('  - Logged-in LedgerId:', state.currentLedgerId, '(type:', typeof state.currentLedgerId + ')');
      
      // Check if the machine belongs to the logged-in user's machine list
      console.log('\nStep 2: Check if machine is in user\'s machine list');
      console.log('  - User\'s machines:', state.machines);
      
      const isMachineInUserList = state.machines.some(m => {
        const mId = parseInt(m.MachineID || m.machineId);
        const statusMId = parseInt(machineId);
        console.log(`    Comparing: ${mId} === ${statusMId}?`, mId === statusMId);
        return mId === statusMId;
      });
      
      console.log('  - Result: isMachineInUserList =', isMachineInUserList);
      
      // Check if the employee running this process is the logged-in user (by LedgerId)
      console.log('\nStep 3: Check if employee matches logged-in user\'s ledger');
      console.log('  - Comparing EmployeeID:', parseInt(employeeId), '=== LedgerId:', parseInt(state.currentLedgerId));
      const isEmployeeMatch = parseInt(employeeId) === parseInt(state.currentLedgerId);
      console.log('  - Result: isEmployeeMatch =', isEmployeeMatch);
      
      // Enable button only if both conditions are met
      const canViewStatus = isMachineInUserList && isEmployeeMatch;
      console.log('\nStep 4: Final result');
      console.log('  - canViewStatus =', canViewStatus, '(isMachineInUserList:', isMachineInUserList, '&& isEmployeeMatch:', isEmployeeMatch + ')');
      console.log('=== End check ===\n');
      
      return `
      <div class="running-machine-card" data-index="${index}">
        <div class="machine-card-header">
          <div class="machine-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
          </div>
          <div class="machine-card-info">
            <h4>${status.MachineNmae || status.MachineName || 'Unknown Machine'}</h4>
            <span class="status-badge running">Running</span>
          </div>
        </div>
        <div class="machine-card-details">
          <div class="detail-row">
            <span class="detail-label">Job:</span>
            <span class="detail-value">${status['Job Name'] || status.JobName || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Job Number:</span>
            <span class="detail-value">${status.Jobnumber || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Process:</span>
            <span class="detail-value">${status.Process || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Operator:</span>
            <span class="detail-value">${status.UserID || status.EmployeeName || status.Employee || status.UserName || status.Username || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Updated:</span>
            <span class="detail-value">${status.LastUpadted || status.LastUpdated || 'N/A'}</span>
          </div>
        </div>
        <div class="machine-card-actions">
          <button class="btn-action btn-view-machine-status ${!canViewStatus ? 'btn-disabled' : ''}" 
                  data-machine-index="${index}" 
                  ${!canViewStatus ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            View Status
          </button>
        </div>
      </div>
      `;
    }).join('');

    elements.runningMachinesList.innerHTML = html;
    
    // Add event listeners for View Status buttons
    elements.runningMachinesList.querySelectorAll('.btn-view-machine-status:not(.btn-disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.machineIndex);
        const machineStatus = sortedRunningMachines[index];
        handleViewMachineStatus(machineStatus);
      });
    });
  }
  
  // View machine status from running machines list
  function handleViewMachineStatus(machineStatus) {
    console.log('View machine status clicked:', machineStatus);
    
    try {
      // Extract machine information from GetLatestMachineStatusPerMachine
      const machineId = machineStatus.MachineID;
      const machineName = machineStatus.MachineNmae || machineStatus.MachineName;
      
      // Set the selected machine in state so it appears when navigating back
      state.selectedMachine = {
        MachineID: machineId,
        machineId: machineId,
        MachineName: machineName,
        machineName: machineName
      };
      
      console.log('Machine set for navigation:', state.selectedMachine);
      
      // Extract PWO No (everything before first underscore in Jobnumber)
      const jobNumber = machineStatus.Jobnumber || '';
      const pwoNo = jobNumber.split('_')[0] || 'N/A';
      
      // Map GetLatestMachineStatusPerMachine fields to process format
      const mappedProcess = {
        // Process information
        ProcessName: machineStatus.Process || 'N/A',
        processName: machineStatus.Process || 'N/A',
        
        // Form number is the full job number
        FormNo: jobNumber,
        formNo: jobNumber,
        
        // Client and Job (both use JobName from the procedure)
        Client: machineStatus.JobName || 'N/A',
        client: machineStatus.JobName || 'N/A',
        JobName: machineStatus.JobName || 'N/A',
        jobName: machineStatus.JobName || 'N/A',
        
        // Component (from ContentName)
        ComponentName: machineStatus.ContentName || 'N/A',
        componentName: machineStatus.ContentName || 'N/A',
        
        // PWO Number (extracted from Jobnumber)
        PWONo: pwoNo,
        pwoNo: pwoNo,
        
        // Quantities
        ScheduleQty: machineStatus.ScheduleQty || 0,
        scheduleQty: machineStatus.ScheduleQty || 0,
        QtyProduced: machineStatus.PreviouslyProducedQty || 0,
        qtyProduced: machineStatus.PreviouslyProducedQty || 0,
        
        // Production ID (critical for complete/cancel)
        RunningProductionID: machineStatus.ProductionID || null,
        runningProductionID: machineStatus.ProductionID || null,
        
        // Status
        CurrentStatus: machineStatus.MachineStatus || 'Running',
        currentStatus: machineStatus.MachineStatus || 'Running',
        
        // IDs (may not be available from this procedure, but include for compatibility)
        ProcessID: machineStatus.ProcessID || null,
        processId: machineStatus.ProcessID || null,
        JobBookingJobCardContentsID: machineStatus.JobBookingJobCardContentsID || null,
        jobBookingJobcardContentsId: machineStatus.JobBookingJobCardContentsID || null,
        MachineID: machineStatus.MachineID || null,
        machineId: machineStatus.MachineID || null
      };
      
      console.log('Mapped process for running view:', mappedProcess);
      console.log('ProductionID for complete/cancel:', mappedProcess.RunningProductionID);
      
      // Navigate to running process screen
      viewRunningProcess(mappedProcess);
      
    } catch (error) {
      console.error('Error viewing machine status:', error);
      alert('Error: ' + error.message);
    }
  }

  async function showRunningMachinesSection() {
    showSection(elements.runningMachinesSection, 'running-machines');
    showLoading();

    try {
      const machineStatuses = await fetchRunningMachines();
      renderRunningMachines(machineStatuses);
    } catch (error) {
      alert('Error loading running machines: ' + error.message);
      showMachineSelection();
    } finally {
      hideLoading();
    }
  }

  // Instructions Search Section
  function showInstructionsSearchSection() {
    showSection(elements.instructionsSearchSection, 'instructions-search');
    // Clear the input field and dropdown when showing the section
    if (elements.instructionsJobNumberInput) {
      elements.instructionsJobNumberInput.value = '';
      elements.instructionsJobNumberInput.focus();
    }
    if (elements.instructionsJobNumberDropdown) {
      elements.instructionsJobNumberDropdown.style.display = 'none';
    }
    // Clear any pending search timeout
    if (state.instructionsSearchTimeout) {
      clearTimeout(state.instructionsSearchTimeout);
      state.instructionsSearchTimeout = null;
    }
  }

  async function searchInstructions(jobNumber) {
    if (!jobNumber) {
      alert('Please enter a job number');
      return;
    }

    showSection(elements.instructionsResultsSection, 'instructions-results');
    if (elements.instructionsJobNumberDisplay) {
      elements.instructionsJobNumberDisplay.textContent = `Job Number: ${jobNumber}`;
    }

    // Show loading, hide empty and list
    if (elements.instructionsLoading) elements.instructionsLoading.classList.remove('hidden');
    if (elements.instructionsEmpty) elements.instructionsEmpty.classList.add('hidden');
    if (elements.instructionsList) elements.instructionsList.innerHTML = '';

    try {
      // Call the API to get all recordings for this job number
      const response = await fetch(`${API_BASE_URL}/voice-note-tool/audio/job/${encodeURIComponent(jobNumber)}/all`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch instructions');
      }

      const recordings = await response.json();

      if (elements.instructionsLoading) elements.instructionsLoading.classList.add('hidden');

      if (!recordings || recordings.length === 0) {
        if (elements.instructionsEmpty) elements.instructionsEmpty.classList.remove('hidden');
        return;
      }

      if (elements.instructionsEmpty) elements.instructionsEmpty.classList.add('hidden');
      renderInstructions(recordings);
    } catch (error) {
      console.error('Error fetching instructions:', error);
      if (elements.instructionsLoading) elements.instructionsLoading.classList.add('hidden');
      if (elements.instructionsEmpty) elements.instructionsEmpty.classList.remove('hidden');
      alert('Error loading instructions: ' + error.message);
    }
  }

  function renderInstructions(recordings) {
    if (!elements.instructionsList) return;

    elements.instructionsList.innerHTML = '';

    recordings.forEach((recording, index) => {
      const instructionCard = document.createElement('div');
      instructionCard.className = 'instruction-card';
      instructionCard.style.cssText = `
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
      `;

      const date = new Date(recording.createdAt).toLocaleString();
      const department = recording.department || recording.toDepartment || 'N/A';

      instructionCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
          <div>
            <h4 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: var(--text);">Instruction #${index + 1}</h4>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.875rem; color: var(--text-muted);">
              <span><strong>Department:</strong> ${department}</span>
              <span><strong>Created By:</strong> ${recording.createdBy || 'N/A'}</span>
              <span><strong>Date:</strong> ${date}</span>
            </div>
          </div>
        </div>
        ${recording.summary ? `
          <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border-left: 3px solid var(--primary);">
            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text);">Summary:</div>
            <div style="white-space: pre-wrap; line-height: 1.6; color: var(--text);">${recording.summary}</div>
          </div>
        ` : ''}
        ${recording.audioBlob ? `
          <div style="margin-top: 0.75rem;">
            <audio controls style="width: 100%;" data-audio-id="${recording._id}"></audio>
          </div>
        ` : ''}
      `;

      elements.instructionsList.appendChild(instructionCard);

      // Load audio if available
      if (recording.audioBlob) {
        const audioElement = instructionCard.querySelector('audio');
        if (audioElement) {
          // Convert base64 to blob URL
          try {
            const binaryString = atob(recording.audioBlob);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: recording.audioMimeType || 'audio/wav' });
            const url = URL.createObjectURL(blob);
            audioElement.src = url;
          } catch (err) {
            console.error('Error loading audio:', err);
          }
        }
      }
    });
  }

  // Running Process View
  function viewRunningProcess(process) {
    try {
      console.log('viewRunningProcess called with:', process);
      
      if (!process) {
        throw new Error('Process is undefined');
      }
      
      if (!elements.runningProcessSection) {
        throw new Error('Running process section element not found');
      }
      
      const processKey = getProcessKey(process);
      console.log('Process key:', processKey);
      
      // Extract RunningProductionID from process data (from database)
      const runningProductionId = process.RunningProductionID || process.runningProductionID;
      
      let runningInfo = state.runningProcesses.get(processKey);
      
      if (!runningInfo) {
        runningInfo = {
          startTime: new Date(),
          process: process,
          productionId: runningProductionId, // Store ProductionID from database
        };
        state.runningProcesses.set(processKey, runningInfo);
      } else if (runningProductionId && !runningInfo.productionId) {
        // Update with ProductionID from database if not already set
        runningInfo.productionId = runningProductionId;
        state.runningProcesses.set(processKey, runningInfo);
      }
      
      console.log('Running info:', runningInfo);
      console.log('ProductionID from database:', runningProductionId);
      
      renderRunningProcess(process, runningInfo.startTime);
      showSection(elements.runningProcessSection, 'running-process');
      
      console.log('viewRunningProcess completed successfully');
    } catch (error) {
      console.error('Error in viewRunningProcess:', error);
      throw error;
    }
  }

  function renderRunningProcess(process, startTime) {
    console.log('renderRunningProcess called');
    
    if (!elements.runningProcessDetails) {
      console.error('runningProcessDetails element not found');
      throw new Error('Running process details element not found');
    }
    
    // Handle both camelCase and PascalCase for all properties
    const processName = process.ProcessName || process.processName || 'Unknown Process';
    const formNo = process.FormNo || process.formNo || '';
    const client = process.Client || process.client || 'N/A';
    const jobName = process.JobName || process.jobName || 'N/A';
    const componentName = process.ComponentName || process.componentName || 'N/A';
    const pwoNo = process.PWONo || process.pwoNo || 'N/A';
    const scheduleQty = process.ScheduleQty || process.scheduleQty || 0;
    const qtyProduced = process.QtyProduced || process.qtyProduced || 0;
    
    const formNumber = extractFormNumber(formNo);
    
    console.log('Process details:', {
      processName,
      formNo,
      client,
      jobName,
      componentName,
      pwoNo,
      scheduleQty,
      qtyProduced
    });
    
    elements.runningProcessDetails.innerHTML = `
      <div class="process-card running">
        <div class="process-header">
          <div class="process-title">
            <div class="process-number">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div class="process-name">${processName}${formNumber ? ` (${formNumber})` : ''}</div>
          </div>
          <div class="process-actions">
            <button class="btn-action btn-danger" id="btn-cancel-process">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
              Cancel
            </button>
            <button class="btn-action btn-success" id="btn-toggle-complete">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              Complete
            </button>
          </div>
        </div>
        <div class="process-details">
          <div class="detail-item">
            <svg class="detail-icon" style="color: #22c55e" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            <div class="detail-content">
              <div class="detail-label">Job</div>
              <div class="detail-value">${jobName}</div>
            </div>
          </div>
          <div class="detail-item">
            <svg class="detail-icon" style="color: #f59e0b" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
            </svg>
            <div class="detail-content">
              <div class="detail-label">Component</div>
              <div class="detail-value">${componentName}</div>
            </div>
          </div>
          <div class="detail-item">
            <svg class="detail-icon" style="color: #8b5cf6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <div class="detail-content">
              <div class="detail-label">PWO No</div>
              <div class="detail-value">${pwoNo}</div>
            </div>
          </div>
        </div>
        <div class="process-quantities">
          <div class="quantity-badge success">
            <div class="quantity-label">Schedule</div>
            <div class="quantity-value">${scheduleQty}</div>
          </div>
          <div class="quantity-badge warning">
            <div class="quantity-label">Produced</div>
            <div class="quantity-value">${qtyProduced}</div>
          </div>
        </div>
      </div>
      
      <div class="running-details">
        <div class="timer-container">
          <svg class="timer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          <div class="timer-label">Production Time</div>
          <div class="timer-value" id="timer-display">00:00:00</div>
        </div>
        
        <div class="complete-form hidden" id="complete-form">
          <h3>Complete Production</h3>
          <p class="subtitle">Enter production and wastage quantities</p>
          
          <form id="complete-production-form">
            <div class="form-row">
              <label for="production-qty">Production Qty</label>
              <input type="number" id="production-qty" min="0" required placeholder="Enter actual produced quantity" />
            </div>
            <div class="form-row">
              <label for="wastage-qty">Wastage Qty</label>
              <input type="number" id="wastage-qty" min="0" value="0" required placeholder="Enter wastage quantity" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" id="btn-cancel-form">Cancel</button>
              <button type="submit" class="btn-success">Submit</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Start timer
    startTimer(startTime, document.getElementById('timer-display'));
    
    // Add event listeners
    document.getElementById('btn-cancel-process')?.addEventListener('click', async () => {
      const cancelBtn = document.getElementById('btn-cancel-process');
      if (cancelBtn) {
        cancelBtn.disabled = true;
        const originalText = cancelBtn.innerHTML;
        cancelBtn.textContent = 'Cancelling...';
        
        await cancelProcess(process);
        
        // Re-enable button if still on same screen
        if (cancelBtn) {
          cancelBtn.disabled = false;
          cancelBtn.innerHTML = originalText;
        }
      } else {
        await cancelProcess(process);
      }
    });
    
    document.getElementById('btn-toggle-complete')?.addEventListener('click', () => {
      const form = document.getElementById('complete-form');
      const isHidden = form?.classList.contains('hidden');
      form?.classList.toggle('hidden');
      
      // Auto-scroll to form when it opens
      if (isHidden) {
        setTimeout(() => {
          form?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
    
    document.getElementById('btn-cancel-form')?.addEventListener('click', () => {
      const form = document.getElementById('complete-form');
      form?.classList.add('hidden');
    });
    
    document.getElementById('complete-production-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productionQty = document.getElementById('production-qty').value;
      const wastageQty = document.getElementById('wastage-qty').value;
      
      // Disable submit button to prevent double-click
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Completing...';
      }
      
      await completeProcess(process, productionQty, wastageQty);
      
      // Re-enable button if still on same screen
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  }

  function startTimer(startTime, displayElement) {
    if (!displayElement) return;
    
    function updateTimer() {
      const now = new Date();
      const diff = now - startTime;
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      displayElement.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    
    // Store timer ID to clear later if needed
    displayElement.dataset.timerId = timerId;
  }

  // Event Listeners
  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = elements.usernameInput.value.trim();
      const database = elements.databaseSelect.value;
      
      if (!username || !database) {
        showError('Please enter username and select database');
        return;
      }
      
      await login(username, database);
    });
  }

  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', logout);
  }

  if (elements.backToMachinesBtn) {
    elements.backToMachinesBtn.addEventListener('click', () => {
      stopQrScanner();
      showMachineSelection();
    });
  }

  if (elements.tabQr) {
    elements.tabQr.addEventListener('click', () => {
      elements.tabQr.classList.add('active');
      elements.tabManual?.classList.remove('active');
      elements.qrScannerContainer?.classList.remove('hidden');
      elements.manualEntryContainer?.classList.add('hidden');
      startQrScanner();
    });
  }

  if (elements.tabManual) {
    elements.tabManual.addEventListener('click', () => {
      elements.tabManual.classList.add('active');
      elements.tabQr?.classList.remove('active');
      elements.manualEntryContainer?.classList.remove('hidden');
      elements.qrScannerContainer?.classList.add('hidden');
      stopQrScanner();
    });
  }

  if (elements.searchManualBtn) {
    elements.searchManualBtn.addEventListener('click', () => {
      const jobCardNo = elements.jobCardNoInput.value.trim();
      searchProcesses(jobCardNo, true);
    });
  }

  if (elements.backToSearchBtn) {
    elements.backToSearchBtn.addEventListener('click', () => {
      showSearchSection();
    });
  }

  if (elements.loadMoreBtn) {
    elements.loadMoreBtn.addEventListener('click', () => {
      state.displayedProcessCount += 10;
      renderProcessList();
    });
  }

  if (elements.viewRunningMachinesBtn) {
    elements.viewRunningMachinesBtn.addEventListener('click', () => {
      showRunningMachinesSection();
    });
  }

  if (elements.backToMachinesFromRunningBtn) {
    elements.backToMachinesFromRunningBtn.addEventListener('click', () => {
      showMachineSelection();
    });
  }

  // Instructions Search event listeners
  if (elements.showInstructionsBtn) {
    elements.showInstructionsBtn.addEventListener('click', () => {
      showInstructionsSearchSection();
    });
  }

  if (elements.backToRunningMachinesBtn) {
    elements.backToRunningMachinesBtn.addEventListener('click', () => {
      showMachineSelection();
    });
  }

  if (elements.backToInstructionsSearchBtn) {
    elements.backToInstructionsSearchBtn.addEventListener('click', () => {
      showInstructionsSearchSection();
    });
  }

  if (elements.searchInstructionsBtn) {
    elements.searchInstructionsBtn.addEventListener('click', () => {
      if (elements.instructionsJobNumberDropdown) {
        elements.instructionsJobNumberDropdown.style.display = 'none';
      }
      const jobNumber = elements.instructionsJobNumberInput.value.trim();
      searchInstructions(jobNumber);
    });
  }

  if (elements.instructionsJobNumberInput) {
    // Handle job number input - search when 4+ digits entered
    elements.instructionsJobNumberInput.addEventListener('input', async (e) => {
      const value = e.target.value.trim();
      
      // Clear previous timeout
      if (state.instructionsSearchTimeout) {
        clearTimeout(state.instructionsSearchTimeout);
      }

      // Hide dropdown if less than 4 characters
      if (value.length < 4) {
        if (elements.instructionsJobNumberDropdown) {
          elements.instructionsJobNumberDropdown.style.display = 'none';
        }
        return;
      }

      // Debounce search (wait 300ms after user stops typing)
      state.instructionsSearchTimeout = setTimeout(async () => {
        try {
          console.log('🔍 [INSTRUCTIONS] Searching job numbers for:', value);
          const jobNumbers = await apiRequest(`jobs/search-numbers-completion/${encodeURIComponent(value)}`);
          console.log('🔍 [INSTRUCTIONS] Received jobNumbers:', jobNumbers);
          
          if (jobNumbers && Array.isArray(jobNumbers) && jobNumbers.length > 0) {
            // Populate dropdown
            if (elements.instructionsJobNumberDropdown) {
              elements.instructionsJobNumberDropdown.innerHTML = '';
              jobNumbers.forEach(jobNum => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px 14px; cursor: pointer; border-bottom: 1px solid rgba(55, 65, 81, 0.5); color: #f9fafb; font-size: 0.9rem;';
                item.textContent = jobNum;
                item.addEventListener('mouseenter', () => {
                  item.style.backgroundColor = 'rgba(79, 70, 229, 0.3)';
                });
                item.addEventListener('mouseleave', () => {
                  item.style.backgroundColor = 'transparent';
                });
                item.addEventListener('click', () => {
                  if (elements.instructionsJobNumberInput) {
                    elements.instructionsJobNumberInput.value = jobNum;
                  }
                  if (elements.instructionsJobNumberDropdown) {
                    elements.instructionsJobNumberDropdown.style.display = 'none';
                  }
                });
                elements.instructionsJobNumberDropdown.appendChild(item);
              });
              elements.instructionsJobNumberDropdown.style.display = 'block';
              console.log('🔍 [INSTRUCTIONS] Dropdown populated with', jobNumbers.length, 'items');
            }
          } else {
            console.log('🔍 [INSTRUCTIONS] No job numbers found or empty array');
            if (elements.instructionsJobNumberDropdown) {
              elements.instructionsJobNumberDropdown.style.display = 'none';
            }
          }
        } catch (error) {
          console.error('❌ [INSTRUCTIONS] Error searching job numbers:', error);
          if (elements.instructionsJobNumberDropdown) {
            elements.instructionsJobNumberDropdown.style.display = 'none';
          }
        }
      }, 300);
    });

    // Handle Enter key
    elements.instructionsJobNumberInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (elements.instructionsJobNumberDropdown) {
          elements.instructionsJobNumberDropdown.style.display = 'none';
        }
        const jobNumber = elements.instructionsJobNumberInput.value.trim();
        searchInstructions(jobNumber);
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (elements.instructionsJobNumberInput && elements.instructionsJobNumberDropdown) {
        if (!elements.instructionsJobNumberInput.contains(e.target) && 
            !elements.instructionsJobNumberDropdown.contains(e.target)) {
          elements.instructionsJobNumberDropdown.style.display = 'none';
        }
      }
    });
  }

  // Voice Notes Modal event listeners
  if (elements.voiceNotesBtn) {
    elements.voiceNotesBtn.addEventListener('click', () => {
      handleVoiceNotesClick();
    });
  }

  if (elements.voiceNotesModalClose) {
    elements.voiceNotesModalClose.addEventListener('click', closeVoiceNotesModal);
  }

  if (elements.voiceNotesModal) {
    elements.voiceNotesModal.addEventListener('click', (event) => {
      if (event.target === elements.voiceNotesModal) {
        closeVoiceNotesModal();
      }
    });
  }

  // Handle Escape key to close modal
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements.voiceNotesModal && !elements.voiceNotesModal.classList.contains('hidden')) {
      closeVoiceNotesModal();
    }
  });

  // Browser Navigation Handlers
  
  // Handle browser back button
  window.addEventListener('popstate', (event) => {
    const targetScreen = event.state?.screen || 'login';
    
    // Block back navigation on login and running process screens
    if (state.currentScreen === 'login' || state.currentScreen === 'running-process') {
      // Push state back to prevent navigation
      history.pushState({ screen: state.currentScreen }, '', `#${state.currentScreen}`);
      
      if (state.currentScreen === 'running-process') {
        const confirmed = confirm('You have a process in progress. Are you sure you want to go back? This may affect your current operation.');
        if (confirmed) {
          showSearchSection();
        }
      }
      return;
    }
    
    // Navigate to the target screen
    switch (targetScreen) {
      case 'machines':
        showMachineSelection();
        break;
      case 'search':
        showSearchSection();
        break;
      case 'process-list':
        if (state.currentJobCardNo) {
          // Already have process list data
          showSection(elements.processListSection, 'process-list');
        } else {
          showSearchSection();
        }
        break;
      case 'running-machines':
        showRunningMachinesSection();
        break;
      case 'instructions-search':
        showInstructionsSearchSection();
        break;
      case 'instructions-results':
        // Keep current results visible
        break;
      default:
        showMachineSelection();
    }
  });
  
  // Handle page reload/close confirmation
  window.addEventListener('beforeunload', (event) => {
    // Show confirmation only on running process screen
    if (state.currentScreen === 'running-process' || state.runningProcesses.size > 0) {
      event.preventDefault();
      event.returnValue = ''; // Required for Chrome
      return ''; // Required for some browsers
    }
  });
  
  // Initialize history state
  history.replaceState({ screen: 'login' }, '', '#login');

  // Initialize app
  hideLoading();
  
  // Try to restore session from localStorage
  const sessionRestored = restoreSession();
  
  // If no session, show login screen
  if (!sessionRestored) {
    showSection(elements.loginSection, 'login');
  }
})();

