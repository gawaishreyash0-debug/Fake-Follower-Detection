/**
 * FakeGuard AI — Core Frontend Application Logic
 * Vanilla JavaScript (No external framework dependencies)
 * 
 * Features:
 * - 9 View Sections Router
 * - File Drag & Drop + CSV Schema Validation
 * - AJAX Pipeline to Flask API (/api/analyze, /api/export, /api/sample)
 * - Dynamic Chart.js visualizations (Doughnut & Scatter/Bar)
 * - Table Search, Risk Category Filter, Column Sorting & Pagination
 * - Account Details Modal with 9-feature breakdown and Rule Warnings
 * - Live Single Account Simulator
 * - Session History Management
 */

(function () {
  'use strict';

  // Application State
  const state = {
    currentSection: 'overview',
    analyzedData: null,
    filteredResults: [],
    currentPage: 1,
    rowsPerPage: 10,
    searchQuery: '',
    riskFilter: 'ALL',
    sortBy: 'risk_score_desc',
    charts: {},
    history: []
  };

  // DOM Elements
  const DOM = {
    // Navigation
    navItems: document.querySelectorAll('.sidebar-nav .nav-item'),
    sections: document.querySelectorAll('.view-section'),
    pageTitleHeading: document.getElementById('pageTitleHeading'),
    pageSubtitleText: document.getElementById('pageSubtitleText'),
    resultsCountBadge: document.getElementById('resultsCountBadge'),
    sidebar: document.getElementById('sidebar'),
    mobileMenuOpenBtn: document.getElementById('mobileMenuOpenBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    viewAllResultsBtn: document.getElementById('viewAllResultsBtn'),

    // Header buttons
    loadDemoSampleBtn: document.getElementById('loadDemoSampleBtn'),
    downloadSampleCsvBtn: document.getElementById('downloadSampleCsvBtn'),
    headerUploadBtn: document.getElementById('headerUploadBtn'),
    uploadDownloadSampleBtn: document.getElementById('uploadDownloadSampleBtn'),

    // Stat Cards
    statTotalAccounts: document.getElementById('statTotalAccounts'),
    statLowRisk: document.getElementById('statLowRisk'),
    statLowPercent: document.getElementById('statLowPercent'),
    statLowFill: document.getElementById('statLowFill'),
    statMedRisk: document.getElementById('statMedRisk'),
    statMedPercent: document.getElementById('statMedPercent'),
    statMedFill: document.getElementById('statMedFill'),
    statHighRisk: document.getElementById('statHighRisk'),
    statHighPercent: document.getElementById('statHighPercent'),
    statHighFill: document.getElementById('statHighFill'),

    // Overview Table
    overviewPreviewTableBody: document.getElementById('overviewPreviewTableBody'),

    // Upload Section
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    selectedFileCard: document.getElementById('selectedFileCard'),
    selectedFileName: document.getElementById('selectedFileName'),
    selectedFileSize: document.getElementById('selectedFileSize'),
    removeSelectedFileBtn: document.getElementById('removeSelectedFileBtn'),
    startUploadBtn: document.getElementById('startUploadBtn'),
    uploadProgressBarContainer: document.getElementById('uploadProgressBarContainer'),
    uploadProgressBarFill: document.getElementById('uploadProgressBarFill'),

    // Results Section
    tableSearchInput: document.getElementById('tableSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    riskFilterSelect: document.getElementById('riskFilterSelect'),
    sortBySelect: document.getElementById('sortBySelect'),
    mainResultsTableBody: document.getElementById('mainResultsTableBody'),
    tableEmptyState: document.getElementById('tableEmptyState'),
    resetTableFiltersBtn: document.getElementById('resetTableFiltersBtn'),
    paginationInfo: document.getElementById('paginationInfo'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageNumbersContainer: document.getElementById('pageNumbersContainer'),
    exportResultsCsvBtn: document.getElementById('exportResultsCsvBtn'),

    // Single Analyzer Simulator
    singleAccountForm: document.getElementById('singleAccountForm'),
    singleUsername: document.getElementById('singleUsername'),
    singleAge: document.getElementById('singleAge'),
    singleFollowers: document.getElementById('singleFollowers'),
    singleFollowing: document.getElementById('singleFollowing'),
    singlePosts: document.getElementById('singlePosts'),
    singleLikes: document.getElementById('singleLikes'),
    singleComments: document.getElementById('singleComments'),
    singleHasPic: document.getElementById('singleHasPic'),
    singleBioLen: document.getElementById('singleBioLen'),
    singleRepComments: document.getElementById('singleRepComments'),
    loadSuspiciousPresetBtn: document.getElementById('loadSuspiciousPresetBtn'),
    loadLegitPresetBtn: document.getElementById('loadLegitPresetBtn'),
    singleGaugeCircle: document.getElementById('singleGaugeCircle'),
    singleRiskScoreDisplay: document.getElementById('singleRiskScoreDisplay'),
    singleRiskBadge: document.getElementById('singleRiskBadge'),
    singleRiskSummaryNote: document.getElementById('singleRiskSummaryNote'),
    singleWarningList: document.getElementById('singleWarningList'),

    // Distribution Section
    distLowCount: document.getElementById('distLowCount'),
    distMedCount: document.getElementById('distMedCount'),
    distHighCount: document.getElementById('distHighCount'),
    doughnutLegendBox: document.getElementById('doughnutLegendBox'),

    // History Section
    historyTableBody: document.getElementById('historyTableBody'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Reports Section
    reportsDownloadCsvBtn: document.getElementById('reportsDownloadCsvBtn'),
    reportScopeCount: document.getElementById('reportScopeCount'),
    reportAvgRiskScore: document.getElementById('reportAvgRiskScore'),
    reportTimestampDisplay: document.getElementById('reportTimestampDisplay'),
    reportNarrativeP: document.getElementById('reportNarrativeP'),
    reportPreviewTableBody: document.getElementById('reportPreviewTableBody'),

    // Settings
    settingAnimationsToggle: document.getElementById('settingAnimationsToggle'),
    settingCompactTableToggle: document.getElementById('settingCompactTableToggle'),

    // Modal
    accountDetailsModal: document.getElementById('accountDetailsModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalDoneBtn: document.getElementById('modalDoneBtn'),
    modalAvatarCircle: document.getElementById('modalAvatarCircle'),
    modalAvatarInitials: document.getElementById('modalAvatarInitials'),
    modalUsername: document.getElementById('modalUsername'),
    modalProfileStatus: document.getElementById('modalProfileStatus'),
    modalRiskScore: document.getElementById('modalRiskScore'),
    modalRiskBadge: document.getElementById('modalRiskBadge'),
    modalRiskEvalText: document.getElementById('modalRiskEvalText'),
    modalFeatAge: document.getElementById('modalFeatAge'),
    modalFeatFollowers: document.getElementById('modalFeatFollowers'),
    modalFeatFollowing: document.getElementById('modalFeatFollowing'),
    modalFeatRatio: document.getElementById('modalFeatRatio'),
    modalFeatPosts: document.getElementById('modalFeatPosts'),
    modalFeatLikes: document.getElementById('modalFeatLikes'),
    modalFeatComments: document.getElementById('modalFeatComments'),
    modalFeatBio: document.getElementById('modalFeatBio'),
    modalFeatRepComments: document.getElementById('modalFeatRepComments'),
    modalWarningsList: document.getElementById('modalWarningsList'),

    // Feedback
    toastContainer: document.getElementById('toastContainer'),
    loadingOverlay: document.getElementById('loadingOverlay')
  };

  // Section titles and subtitles
  const sectionMeta = {
    overview: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time Instagram account suspicious pattern detection'
    },
    analyze: {
      title: 'Analyze Account',
      subtitle: 'Simulate and evaluate individual Instagram metrics in real-time'
    },
    upload: {
      title: 'Upload CSV Dataset',
      subtitle: 'Batch Instagram account ingestion and validation pipeline'
    },
    results: {
      title: 'Account Analysis Results',
      subtitle: 'Granular machine learning risk scores and heuristic warnings'
    },
    distribution: {
      title: 'Risk Distribution & Analytics',
      subtitle: 'Statistical cohorts and threshold segmentation'
    },
    history: {
      title: 'Analysis History',
      subtitle: 'Audit trail of previously analyzed dataset batches'
    },
    reports: {
      title: 'Reports & Export',
      subtitle: 'Auditing reports and full CSV data export'
    },
    methodology: {
      title: 'System Methodology',
      subtitle: 'Random Forest architecture, median imputation, and heuristic rule separation'
    },
    settings: {
      title: 'Settings & System Info',
      subtitle: 'Interface preferences, threshold preview, and environment inspection'
    }
  };

  // Selected file for upload
  let selectedFile = null;

  // ==================== INITIALIZATION ====================
  function init() {
    setupNavigation();
    setupDropzone();
    setupTableControls();
    setupSingleAnalyzer();
    setupModal();
    setupSettings();
    loadHistoryFromStorage();

    // Auto-load demo sample dataset on initial load for instant demonstration
    loadDemoDataset();
  }

  // ==================== NAVIGATION ROUTER ====================
  function setupNavigation() {
    DOM.navItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const target = item.dataset.section;
        navigateToSection(target);
      });
    });

    if (DOM.viewAllResultsBtn) {
      DOM.viewAllResultsBtn.addEventListener('click', () => {
        navigateToSection('results');
      });
    }

    if (DOM.headerUploadBtn) {
      DOM.headerUploadBtn.addEventListener('click', () => {
        navigateToSection('upload');
      });
    }

    // Mobile sidebar toggle
    if (DOM.mobileMenuOpenBtn) {
      DOM.mobileMenuOpenBtn.addEventListener('click', () => {
        DOM.sidebar.classList.add('mobile-open');
      });
    }

    if (DOM.sidebarCloseBtn) {
      DOM.sidebarCloseBtn.addEventListener('click', () => {
        DOM.sidebar.classList.remove('mobile-open');
      });
    }
  }

  function navigateToSection(sectionId) {
    if (!sectionMeta[sectionId]) return;

    state.currentSection = sectionId;

    // Update nav classes
    DOM.navItems.forEach(item => {
      if (item.dataset.section === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update section visibility
    DOM.sections.forEach(sec => {
      if (sec.id === `${sectionId}-section`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update header text
    DOM.pageTitleHeading.textContent = sectionMeta[sectionId].title;
    DOM.pageSubtitleText.textContent = sectionMeta[sectionId].subtitle;

    // Close mobile sidebar if open
    DOM.sidebar.classList.remove('mobile-open');

    // Trigger charts resize when entering chart tabs
    if (sectionId === 'overview' || sectionId === 'distribution') {
      setTimeout(renderAllCharts, 50);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== DATA FETCHING & API ====================
  async function loadDemoDataset() {
    showLoading(true);
    try {
      const response = await fetch('/api/sample');
      if (!response.ok) throw new Error('Could not load sample CSV file.');
      const blob = await response.blob();
      const file = new File([blob], 'sample_followers.csv', { type: 'text/csv' });
      await processAndAnalyzeFile(file, 'Sample Demonstration Dataset (20 Accounts)');
    } catch (err) {
      console.error(err);
      showToast('Error loading sample demonstration dataset: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  async function processAndAnalyzeFile(file, customBatchName = null) {
    showLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Error occurred during file processing');
      }

      state.analyzedData = data;
      state.filteredResults = [...data.results];
      state.currentPage = 1;

      // Update badge
      if (DOM.resultsCountBadge) {
        DOM.resultsCountBadge.textContent = data.summary.total_accounts;
      }

      // Add to Session History
      const batchRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date().toLocaleDateString(),
        filename: customBatchName || file.name,
        total: data.summary.total_accounts,
        low: data.summary.low_risk,
        med: data.summary.medium_risk,
        high: data.summary.high_risk,
        highPercent: `${((data.summary.high_risk / Math.max(data.summary.total_accounts, 1)) * 100).toFixed(1)}%`,
        data: data
      };
      addHistoryRecord(batchRecord);

      // Render all views
      renderDashboardOverview();
      renderResultsTable();
      renderReportsView();
      renderAllCharts();

      showToast(`Analyzed ${data.summary.total_accounts} accounts successfully.`, 'success');
      
      // Reset dropzone selection
      clearSelectedFile();

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  // ==================== DASHBOARD OVERVIEW RENDERING ====================
  function renderDashboardOverview() {
    if (!state.analyzedData) return;
    const s = state.analyzedData.summary;
    const total = s.total_accounts || 1;

    DOM.statTotalAccounts.textContent = s.total_accounts;
    DOM.statLowRisk.textContent = s.low_risk;
    DOM.statMedRisk.textContent = s.medium_risk;
    DOM.statHighRisk.textContent = s.high_risk;

    const lowPct = ((s.low_risk / total) * 100).toFixed(1);
    const medPct = ((s.medium_risk / total) * 100).toFixed(1);
    const highPct = ((s.high_risk / total) * 100).toFixed(1);

    DOM.statLowPercent.textContent = `${lowPct}% of cohort`;
    DOM.statMedPercent.textContent = `${medPct}% of cohort`;
    DOM.statHighPercent.textContent = `${highPct}% of cohort`;

    DOM.statLowFill.style.width = `${lowPct}%`;
    DOM.statMedFill.style.width = `${medPct}%`;
    DOM.statHighFill.style.width = `${highPct}%`;

    // Overview Preview Table (Top 6 accounts sorted by risk score)
    const sorted = [...state.analyzedData.results].sort((a, b) => b.risk_score - a.risk_score).slice(0, 6);
    let html = '';

    sorted.forEach(acc => {
      const firstWarning = acc.warning_indicators.length > 0
        ? `<span class="warning-signal-tag" title="${acc.warning_indicators[0]}">${acc.warning_indicators[0]}</span>`
        : `<span class="warning-none-tag">None flagged</span>`;

      const followers = acc.features.followers_count || 0;
      const likes = acc.features.avg_likes || 0;
      const engRate = followers > 0 ? ((likes / followers) * 100).toFixed(2) + '%' : '0.00%';

      html += `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="user-avatar-mini">${acc.username.substring(0, 2).toUpperCase()}</div>
              <a href="#" class="username-link" data-username="${acc.username}">@${acc.username}</a>
            </div>
          </td>
          <td>${acc.features.account_age_days}d</td>
          <td>${acc.features.followers_count.toLocaleString()}</td>
          <td>${acc.features.following_count.toLocaleString()}</td>
          <td>${engRate}</td>
          <td>
            <span class="risk-score-pill">${(acc.risk_score * 100).toFixed(1)}%</span>
          </td>
          <td>
            <span class="risk-badge ${getBadgeClass(acc.risk_category)}">${acc.risk_category}</span>
          </td>
          <td>${firstWarning}</td>
          <td>
            <button class="btn btn-secondary btn-sm inspect-user-btn" data-username="${acc.username}">
              Details
            </button>
          </td>
        </tr>
      `;
    });

    DOM.overviewPreviewTableBody.innerHTML = html;

    // Attach inspect listeners
    DOM.overviewPreviewTableBody.querySelectorAll('.inspect-user-btn, .username-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const uname = btn.dataset.username;
        openAccountDetailsModal(uname);
      });
    });

    // Update distribution text pills
    if (DOM.distLowCount) DOM.distLowCount.textContent = `${s.low_risk} Accounts (${lowPct}%)`;
    if (DOM.distMedCount) DOM.distMedCount.textContent = `${s.medium_risk} Accounts (${medPct}%)`;
    if (DOM.distHighCount) DOM.distHighCount.textContent = `${s.high_risk} Accounts (${highPct}%)`;
  }

  // ==================== RESULTS TABLE & PAGINATION ====================
  function setupTableControls() {
    // Search input with debounce
    let searchTimer = null;
    DOM.tableSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (state.searchQuery) {
          DOM.clearSearchBtn.classList.remove('hidden');
        } else {
          DOM.clearSearchBtn.classList.add('hidden');
        }
        applyFiltersAndRenderTable();
      }, 150);
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.tableSearchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.classList.add('hidden');
      applyFiltersAndRenderTable();
    });

    // Risk Filter
    DOM.riskFilterSelect.addEventListener('change', (e) => {
      state.riskFilter = e.target.value;
      applyFiltersAndRenderTable();
    });

    // Sort By
    DOM.sortBySelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndRenderTable();
    });

    // Reset filters button
    DOM.resetTableFiltersBtn.addEventListener('click', () => {
      DOM.tableSearchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.riskFilterSelect.value = 'ALL';
      state.riskFilter = 'ALL';
      DOM.sortBySelect.value = 'risk_score_desc';
      state.sortBy = 'risk_score_desc';
      applyFiltersAndRenderTable();
    });

    // Pagination buttons
    DOM.prevPageBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderResultsTable();
      }
    });

    DOM.nextPageBtn.addEventListener('click', () => {
      const maxPage = Math.ceil(state.filteredResults.length / state.rowsPerPage) || 1;
      if (state.currentPage < maxPage) {
        state.currentPage++;
        renderResultsTable();
      }
    });

    // Export CSV buttons
    if (DOM.exportResultsCsvBtn) {
      DOM.exportResultsCsvBtn.addEventListener('click', exportResultsToCsv);
    }
    if (DOM.reportsDownloadCsvBtn) {
      DOM.reportsDownloadCsvBtn.addEventListener('click', exportResultsToCsv);
    }
    if (DOM.downloadSampleCsvBtn) {
      DOM.downloadSampleCsvBtn.addEventListener('click', () => downloadSampleFile());
    }
    if (DOM.uploadDownloadSampleBtn) {
      DOM.uploadDownloadSampleBtn.addEventListener('click', () => downloadSampleFile());
    }
    if (DOM.loadDemoSampleBtn) {
      DOM.loadDemoSampleBtn.addEventListener('click', () => loadDemoDataset());
    }
  }

  function applyFiltersAndRenderTable() {
    if (!state.analyzedData) return;

    let res = [...state.analyzedData.results];

    // 1. Search Query
    if (state.searchQuery) {
      res = res.filter(r => r.username.toLowerCase().includes(state.searchQuery));
    }

    // 2. Risk Filter
    if (state.riskFilter !== 'ALL') {
      res = res.filter(r => r.risk_category === state.riskFilter);
    }

    // 3. Sorting
    res.sort((a, b) => {
      if (state.sortBy === 'risk_score_desc') return b.risk_score - a.risk_score;
      if (state.sortBy === 'risk_score_asc') return a.risk_score - b.risk_score;
      if (state.sortBy === 'followers_desc') return b.features.followers_count - a.features.followers_count;
      if (state.sortBy === 'following_desc') return b.features.following_count - a.features.following_count;
      if (state.sortBy === 'age_asc') return a.features.account_age_days - b.features.account_age_days;
      return 0;
    });

    state.filteredResults = res;
    state.currentPage = 1;
    renderResultsTable();
  }

  function renderResultsTable() {
    const totalFiltered = state.filteredResults.length;

    if (totalFiltered === 0) {
      DOM.mainResultsTableBody.innerHTML = '';
      DOM.tableEmptyState.classList.remove('hidden');
      DOM.paginationInfo.textContent = 'Showing 0 accounts';
      DOM.prevPageBtn.disabled = true;
      DOM.nextPageBtn.disabled = true;
      DOM.pageNumbersContainer.innerHTML = '';
      return;
    }

    DOM.tableEmptyState.classList.add('hidden');

    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = Math.min(startIndex + state.rowsPerPage, totalFiltered);
    const pageRecords = state.filteredResults.slice(startIndex, endIndex);

    let html = '';
    pageRecords.forEach(acc => {
      const warningsHtml = acc.warning_indicators.length > 0
        ? acc.warning_indicators.map(w => `<span class="warning-signal-tag" title="${w}">${w}</span>`).join(' ')
        : `<span class="warning-none-tag">None flagged</span>`;

      html += `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="user-avatar-mini">${acc.username.substring(0, 2).toUpperCase()}</div>
              <a href="#" class="username-link" data-username="${acc.username}">@${acc.username}</a>
            </div>
          </td>
          <td>${acc.features.account_age_days}d</td>
          <td>${acc.features.followers_count.toLocaleString()}</td>
          <td>${acc.features.following_count.toLocaleString()}</td>
          <td>${acc.features.posts_count}</td>
          <td>${acc.features.avg_likes}</td>
          <td>${acc.features.avg_comments}</td>
          <td>
            <span class="risk-score-pill">${(acc.risk_score * 100).toFixed(1)}%</span>
          </td>
          <td>
            <span class="risk-badge ${getBadgeClass(acc.risk_category)}">${acc.risk_category}</span>
          </td>
          <td style="max-width: 250px; overflow: hidden;">${warningsHtml}</td>
          <td>
            <button class="btn btn-secondary btn-sm inspect-user-btn" data-username="${acc.username}">
              View
            </button>
          </td>
        </tr>
      `;
    });

    DOM.mainResultsTableBody.innerHTML = html;

    // Attach inspect listeners
    DOM.mainResultsTableBody.querySelectorAll('.inspect-user-btn, .username-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAccountDetailsModal(btn.dataset.username);
      });
    });

    // Pagination updates
    const totalPages = Math.ceil(totalFiltered / state.rowsPerPage) || 1;
    DOM.paginationInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalFiltered} accounts`;
    DOM.prevPageBtn.disabled = state.currentPage === 1;
    DOM.nextPageBtn.disabled = state.currentPage === totalPages;

    let pageHtml = '';
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && Math.abs(p - state.currentPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) {
          pageHtml += `<span class="page-ellipsis" style="color: var(--text-muted); padding: 0 4px;">...</span>`;
        }
        continue;
      }
      pageHtml += `
        <span class="page-num ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</span>
      `;
    }
    DOM.pageNumbersContainer.innerHTML = pageHtml;

    DOM.pageNumbersContainer.querySelectorAll('.page-num').forEach(pn => {
      pn.addEventListener('click', () => {
        state.currentPage = parseInt(pn.dataset.page);
        renderResultsTable();
      });
    });
  }

  // ==================== CSV EXPORT & SAMPLE DOWNLOAD ====================
  async function exportResultsToCsv() {
    if (!state.analyzedData || !state.analyzedData.results || state.analyzedData.results.length === 0) {
      showToast('No analysis data available to export.', 'error');
      return;
    }

    try {
      showLoading(true);
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: state.filteredResults })
      });

      if (!res.ok) throw new Error('Export generation failed.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fakeguard_ai_audit_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('CSV Report exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  function downloadSampleFile() {
    const a = document.createElement('a');
    a.href = '/api/sample';
    a.download = 'sample_followers.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Downloading sample demonstration CSV...', 'info');
  }

  // ==================== DROPZONE & FILE UPLOAD ====================
  function setupDropzone() {
    const dropzone = DOM.dropzone;
    const fileInput = DOM.fileInput;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    DOM.removeSelectedFileBtn.addEventListener('click', clearSelectedFile);

    DOM.startUploadBtn.addEventListener('click', () => {
      if (selectedFile) {
        processAndAnalyzeFile(selectedFile);
      }
    });
  }

  function handleFileSelection(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Validation Error: Only .csv files are supported.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Validation Error: File exceeds 5 MB maximum size limit.', 'error');
      return;
    }

    selectedFile = file;
    DOM.selectedFileName.textContent = file.name;
    DOM.selectedFileSize.textContent = formatBytes(file.size);
    DOM.selectedFileCard.classList.remove('hidden');
    DOM.uploadProgressBarFill.style.width = '100%';
  }

  function clearSelectedFile() {
    selectedFile = null;
    DOM.fileInput.value = '';
    DOM.selectedFileCard.classList.add('hidden');
    DOM.uploadProgressBarFill.style.width = '0%';
  }

  // ==================== SINGLE ACCOUNT SIMULATOR ====================
  function setupSingleAnalyzer() {
    DOM.singleAccountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await runSinglePrediction();
    });

    // Preset Buttons
    DOM.loadSuspiciousPresetBtn.addEventListener('click', () => {
      DOM.singleUsername.value = 'bot_boost_99';
      DOM.singleAge.value = '12';
      DOM.singleFollowers.value = '35';
      DOM.singleFollowing.value = '4200';
      DOM.singlePosts.value = '1';
      DOM.singleLikes.value = '0.4';
      DOM.singleComments.value = '0.0';
      DOM.singleHasPic.value = '0';
      DOM.singleBioLen.value = '0';
      DOM.singleRepComments.value = '5';
      runSinglePrediction();
    });

    DOM.loadLegitPresetBtn.addEventListener('click', () => {
      DOM.singleUsername.value = 'organic_creator';
      DOM.singleAge.value = '840';
      DOM.singleFollowers.value = '4200';
      DOM.singleFollowing.value = '650';
      DOM.singlePosts.value = '145';
      DOM.singleLikes.value = '210.0';
      DOM.singleComments.value = '18.4';
      DOM.singleHasPic.value = '1';
      DOM.singleBioLen.value = '90';
      DOM.singleRepComments.value = '0';
      runSinglePrediction();
    });
  }

  async function runSinglePrediction() {
    const payload = {
      username: DOM.singleUsername.value.trim() || 'target_user',
      account_age_days: parseFloat(DOM.singleAge.value) || 0,
      followers_count: parseFloat(DOM.singleFollowers.value) || 0,
      following_count: parseFloat(DOM.singleFollowing.value) || 0,
      posts_count: parseFloat(DOM.singlePosts.value) || 0,
      avg_likes: parseFloat(DOM.singleLikes.value) || 0,
      avg_comments: parseFloat(DOM.singleComments.value) || 0,
      has_profile_pic: parseInt(DOM.singleHasPic.value) || 0,
      bio_length: parseFloat(DOM.singleBioLen.value) || 0,
      repetitive_comments: parseFloat(DOM.singleRepComments.value) || 0
    };

    try {
      showLoading(true);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([payload])
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Single analysis failed');
      }

      const rec = data.results[0];
      const probPct = (rec.risk_score * 100).toFixed(1);

      DOM.singleRiskScoreDisplay.textContent = `${probPct}%`;
      DOM.singleRiskBadge.textContent = `${rec.risk_category} Account`;
      DOM.singleRiskBadge.className = `risk-badge ${getBadgeClass(rec.risk_category)}`;

      // Update Gauge conic gradient
      let color = 'var(--risk-low)';
      if (rec.risk_category === 'Medium Risk') color = 'var(--risk-med)';
      if (rec.risk_category === 'High Risk') color = 'var(--risk-high)';

      DOM.singleGaugeCircle.style.background = `conic-gradient(${color} 0% ${probPct}%, rgba(255, 255, 255, 0.08) ${probPct}% 100%)`;
      DOM.singleGaugeCircle.style.boxShadow = `0 0 25px ${color}55`;

      if (rec.risk_category === 'Low Risk') {
        DOM.singleRiskSummaryNote.textContent = 'Account exhibits natural, organic social interaction patterns.';
      } else if (rec.risk_category === 'Medium Risk') {
        DOM.singleRiskSummaryNote.textContent = 'Moderate statistical anomaly detected; potential engagement pod or low-activity profile.';
      } else {
        DOM.singleRiskSummaryNote.textContent = 'High probability of automated bot behavior, mass-following script, or purchased followers.';
      }

      // Warnings
      if (rec.warning_indicators.length > 0) {
        DOM.singleWarningList.innerHTML = rec.warning_indicators.map(w => `<li>${w}</li>`).join('');
      } else {
        DOM.singleWarningList.innerHTML = '<li>No independent heuristic warning triggers fired.</li>';
      }

      showToast(`Analyzed @${rec.username}: ${rec.risk_category}`, 'info');

    } catch (err) {
      console.error(err);
      showToast('Simulator error: ' + err.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  // ==================== ACCOUNT DETAILS MODAL ====================
  function setupModal() {
    DOM.modalCloseBtn.addEventListener('click', closeModal);
    DOM.modalDoneBtn.addEventListener('click', closeModal);
    DOM.accountDetailsModal.addEventListener('click', (e) => {
      if (e.target === DOM.accountDetailsModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openAccountDetailsModal(username) {
    if (!state.analyzedData) return;
    const account = state.analyzedData.results.find(a => a.username === username);
    if (!account) return;

    DOM.modalUsername.textContent = `@${account.username}`;
    DOM.modalAvatarInitials.textContent = account.username.substring(0, 2).toUpperCase();

    const pic = account.features.has_profile_pic === 1;
    DOM.modalProfileStatus.textContent = pic ? 'Custom Profile Picture Available' : 'No Profile Picture (Default Avatar)';
    DOM.modalAvatarCircle.style.background = pic ? 'var(--primary-gradient)' : '#334155';

    DOM.modalRiskScore.textContent = `${(account.risk_score * 100).toFixed(1)}%`;
    DOM.modalRiskBadge.textContent = account.risk_category;
    DOM.modalRiskBadge.className = `risk-badge ${getBadgeClass(account.risk_category)}`;

    if (account.risk_category === 'Low Risk') {
      DOM.modalRiskEvalText.textContent = 'Healthy social indicators verified. Behavioral characteristics align with organic human users.';
    } else if (account.risk_category === 'Medium Risk') {
      DOM.modalRiskEvalText.textContent = 'Inconclusive or borderline metrics. Exhibits minor engagement imbalances or irregular post cadence.';
    } else {
      DOM.modalRiskEvalText.textContent = 'Strong statistical deviation indicating automated mass-following, comment botting, or dummy profile activity.';
    }

    // Populate features
    const f = account.features;
    DOM.modalFeatAge.textContent = `${f.account_age_days} days`;
    DOM.modalFeatFollowers.textContent = f.followers_count.toLocaleString();
    DOM.modalFeatFollowing.textContent = f.following_count.toLocaleString();

    const ratio = f.following_count > 0 ? (f.followers_count / f.following_count).toFixed(2) : f.followers_count.toFixed(0);
    DOM.modalFeatRatio.textContent = ratio;
    DOM.modalFeatPosts.textContent = f.posts_count;
    DOM.modalFeatLikes.textContent = f.avg_likes;
    DOM.modalFeatComments.textContent = f.avg_comments;
    DOM.modalFeatBio.textContent = `${f.bio_length} chars`;
    DOM.modalFeatRepComments.textContent = f.repetitive_comments;

    // Populate warnings
    if (account.warning_indicators.length > 0) {
      DOM.modalWarningsList.innerHTML = account.warning_indicators.map(w => `<li>${w}</li>`).join('');
    } else {
      DOM.modalWarningsList.innerHTML = '<li style="color: var(--risk-low);">No heuristic warning triggers fired for this account.</li>';
    }

    DOM.accountDetailsModal.classList.remove('hidden');
  }

  function closeModal() {
    DOM.accountDetailsModal.classList.add('hidden');
  }

  // ==================== REPORTS VIEW ====================
  function renderReportsView() {
    if (!state.analyzedData) return;
    const s = state.analyzedData.summary;

    DOM.reportScopeCount.textContent = `${s.total_accounts} Accounts Evaluated`;
    DOM.reportAvgRiskScore.textContent = s.average_risk_percentage || '0.0%';
    DOM.reportTimestampDisplay.textContent = new Date().toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const highPct = ((s.high_risk / Math.max(s.total_accounts, 1)) * 100).toFixed(1);
    DOM.reportNarrativeP.innerHTML = `
      Comprehensive audit of <strong>${s.total_accounts} accounts</strong> identified <strong>${s.high_risk} High Risk profiles (${highPct}%)</strong>, 
      <strong>${s.medium_risk} Medium Risk profiles</strong>, and <strong>${s.low_risk} Low Risk profiles</strong>. 
      The most common non-authentic indicators observed were follow-ratio asymmetry and repetitive promotional comment patterns.
    `;

    // Preview table
    const samplePreview = state.analyzedData.results.slice(0, 8);
    let html = '';
    samplePreview.forEach(acc => {
      const warnings = acc.warning_indicators.join(', ') || 'None';
      html += `
        <tr>
          <td><strong>@${acc.username}</strong></td>
          <td>${(acc.risk_score * 100).toFixed(1)}%</td>
          <td><span class="risk-badge ${getBadgeClass(acc.risk_category)}">${acc.risk_category}</span></td>
          <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${warnings}</td>
          <td>${acc.features.account_age_days}d</td>
          <td>${acc.features.followers_count.toLocaleString()}</td>
          <td>${acc.features.following_count.toLocaleString()}</td>
        </tr>
      `;
    });
    DOM.reportPreviewTableBody.innerHTML = html;
  }

  // ==================== CHARTS INTEGRATION ====================
  function renderAllCharts() {
    if (!state.analyzedData || typeof Chart === 'undefined') return;

    const s = state.analyzedData.summary;
    const results = state.analyzedData.results;

    // Chart colors
    const colorLow = '#10b981';
    const colorMed = '#f59e0b';
    const colorHigh = '#ef4444';

    // 1. Overview Doughnut Chart
    renderDoughnut('riskDoughnutChart', s);

    // 2. Overview Engagement / Risk Bar Chart
    renderRiskFollowerBar('engagementBarChart', results);

    // 3. Detailed Distribution Doughnut
    renderDoughnut('detailedDoughnutChart', s);

    // 4. Following vs Followers Scatter / Asymmetry
    renderAsymmetryScatter('scatterAsymmetryChart', results);
  }

  function renderDoughnut(canvasId, summary) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (state.charts[canvasId]) {
      state.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk (<40%)', 'Medium Risk (40-70%)', 'High Risk (≥70%)'],
        datasets: [{
          data: [summary.low_risk, summary.medium_risk, summary.high_risk],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderColor: '#111728',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        cutout: '72%'
      }
    });
  }

  function renderRiskFollowerBar(canvasId, results) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (state.charts[canvasId]) {
      state.charts[canvasId].destroy();
    }

    // Bucket into 5 risk score tiers: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
    const tiers = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    const counts = [0, 0, 0, 0, 0];

    results.forEach(r => {
      const p = r.risk_score;
      if (p < 0.2) counts[0]++;
      else if (p < 0.4) counts[1]++;
      else if (p < 0.6) counts[2]++;
      else if (p < 0.8) counts[3]++;
      else counts[4]++;
    });

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tiers,
        datasets: [{
          label: 'Accounts Count',
          data: counts,
          backgroundColor: [
            'rgba(16, 185, 129, 0.75)',
            'rgba(16, 185, 129, 0.65)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(239, 68, 68, 0.75)',
            'rgba(239, 68, 68, 0.95)'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', stepSize: 1 }
          }
        }
      }
    });
  }

  function renderAsymmetryScatter(canvasId, results) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (state.charts[canvasId]) {
      state.charts[canvasId].destroy();
    }

    const scatterData = results.map(r => ({
      x: r.features.followers_count,
      y: r.features.following_count,
      user: r.username,
      risk: r.risk_category
    }));

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Low Risk',
            data: scatterData.filter(d => d.risk === 'Low Risk'),
            backgroundColor: '#10b981'
          },
          {
            label: 'Medium Risk',
            data: scatterData.filter(d => d.risk === 'Medium Risk'),
            backgroundColor: '#f59e0b'
          },
          {
            label: 'High Risk',
            data: scatterData.filter(d => d.risk === 'High Risk'),
            backgroundColor: '#ef4444'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const item = ctx.raw;
                return `@${item.user}: Followers=${item.x}, Following=${item.y}`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: { color: '#94a3b8' }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Followers Count', color: '#64748b' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            title: { display: true, text: 'Following Count', color: '#64748b' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // ==================== HISTORY MANAGEMENT ====================
  function addHistoryRecord(record) {
    state.history.unshift(record);
    if (state.history.length > 10) state.history.pop();
    saveHistoryToStorage();
    renderHistoryTable();
  }

  function renderHistoryTable() {
    if (!DOM.historyTableBody) return;
    if (state.history.length === 0) {
      DOM.historyTableBody.innerHTML = `
        <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">No previous dataset batches logged in this session.</td></tr>
      `;
      return;
    }

    let html = '';
    state.history.forEach(h => {
      html += `
        <tr>
          <td>${h.date} ${h.timestamp}</td>
          <td><strong>${h.filename}</strong></td>
          <td>${h.total}</td>
          <td><span class="risk-badge badge-low">${h.low}</span></td>
          <td><span class="risk-badge badge-med">${h.med}</span></td>
          <td><span class="risk-badge badge-high">${h.high}</span></td>
          <td><strong>${h.highPercent}</strong></td>
          <td>
            <button class="btn btn-secondary btn-sm reload-history-btn" data-id="${h.id}">Reload</button>
          </td>
        </tr>
      `;
    });

    DOM.historyTableBody.innerHTML = html;

    DOM.historyTableBody.querySelectorAll('.reload-history-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = state.history.find(x => x.id === parseInt(btn.dataset.id));
        if (item) {
          state.analyzedData = item.data;
          state.filteredResults = [...item.data.results];
          state.currentPage = 1;
          renderDashboardOverview();
          renderResultsTable();
          renderReportsView();
          renderAllCharts();
          navigateToSection('overview');
          showToast(`Reloaded dataset batch "${item.filename}"`, 'info');
        }
      });
    });
  }

  function saveHistoryToStorage() {
    try {
      sessionStorage.setItem('fakeguard_history', JSON.stringify(state.history));
    } catch (e) {
      // quota or private mode ignore
    }
  }

  function loadHistoryFromStorage() {
    try {
      const data = sessionStorage.getItem('fakeguard_history');
      if (data) {
        state.history = JSON.parse(data);
        renderHistoryTable();
      }
    } catch (e) {}

    if (DOM.clearHistoryBtn) {
      DOM.clearHistoryBtn.addEventListener('click', () => {
        state.history = [];
        sessionStorage.removeItem('fakeguard_history');
        renderHistoryTable();
        showToast('Analysis history cleared.', 'info');
      });
    }
  }

  // ==================== SETTINGS & PREFERENCES ====================
  function setupSettings() {
    if (DOM.settingCompactTableToggle) {
      DOM.settingCompactTableToggle.addEventListener('change', (e) => {
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(t => {
          if (e.target.checked) {
            t.classList.add('table-compact');
          } else {
            t.classList.remove('table-compact');
          }
        });
      });
    }

    if (DOM.settingAnimationsToggle) {
      DOM.settingAnimationsToggle.addEventListener('change', (e) => {
        document.body.style.setProperty('--transition-normal', e.target.checked ? '0.25s ease' : '0s');
        document.body.style.setProperty('--transition-fast', e.target.checked ? '0.15s ease' : '0s');
      });
    }
  }

  // ==================== FEEDBACK HELPERS ====================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function showLoading(show) {
    if (show) {
      DOM.loadingOverlay.classList.remove('hidden');
    } else {
      DOM.loadingOverlay.classList.add('hidden');
    }
  }

  function getBadgeClass(cat) {
    if (cat === 'Low Risk') return 'badge-low';
    if (cat === 'Medium Risk') return 'badge-med';
    return 'badge-high';
  }

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Run initial setup on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
