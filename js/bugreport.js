// ===== js/bugreport.js =====
// Bug Report Page Controller

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bugReportForm');
  const bugTitle = document.getElementById('bugTitle');
  const bugType = document.getElementById('bugType');
  const bugSeverity = document.getElementById('bugSeverity');
  const bugAppRef = document.getElementById('bugAppRef');
  const bugEnvironment = document.getElementById('bugEnvironment');
  const bugDescription = document.getElementById('bugDescription');
  const bugReporter = document.getElementById('bugReporter');
  const bugErrorBox = document.getElementById('bugErrorBox');
  const bugFallbackCopyWrap = document.getElementById('bugFallbackCopyWrap');
  const copyBugReportBtn = document.getElementById('copyBugReportBtn');
  const bugSubmitBtn = document.getElementById('bugSubmitBtn');

  const bugSuccessCard = document.getElementById('bugSuccessCard');
  const submittedBugTitle = document.getElementById('submittedBugTitle');
  const bugReportIdEl = document.getElementById('bugReportId');
  const submitAnotherBugBtn = document.getElementById('submitAnotherBugBtn');
  const listedAppsDatalist = document.getElementById('listedAppsDatalist');

  // Header search redirects to All Apps page
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function handleSearch() {
    const q = searchInput?.value.trim();
    if (q) {
      window.location.href = `apps.html?search=${encodeURIComponent(q)}`;
    }
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  // Prefill app reference from ?app= query param if provided
  const params = new URLSearchParams(window.location.search);
  const appParam = params.get('app');
  if (appParam && bugAppRef) {
    bugAppRef.value = appParam;
  }

  // Populate listed apps datalist for quick selection
  if (listedAppsDatalist && typeof appsRef !== 'undefined') {
    appsRef.limitToLast(100).once('value')
      .then((snapshot) => {
        const frag = document.createDocumentFragment();
        snapshot.forEach((child) => {
          const val = child.val();
          if (val && val.name) {
            const opt = document.createElement('option');
            opt.value = `${val.name} (${child.key})`;
            frag.appendChild(opt);
          }
        });
        listedAppsDatalist.appendChild(frag);
      })
      .catch(() => {});
  }

  let lastPayloadText = '';

  function showBugError(message) {
    if (!bugErrorBox) return;
    bugErrorBox.textContent = message;
    bugErrorBox.style.display = 'block';
    if (bugFallbackCopyWrap && lastPayloadText) {
      bugFallbackCopyWrap.style.display = 'block';
    }
  }

  function clearBugError() {
    if (bugErrorBox) {
      bugErrorBox.textContent = '';
      bugErrorBox.style.display = 'none';
    }
    if (bugFallbackCopyWrap) {
      bugFallbackCopyWrap.style.display = 'none';
    }
  }

  if (copyBugReportBtn) {
    copyBugReportBtn.addEventListener('click', () => {
      if (!lastPayloadText) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastPayloadText).then(() => {
          copyBugReportBtn.innerHTML = '<i class="fas fa-check"></i> Copied Report Details';
        }).catch(() => {
          window.prompt('Copy your bug report details:', lastPayloadText);
        });
      } else {
        window.prompt('Copy your bug report details:', lastPayloadText);
      }
    });
  }

  if (submitAnotherBugBtn) {
    submitAnotherBugBtn.addEventListener('click', () => {
      if (bugSuccessCard) bugSuccessCard.style.display = 'none';
      clearBugError();
      if (form) {
        form.reset();
        form.style.display = 'flex';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearBugError();

      const title = bugTitle ? bugTitle.value.trim() : '';
      const type = bugType ? bugType.value.trim() : '';
      const severity = bugSeverity ? bugSeverity.value.trim() : 'medium';
      const appRefVal = bugAppRef ? bugAppRef.value.trim() : '';
      const environment = bugEnvironment ? bugEnvironment.value.trim() : '';
      const description = bugDescription ? bugDescription.value.trim() : '';
      const reporter = bugReporter ? bugReporter.value.trim() : '';

      if (!title || !type || !description) {
        showBugError('Please fill Issue Summary, Issue Type, and Details.');
        return;
      }

      if (typeof db === 'undefined') {
        showBugError('Database connection is unavailable. Please reload the page and try again.');
        return;
      }

      const payload = {
        title,
        type,
        severity: severity || 'medium',
        appRef: appRefVal,
        environment,
        description,
        reporter,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent || '',
        status: 'open',
        createdAt: Date.now()
      };

      lastPayloadText = [
        `Title: ${payload.title}`,
        `Type: ${payload.type}`,
        `Severity: ${payload.severity}`,
        payload.appRef ? `Related App: ${payload.appRef}` : null,
        payload.environment ? `Device/Browser: ${payload.environment}` : null,
        `Details: ${payload.description}`,
        payload.reporter ? `Reporter: ${payload.reporter}` : null
      ].filter(Boolean).join('\n');

      if (bugSubmitBtn) {
        bugSubmitBtn.disabled = true;
        bugSubmitBtn.dataset.originalHtml = bugSubmitBtn.innerHTML;
        bugSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      }

      const reportRef = db.ref('bugReports').push();
      reportRef.set(payload)
        .then(() => {
          if (submittedBugTitle) submittedBugTitle.textContent = title;
          if (bugReportIdEl) bugReportIdEl.textContent = reportRef.key || '-';
          form.reset();
          form.style.display = 'none';
          if (bugSuccessCard) bugSuccessCard.style.display = 'block';
        })
        .catch((err) => {
          showBugError(`Could not submit bug report (${err.message}). You can copy your report details below.`);
        })
        .finally(() => {
          if (bugSubmitBtn) {
            bugSubmitBtn.disabled = false;
            if (bugSubmitBtn.dataset.originalHtml) {
              bugSubmitBtn.innerHTML = bugSubmitBtn.dataset.originalHtml;
            }
          }
        });
    });
  }
});
