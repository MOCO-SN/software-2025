// ===== js/bugreports.js =====
// Bug Reports Preview & Management Controller

document.addEventListener('DOMContentLoaded', () => {
  const reportsListEl = document.getElementById('bugReportsList');
  const reportsCountBadge = document.getElementById('reportsCountBadge');
  const errorBox = document.getElementById('bugReportsError');
  const refreshBtn = document.getElementById('refreshReportsBtn');

  const statTotalEl = document.getElementById('statTotal');
  const statOpenEl = document.getElementById('statOpen');
  const statClosedEl = document.getElementById('statClosed');
  const statUrgentEl = document.getElementById('statUrgent');

  const statusBtns = document.querySelectorAll('#statusFilterGroup .cat-btn');
  const severityFilter = document.getElementById('severityFilter');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  const previewModal = document.getElementById('bugPreviewModal');
  const closeBugModalBtn = document.getElementById('closeBugModalBtn');
  const modalBugBadges = document.getElementById('modalBugBadges');
  const modalBugTitle = document.getElementById('modalBugTitle');
  const modalBugId = document.getElementById('modalBugId');
  const modalBugMeta = document.getElementById('modalBugMeta');
  const modalBugDesc = document.getElementById('modalBugDesc');
  const modalToggleStatusBtn = document.getElementById('modalToggleStatusBtn');
  const modalDeleteBugBtn = document.getElementById('modalDeleteBugBtn');

  const devAccessBtn = document.getElementById('devAccessBtn');
  const devUnlockModal = document.getElementById('devUnlockModal');
  const closeDevModalBtn = document.getElementById('closeDevModalBtn');
  const cancelDevUnlockBtn = document.getElementById('cancelDevUnlockBtn');
  const devUnlockForm = document.getElementById('devUnlockForm');
  const devKeyInput = document.getElementById('devKeyInput');
  const toggleDevKeyBtn = document.getElementById('toggleDevKeyBtn');
  const devKeyError = document.getElementById('devKeyError');

  const DEVELOPER_KEY_HASH = '48fb0285e98549c3109d5748fb0fa3a9559aee0e9d01e495b6fef2a923f1084f';
  const DEV_SESSION_KEY = 'mocostore_bug_dev_unlocked';

  let allReports = [];
  let currentStatus = 'all';
  let currentSeverity = 'all';
  let searchQuery = '';
  let activeModalReportId = null;
  let isDeveloperUnlocked = sessionStorage.getItem(DEV_SESSION_KEY) === 'true';

  const TYPE_LABELS = {
    'broken-link': 'Broken Download / APK Link',
    'app-info': 'Wrong App Info / Listing',
    'ui-bug': 'UI / Layout Bug',
    'search-filter': 'Search / Filter Issue',
    'performance': 'Slow Loading / Performance',
    'security': 'Security / Unsafe File',
    'other': 'Other'
  };

  function escapeHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(ts) {
    if (!ts) return 'Unknown';
    try {
      return new Date(Number(ts)).toLocaleString();
    } catch {
      return 'Unknown';
    }
  }

  function normalizeStatus(status) {
    return (status || 'open').toLowerCase() === 'closed' ? 'closed' : 'open';
  }

  function toast(message) {
    const existing = document.getElementById('bugAdminToast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'bugAdminToast';
    el.textContent = message;
    el.style.position = 'fixed';
    el.style.bottom = '28px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = 'rgba(15, 23, 42, 0.92)';
    el.style.color = '#fff';
    el.style.padding = '12px 24px';
    el.style.borderRadius = '25px';
    el.style.fontSize = '14px';
    el.style.fontWeight = '500';
    el.style.zIndex = '10050';
    el.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.28)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  function clearError() {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.style.display = 'none';
  }

  function updateDeveloperUI() {
    if (devAccessBtn) {
      devAccessBtn.classList.toggle('success', isDeveloperUnlocked);
      devAccessBtn.innerHTML = isDeveloperUnlocked
        ? '<i class="fas fa-unlock"></i> Developer Active (Lock)'
        : '<i class="fas fa-user-shield"></i> Developer Mode';
    }
    if (modalDeleteBugBtn) {
      modalDeleteBugBtn.style.display = isDeveloperUnlocked ? 'inline-flex' : 'none';
    }
  }

  function openDevUnlockModal() {
    if (!devUnlockModal) return;
    if (devKeyError) {
      devKeyError.textContent = '';
      devKeyError.style.display = 'none';
    }
    if (devKeyInput) {
      devKeyInput.value = '';
      devKeyInput.type = 'password';
    }
    const eyeIcon = toggleDevKeyBtn?.querySelector('i');
    if (eyeIcon) {
      eyeIcon.classList.add('fa-eye');
      eyeIcon.classList.remove('fa-eye-slash');
    }
    devUnlockModal.classList.add('active');
    devUnlockModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => devKeyInput?.focus(), 60);
  }

  function closeDevUnlockModal() {
    if (!devUnlockModal) return;
    devUnlockModal.classList.remove('active');
    devUnlockModal.setAttribute('aria-hidden', 'true');
  }

  function updateStats() {
    const total = allReports.length;
    const openCount = allReports.filter(r => normalizeStatus(r.status) === 'open').length;
    const closedCount = total - openCount;
    const urgentCount = allReports.filter(r => {
      const sev = (r.severity || 'medium').toLowerCase();
      return normalizeStatus(r.status) === 'open' && (sev === 'high' || sev === 'critical');
    }).length;

    if (statTotalEl) statTotalEl.textContent = total;
    if (statOpenEl) statOpenEl.textContent = openCount;
    if (statClosedEl) statClosedEl.textContent = closedCount;
    if (statUrgentEl) statUrgentEl.textContent = urgentCount;
  }

  function getFilteredReports() {
    return allReports.filter(report => {
      const status = normalizeStatus(report.status);
      const sev = (report.severity || 'medium').toLowerCase();

      if (currentStatus !== 'all' && status !== currentStatus) return false;
      if (currentSeverity !== 'all' && sev !== currentSeverity) return false;

      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = [
          report.id,
          report.title,
          report.description,
          report.appRef,
          report.reporter,
          report.environment,
          TYPE_LABELS[report.type] || report.type
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  function renderReports() {
    updateStats();
    const filtered = getFilteredReports();

    if (reportsCountBadge) {
      reportsCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Report' : 'Reports'}`;
    }

    if (!reportsListEl) return;

    if (filtered.length === 0) {
      reportsListEl.innerHTML = `
        <div class="bug-empty-state">
          <i class="fas fa-check-double"></i>
          <h3>No bug reports found</h3>
          <p>${allReports.length === 0 ? 'No bug reports have been submitted yet.' : 'No reports match the current filters.'}</p>
        </div>
      `;
      return;
    }

    reportsListEl.innerHTML = filtered.map(report => {
      const status = normalizeStatus(report.status);
      const isClosed = status === 'closed';
      const sev = (report.severity || 'medium').toLowerCase();
      const typeLabel = TYPE_LABELS[report.type] || report.type || 'General';

      return `
        <article class="bug-report-card ${isClosed ? 'is-closed' : ''}" data-id="${escapeHtml(report.id)}">
          <div class="bug-card-top">
            <div class="bug-card-badges">
              <span class="bug-status-badge ${status}">
                <i class="fas ${isClosed ? 'fa-check-circle' : 'fa-dot-circle'}"></i>
                ${isClosed ? 'Fixed / Closed' : 'Open'}
              </span>
              <span class="bug-severity-badge ${escapeHtml(sev)}">${escapeHtml(sev.toUpperCase())}</span>
              <span class="bug-type-pill">${escapeHtml(typeLabel)}</span>
            </div>
            <span class="bug-card-date"><i class="far fa-clock"></i> ${escapeHtml(formatDate(report.createdAt))}</span>
          </div>

          <h3 class="bug-card-title">${escapeHtml(report.title || 'Untitled Bug Report')}</h3>
          <p class="bug-card-desc">${escapeHtml(report.description || 'No description provided.')}</p>

          <div class="bug-card-meta">
            ${report.appRef ? `<span><i class="fas fa-mobile-alt"></i> App: <strong>${escapeHtml(report.appRef)}</strong></span>` : ''}
            ${report.environment ? `<span><i class="fas fa-laptop-code"></i> ${escapeHtml(report.environment)}</span>` : ''}
            ${report.reporter ? `<span><i class="fas fa-user"></i> ${escapeHtml(report.reporter)}</span>` : ''}
            <span><i class="fas fa-hashtag"></i> <code>${escapeHtml(report.id)}</code></span>
          </div>

          <div class="bug-card-actions">
            <button type="button" class="btn-pill-sm preview-bug-btn" data-id="${escapeHtml(report.id)}">
              <i class="fas fa-eye"></i> Preview
            </button>
            <button type="button" class="btn-pill-sm ${isClosed ? '' : 'success'} toggle-bug-status-btn" data-id="${escapeHtml(report.id)}">
              <i class="fas ${isClosed ? 'fa-redo' : 'fa-check'}"></i>
              ${isClosed ? 'Reopen Bug' : 'Close Bug (Fixed)'}
            </button>
            ${isDeveloperUnlocked ? `
              <button type="button" class="btn-pill-sm danger delete-bug-btn" data-id="${escapeHtml(report.id)}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    reportsListEl.querySelectorAll('.preview-bug-btn').forEach(btn => {
      btn.addEventListener('click', () => openPreviewModal(btn.dataset.id));
    });
    reportsListEl.querySelectorAll('.toggle-bug-status-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleBugStatus(btn.dataset.id));
    });
    reportsListEl.querySelectorAll('.delete-bug-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteBugReport(btn.dataset.id));
    });
  }

  function openPreviewModal(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report || !previewModal) return;

    activeModalReportId = reportId;
    const status = normalizeStatus(report.status);
    const isClosed = status === 'closed';
    const sev = (report.severity || 'medium').toLowerCase();
    const typeLabel = TYPE_LABELS[report.type] || report.type || 'General';

    if (modalBugBadges) {
      modalBugBadges.innerHTML = `
        <span class="bug-status-badge ${status}">
          <i class="fas ${isClosed ? 'fa-check-circle' : 'fa-dot-circle'}"></i>
          ${isClosed ? 'Fixed / Closed' : 'Open'}
        </span>
        <span class="bug-severity-badge ${escapeHtml(sev)}">${escapeHtml(sev.toUpperCase())}</span>
        <span class="bug-type-pill">${escapeHtml(typeLabel)}</span>
      `;
    }

    if (modalBugTitle) modalBugTitle.textContent = report.title || 'Untitled Bug Report';
    if (modalBugId) modalBugId.textContent = report.id;
    if (modalBugDesc) modalBugDesc.textContent = report.description || 'No description provided.';

    if (modalBugMeta) {
      modalBugMeta.innerHTML = `
        <div><span>Related App</span><strong>${escapeHtml(report.appRef || 'Not specified')}</strong></div>
        <div><span>Device / Browser</span><strong>${escapeHtml(report.environment || 'Not specified')}</strong></div>
        <div><span>Reporter</span><strong>${escapeHtml(report.reporter || 'Anonymous')}</strong></div>
        <div><span>Submitted</span><strong>${escapeHtml(formatDate(report.createdAt))}</strong></div>
        ${isClosed && report.closedAt ? `<div><span>Closed / Fixed At</span><strong>${escapeHtml(formatDate(report.closedAt))}</strong></div>` : ''}
        ${report.pageUrl ? `<div><span>Submitted From</span><strong>${escapeHtml(report.pageUrl)}</strong></div>` : ''}
      `;
    }

    if (modalToggleStatusBtn) {
      modalToggleStatusBtn.innerHTML = isClosed
        ? '<i class="fas fa-redo"></i> Reopen Bug'
        : '<i class="fas fa-check-circle"></i> Mark Fixed &amp; Close';
    }

    updateDeveloperUI();
    previewModal.classList.add('active');
    previewModal.setAttribute('aria-hidden', 'false');
  }

  function closePreviewModal() {
    if (!previewModal) return;
    activeModalReportId = null;
    previewModal.classList.remove('active');
    previewModal.setAttribute('aria-hidden', 'true');
  }

  function toggleBugStatus(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report || typeof db === 'undefined') return;

    const current = normalizeStatus(report.status);
    const nextStatus = current === 'closed' ? 'open' : 'closed';
    const updates = nextStatus === 'closed'
      ? { status: 'closed', closedAt: Date.now() }
      : { status: 'open', closedAt: null };

    db.ref('bugReports').child(reportId).update(updates)
      .then(() => {
        report.status = nextStatus;
        report.closedAt = updates.closedAt;
        renderReports();
        if (activeModalReportId === reportId) {
          openPreviewModal(reportId);
        }
        toast(nextStatus === 'closed' ? 'Bug marked as fixed and closed!' : 'Bug reopened.');
      })
      .catch((err) => {
        showError('Could not update bug status: ' + err.message);
      });
  }

  function deleteBugReport(reportId) {
    if (!isDeveloperUnlocked) {
      openDevUnlockModal();
      return;
    }
    const report = allReports.find(r => r.id === reportId);
    if (!report || typeof db === 'undefined') return;

    const confirmed = window.confirm(`Delete bug report "${report.title || reportId}" permanently?`);
    if (!confirmed) return;

    db.ref('bugReports').child(reportId).remove()
      .then(() => {
        allReports = allReports.filter(r => r.id !== reportId);
        if (activeModalReportId === reportId) {
          closePreviewModal();
        }
        renderReports();
        toast('Bug report deleted.');
      })
      .catch((err) => {
        showError('Could not delete bug report: ' + err.message);
      });
  }

  function loadBugReports() {
    clearError();
    if (typeof db === 'undefined') {
      showError('Database connection is unavailable.');
      return;
    }

    if (reportsListEl) {
      reportsListEl.innerHTML = Array(3).fill(`
        <div class="skeleton-card" style="padding:20px;">
          <div class="skeleton skeleton-text" style="width:45%; height:16px;"></div>
          <div class="skeleton skeleton-text" style="width:85%;"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      `).join('');
    }

    db.ref('bugReports').once('value')
      .then((snapshot) => {
        const list = [];
        let order = 0;
        snapshot.forEach((child) => {
          list.push({ id: child.key, _order: order++, ...child.val() });
        });

        // Open bugs first, then newest first
        list.sort((a, b) => {
          const sa = normalizeStatus(a.status) === 'open' ? 0 : 1;
          const sb = normalizeStatus(b.status) === 'open' ? 0 : 1;
          if (sa !== sb) return sa - sb;
          const ta = Number(a.createdAt || 0);
          const tb = Number(b.createdAt || 0);
          if (ta !== tb) return tb - ta;
          return b._order - a._order;
        });

        allReports = list;
        renderReports();
      })
      .catch((err) => {
        if (reportsCountBadge) reportsCountBadge.textContent = '0 Reports';
        if (reportsListEl) reportsListEl.innerHTML = '';
        showError('Could not load bug reports: ' + err.message);
      });
  }

  // Wire controls
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status || 'all';
      renderReports();
    });
  });

  if (severityFilter) {
    severityFilter.addEventListener('change', () => {
      currentSeverity = severityFilter.value || 'all';
      renderReports();
    });
  }

  function applySearch() {
    searchQuery = searchInput ? searchInput.value : '';
    renderReports();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') applySearch();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', applySearch);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadBugReports);
  }

  if (closeBugModalBtn) {
    closeBugModalBtn.addEventListener('click', closePreviewModal);
  }

  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) closePreviewModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (devUnlockModal?.classList.contains('active')) {
        closeDevUnlockModal();
      } else if (previewModal?.classList.contains('active')) {
        closePreviewModal();
      }
    }
  });

  if (devAccessBtn) {
    devAccessBtn.addEventListener('click', () => {
      if (isDeveloperUnlocked) {
        isDeveloperUnlocked = false;
        sessionStorage.removeItem(DEV_SESSION_KEY);
        updateDeveloperUI();
        renderReports();
        toast('Developer mode locked.');
      } else {
        openDevUnlockModal();
      }
    });
  }

  if (closeDevModalBtn) {
    closeDevModalBtn.addEventListener('click', closeDevUnlockModal);
  }
  if (cancelDevUnlockBtn) {
    cancelDevUnlockBtn.addEventListener('click', closeDevUnlockModal);
  }
  if (devUnlockModal) {
    devUnlockModal.addEventListener('click', (e) => {
      if (e.target === devUnlockModal) closeDevUnlockModal();
    });
  }

  if (toggleDevKeyBtn && devKeyInput) {
    toggleDevKeyBtn.addEventListener('click', () => {
      const isPassword = devKeyInput.type === 'password';
      devKeyInput.type = isPassword ? 'text' : 'password';
      const icon = toggleDevKeyBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
      }
    });
  }

  if (devUnlockForm) {
    devUnlockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = (devKeyInput?.value || '').trim().toLowerCase();
      if (!entered || typeof window.hashAccessCode !== 'function') {
        if (devKeyError) {
          devKeyError.textContent = 'Please enter the developer key.';
          devKeyError.style.display = 'block';
        }
        return;
      }

      if (window.hashAccessCode(entered) !== DEVELOPER_KEY_HASH) {
        if (devKeyError) {
          devKeyError.textContent = 'Invalid developer key.';
          devKeyError.style.display = 'block';
        }
        return;
      }

      isDeveloperUnlocked = true;
      sessionStorage.setItem(DEV_SESSION_KEY, 'true');
      closeDevUnlockModal();
      updateDeveloperUI();
      renderReports();
      toast('Developer mode unlocked — delete option enabled.');
    });
  }

  if (modalToggleStatusBtn) {
    modalToggleStatusBtn.addEventListener('click', () => {
      if (activeModalReportId) toggleBugStatus(activeModalReportId);
    });
  }

  if (modalDeleteBugBtn) {
    modalDeleteBugBtn.addEventListener('click', () => {
      if (activeModalReportId) deleteBugReport(activeModalReportId);
    });
  }

  updateDeveloperUI();
  loadBugReports();
});
