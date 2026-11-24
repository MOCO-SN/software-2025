// ===== js/uploads.js =====

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('navCloseBtn');
  const navList = document.getElementById('navList') || document.querySelector('.nav-list');
  const backdrop = document.getElementById('navBackdrop');

  function openMenu() {
    if (!navList) return;
    navList.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('nav-open');
    const icon = menuBtn?.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    }
  }

  function closeMenu() {
    if (!navList) return;
    navList.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('nav-open');
    const icon = menuBtn?.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  }

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navList.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Fixed top nav scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 15) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Search input handler (redirects to index with query)
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function handleSearch() {
    const q = searchInput?.value.trim();
    if (q) {
      window.location.href = `index.html?search=${encodeURIComponent(q)}`;
    }
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof uploadApp === 'function') {
        uploadApp();
      }
    });
  }

  // ===== Upload Access Code & Edit App Access Panel =====
  const tabUploadBtn = document.getElementById('tabUploadBtn');
  const tabEditBtn = document.getElementById('tabEditBtn');
  const uploadPanel = document.getElementById('uploadPanel');
  const editPanel = document.getElementById('editPanel');

  const appAccessCodeInput = document.getElementById('appAccessCode');
  const toggleUploadCodeBtn = document.getElementById('toggleUploadCodeBtn');
  const generateAccessCodeBtn = document.getElementById('generateAccessCodeBtn');

  const uploadSuccessCard = document.getElementById('uploadSuccessCard');
  const uploadedAppNameEl = document.getElementById('uploadedAppName');
  const uploadedAppIdEl = document.getElementById('uploadedAppId');
  const uploadedAccessCodeEl = document.getElementById('uploadedAccessCode');
  const copyAccessCodeBtn = document.getElementById('copyAccessCodeBtn');
  const viewUploadedAppLink = document.getElementById('viewUploadedAppLink');
  const openEditFromSuccessBtn = document.getElementById('openEditFromSuccessBtn');
  const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');

  const accessUnlockSection = document.getElementById('accessUnlockSection');
  const accessUnlockForm = document.getElementById('accessUnlockForm');
  const accessAppFilterInput = document.getElementById('accessAppFilter');
  const accessCodeInput = document.getElementById('accessCodeInput');
  const toggleAccessCodeBtn = document.getElementById('toggleAccessCodeBtn');
  const accessErrorBox = document.getElementById('accessErrorBox');
  const unlockPanelBtn = document.getElementById('unlockPanelBtn');

  const matchedAppsSection = document.getElementById('matchedAppsSection');
  const matchedAppsSummary = document.getElementById('matchedAppsSummary');
  const matchedAppsList = document.getElementById('matchedAppsList');
  const lockPanelFromListBtn = document.getElementById('lockPanelFromListBtn');

  const editAppSection = document.getElementById('editAppSection');
  const editBannerIcon = document.getElementById('editBannerIcon');
  const editBannerName = document.getElementById('editBannerName');
  const editBannerId = document.getElementById('editBannerId');
  const editViewLiveLink = document.getElementById('editViewLiveLink');
  const switchMatchedAppBtn = document.getElementById('switchMatchedAppBtn');
  const lockPanelBtn = document.getElementById('lockPanelBtn');
  const editSuccessBanner = document.getElementById('editSuccessBanner');
  const editUpdatedLiveLink = document.getElementById('editUpdatedLiveLink');

  const editAppForm = document.getElementById('editAppForm');
  const editAppName = document.getElementById('editAppName');
  const editAppDesc = document.getElementById('editAppDesc');
  const editAppIcon = document.getElementById('editAppIcon');
  const editAppApk = document.getElementById('editAppApk');
  const editAppCategory = document.getElementById('editAppCategory');
  const editAppDeveloper = document.getElementById('editAppDeveloper');
  const editAppVersion = document.getElementById('editAppVersion');
  const editAppSize = document.getElementById('editAppSize');
  const editAppNewCode = document.getElementById('editAppNewCode');
  const toggleEditNewCodeBtn = document.getElementById('toggleEditNewCodeBtn');
  const generateEditCodeBtn = document.getElementById('generateEditCodeBtn');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  let lastUploadedInfo = null;
  let unlockedApps = [];
  let activeAccessCodeHash = '';
  let editingAppId = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateAccessCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = (len) => {
      let out = '';
      if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        const buf = new Uint32Array(len);
        window.crypto.getRandomValues(buf);
        for (let i = 0; i < len; i++) {
          out += alphabet[buf[i] % alphabet.length];
        }
      } else {
        for (let i = 0; i < len; i++) {
          out += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
      return out;
    };
    return `${part(4)}-${part(4)}`;
  }

  function stripSnPrefixOnInput(inputEl) {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      if (/^sn-/i.test(inputEl.value)) {
        inputEl.value = inputEl.value.replace(/^sn-/i, '');
      }
    });
  }

  stripSnPrefixOnInput(appAccessCodeInput);
  stripSnPrefixOnInput(accessCodeInput);
  stripSnPrefixOnInput(editAppNewCode);

  function toggleVisibility(inputEl, btnEl) {
    if (!inputEl || !btnEl) return;
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';
    const icon = btnEl.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-eye', !isPassword);
      icon.classList.toggle('fa-eye-slash', isPassword);
    }
  }

  function switchMode(mode) {
    const isEdit = mode === 'edit';
    if (tabUploadBtn) {
      tabUploadBtn.classList.toggle('active', !isEdit);
      tabUploadBtn.setAttribute('aria-selected', String(!isEdit));
    }
    if (tabEditBtn) {
      tabEditBtn.classList.toggle('active', isEdit);
      tabEditBtn.setAttribute('aria-selected', String(isEdit));
    }
    if (uploadPanel) uploadPanel.style.display = isEdit ? 'none' : 'block';
    if (editPanel) editPanel.style.display = isEdit ? 'block' : 'none';
  }

  if (tabUploadBtn) {
    tabUploadBtn.addEventListener('click', () => switchMode('upload'));
  }
  if (tabEditBtn) {
    tabEditBtn.addEventListener('click', () => switchMode('edit'));
  }

  if (toggleUploadCodeBtn && appAccessCodeInput) {
    toggleUploadCodeBtn.addEventListener('click', () => toggleVisibility(appAccessCodeInput, toggleUploadCodeBtn));
  }

  if (generateAccessCodeBtn && appAccessCodeInput) {
    generateAccessCodeBtn.addEventListener('click', () => {
      appAccessCodeInput.type = 'text';
      appAccessCodeInput.value = generateAccessCode();
      const icon = toggleUploadCodeBtn?.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
      appAccessCodeInput.focus();
    });
  }

  if (toggleAccessCodeBtn && accessCodeInput) {
    toggleAccessCodeBtn.addEventListener('click', () => toggleVisibility(accessCodeInput, toggleAccessCodeBtn));
  }

  if (toggleEditNewCodeBtn && editAppNewCode) {
    toggleEditNewCodeBtn.addEventListener('click', () => toggleVisibility(editAppNewCode, toggleEditNewCodeBtn));
  }

  if (generateEditCodeBtn && editAppNewCode) {
    generateEditCodeBtn.addEventListener('click', () => {
      editAppNewCode.type = 'text';
      editAppNewCode.value = generateAccessCode();
      const icon = toggleEditNewCodeBtn?.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
      editAppNewCode.focus();
    });
  }

  // Handle upload completion callback from index.js
  window.onAppUploaded = function(result) {
    if (!result || !uploadSuccessCard) return;
    lastUploadedInfo = result;

    if (uploadedAppNameEl) uploadedAppNameEl.textContent = result.name || 'Your App';
    if (uploadedAppIdEl) uploadedAppIdEl.textContent = result.id || '-';
    if (uploadedAccessCodeEl) uploadedAccessCodeEl.textContent = result.accessCode || '-';
    if (viewUploadedAppLink && result.id) {
      viewUploadedAppLink.href = `app.html?id=${encodeURIComponent(result.id)}`;
    }

    if (form) form.style.display = 'none';
    uploadSuccessCard.style.display = 'block';
  };

  if (copyAccessCodeBtn) {
    copyAccessCodeBtn.addEventListener('click', () => {
      const code = uploadedAccessCodeEl?.textContent?.trim();
      if (!code || code === '-') return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          if (typeof showToast === 'function') showToast('Access Panel Code copied!');
        }).catch(() => {
          window.prompt('Copy your Access Panel Code:', code);
        });
      } else {
        window.prompt('Copy your Access Panel Code:', code);
      }
    });
  }

  if (uploadAnotherBtn) {
    uploadAnotherBtn.addEventListener('click', () => {
      if (uploadSuccessCard) uploadSuccessCard.style.display = 'none';
      if (form) {
        form.reset();
        form.style.display = 'flex';
      }
    });
  }

  if (openEditFromSuccessBtn) {
    openEditFromSuccessBtn.addEventListener('click', () => {
      switchMode('edit');
      if (lastUploadedInfo) {
        if (accessAppFilterInput && lastUploadedInfo.id) {
          accessAppFilterInput.value = lastUploadedInfo.id;
        }
        if (accessCodeInput && lastUploadedInfo.accessCode) {
          accessCodeInput.value = lastUploadedInfo.accessCode;
        }
        unlockAccessPanel();
      }
    });
  }

  function showAccessError(msg) {
    if (!accessErrorBox) return;
    accessErrorBox.textContent = msg;
    accessErrorBox.style.display = 'block';
  }

  function clearAccessError() {
    if (!accessErrorBox) return;
    accessErrorBox.textContent = '';
    accessErrorBox.style.display = 'none';
  }

  function lockAccessPanel() {
    unlockedApps = [];
    activeAccessCodeHash = '';
    editingAppId = null;
    clearAccessError();
    if (accessCodeInput) accessCodeInput.value = '';
    if (editAppNewCode) editAppNewCode.value = '';
    if (editSuccessBanner) editSuccessBanner.style.display = 'none';
    if (matchedAppsSection) matchedAppsSection.style.display = 'none';
    if (editAppSection) editAppSection.style.display = 'none';
    if (accessUnlockSection) accessUnlockSection.style.display = 'block';
  }

  function renderMatchedAppsList() {
    if (!matchedAppsList || !matchedAppsSection) return;
    const defaultIcon = 'assets/no_icon.gif';

    if (matchedAppsSummary) {
      matchedAppsSummary.textContent = `${unlockedApps.length} app${unlockedApps.length === 1 ? '' : 's'} unlocked with this Access Panel Code`;
    }

    matchedAppsList.innerHTML = unlockedApps.map(app => `
      <div class="matched-app-item">
        <div class="matched-app-left">
          <img src="${escapeHtml(app.iconUrl || defaultIcon)}" alt="${escapeHtml(app.name || 'App')}" onerror="this.onerror=null;this.src='${defaultIcon}'" />
          <div class="matched-app-info">
            <strong>${escapeHtml(app.name || 'Untitled App')}</strong>
            <span>${escapeHtml(app.category || 'General')} • v${escapeHtml(app.version || '1.0.0')} • ID: <code>${escapeHtml(app.id)}</code></span>
          </div>
        </div>
        <div class="matched-app-actions">
          <a href="app.html?id=${encodeURIComponent(app.id)}" target="_blank" class="btn-pill-sm">
            <i class="fas fa-external-link-alt"></i> View
          </a>
          <button type="button" class="btn-pill-sm primary select-edit-app-btn" data-app-id="${escapeHtml(app.id)}">
            <i class="fas fa-edit"></i> Edit Info
          </button>
        </div>
      </div>
    `).join('');

    matchedAppsList.querySelectorAll('.select-edit-app-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-app-id');
        const found = unlockedApps.find(a => a.id === targetId);
        if (found) openAppEditor(found);
      });
    });

    if (accessUnlockSection) accessUnlockSection.style.display = 'none';
    if (editAppSection) editAppSection.style.display = 'none';
    matchedAppsSection.style.display = 'block';
  }

  function setSelectValueCaseInsensitive(selectEl, value) {
    if (!selectEl) return;
    const normalized = (value || '').trim().toLowerCase();
    const matchedOption = Array.from(selectEl.options).find(opt => opt.value.toLowerCase() === normalized);
    selectEl.value = matchedOption ? matchedOption.value : '';
  }

  function openAppEditor(app) {
    if (!app || !editAppSection) return;
    editingAppId = app.id;
    const defaultIcon = 'assets/no_icon.gif';

    if (editBannerIcon) editBannerIcon.src = app.iconUrl || defaultIcon;
    if (editBannerName) editBannerName.textContent = app.name || 'Untitled App';
    if (editBannerId) editBannerId.textContent = `App ID: ${app.id}`;
    if (editViewLiveLink) editViewLiveLink.href = `app.html?id=${encodeURIComponent(app.id)}`;
    if (editUpdatedLiveLink) editUpdatedLiveLink.href = `app.html?id=${encodeURIComponent(app.id)}`;
    if (switchMatchedAppBtn) {
      switchMatchedAppBtn.style.display = unlockedApps.length > 1 ? 'inline-flex' : 'none';
    }
    if (editSuccessBanner) editSuccessBanner.style.display = 'none';

    if (editAppName) editAppName.value = app.name || '';
    if (editAppDesc) editAppDesc.value = app.description || '';
    if (editAppIcon) editAppIcon.value = app.iconUrl || '';
    if (editAppApk) editAppApk.value = app.apkUrl || '';
    setSelectValueCaseInsensitive(editAppCategory, app.category || '');
    if (editAppDeveloper) editAppDeveloper.value = app.developer || '';
    if (editAppVersion) editAppVersion.value = app.version || '';
    if (editAppSize) editAppSize.value = app.size || '';
    if (editAppNewCode) editAppNewCode.value = '';

    if (accessUnlockSection) accessUnlockSection.style.display = 'none';
    if (matchedAppsSection) matchedAppsSection.style.display = 'none';
    editAppSection.style.display = 'block';
  }

  function unlockAccessPanel() {
    clearAccessError();
    const rawCode = accessCodeInput ? accessCodeInput.value.trim() : '';
    const suffix = rawCode.replace(/^sn-/i, '');
    const filter = accessAppFilterInput ? accessAppFilterInput.value.trim() : '';

    if (suffix.length < 4) {
      showAccessError('Please enter your custom key after SN- (at least 4 characters).');
      return;
    }

    if (typeof window.hashAccessCode !== 'function' || typeof appsRef === 'undefined') {
      showAccessError('Database connection is not ready. Please reload and try again.');
      return;
    }

    const snKey = `SN-${suffix}`;
    const candidateHashes = [window.hashAccessCode(snKey)];
    if (rawCode !== snKey) {
      candidateHashes.push(window.hashAccessCode(rawCode));
    }

    if (unlockPanelBtn) {
      unlockPanelBtn.disabled = true;
      unlockPanelBtn.dataset.originalHtml = unlockPanelBtn.innerHTML;
      unlockPanelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    }

    appsRef.once('value')
      .then((snapshot) => {
        const matches = [];
        const filterLower = filter.toLowerCase();

        snapshot.forEach((child) => {
          const val = child.val();
          if (!val || !val.accessCodeHash) return;
          if (!candidateHashes.includes(val.accessCodeHash)) return;

          if (filter) {
            const idMatches = child.key === filter;
            const nameMatches = (val.name || '').toLowerCase().includes(filterLower);
            if (!idMatches && !nameMatches) return;
          }

          matches.push({ id: child.key, ...val });
        });

        if (matches.length === 0) {
          showAccessError(
            filter
              ? 'No matching app found for that App Name/ID and SN- key.'
              : 'Invalid Access Panel Key, or no listed apps match this SN- key.'
          );
          return;
        }

        unlockedApps = matches;
        activeAccessCodeHash = matches[0].accessCodeHash;

        if (matches.length === 1) {
          openAppEditor(matches[0]);
        } else {
          renderMatchedAppsList();
        }
      })
      .catch((err) => {
        showAccessError('Error verifying Access Panel Code: ' + err.message);
      })
      .finally(() => {
        if (unlockPanelBtn) {
          unlockPanelBtn.disabled = false;
          if (unlockPanelBtn.dataset.originalHtml) {
            unlockPanelBtn.innerHTML = unlockPanelBtn.dataset.originalHtml;
          }
        }
      });
  }

  if (accessUnlockForm) {
    accessUnlockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      unlockAccessPanel();
    });
  }

  if (lockPanelBtn) {
    lockPanelBtn.addEventListener('click', lockAccessPanel);
  }
  if (lockPanelFromListBtn) {
    lockPanelFromListBtn.addEventListener('click', lockAccessPanel);
  }
  if (switchMatchedAppBtn) {
    switchMatchedAppBtn.addEventListener('click', renderMatchedAppsList);
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      if (unlockedApps.length > 1) {
        renderMatchedAppsList();
      } else {
        lockAccessPanel();
      }
    });
  }

  if (editAppIcon && editBannerIcon) {
    editAppIcon.addEventListener('input', () => {
      const url = editAppIcon.value.trim();
      editBannerIcon.src = url || 'assets/no_icon.gif';
    });
  }

  if (editAppForm) {
    editAppForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!editingAppId || !activeAccessCodeHash) {
        lockAccessPanel();
        return;
      }

      const name = editAppName ? editAppName.value.trim() : '';
      const description = editAppDesc ? editAppDesc.value.trim() : '';
      const iconUrl = editAppIcon ? editAppIcon.value.trim() : '';
      const apkUrl = editAppApk ? editAppApk.value.trim() : '';
      const category = editAppCategory ? editAppCategory.value.trim() : '';
      const developer = editAppDeveloper ? editAppDeveloper.value.trim() : '';
      const version = editAppVersion ? editAppVersion.value.trim() : '';
      const size = editAppSize ? editAppSize.value.trim() : '';
      const newCodeSuffix = editAppNewCode ? editAppNewCode.value.trim().replace(/^sn-/i, '') : '';

      if (!name || !description || !iconUrl || !apkUrl) {
        if (typeof showToast === 'function') {
          showToast('Please fill Name, Description, Icon URL, and APK URL.');
        }
        return;
      }

      if (newCodeSuffix && newCodeSuffix.length < 4) {
        if (typeof showToast === 'function') {
          showToast('New custom key after SN- must be at least 4 characters.');
        }
        editAppNewCode.focus();
        return;
      }

      if (saveEditBtn) {
        saveEditBtn.disabled = true;
        saveEditBtn.dataset.originalHtml = saveEditBtn.innerHTML;
        saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      }

      const targetRef = appsRef.child(editingAppId);
      targetRef.once('value')
        .then((snapshot) => {
          const current = snapshot.val();
          if (!current || current.accessCodeHash !== activeAccessCodeHash) {
            throw new Error('Access Panel session is no longer valid for this app.');
          }

          const updates = {
            name,
            description,
            iconUrl,
            apkUrl,
            category,
            developer,
            version,
            size,
            updatedAt: Date.now()
          };

          let nextHash = activeAccessCodeHash;
          if (newCodeSuffix) {
            nextHash = window.hashAccessCode(`SN-${newCodeSuffix}`);
            updates.accessCodeHash = nextHash;
          }

          return targetRef.update(updates).then(() => ({ updates, nextHash }));
        })
        .then(({ updates, nextHash }) => {
          activeAccessCodeHash = nextHash;
          unlockedApps = unlockedApps.map(item => {
            if (item.id !== editingAppId) return item;
            return { ...item, ...updates };
          });

          if (editBannerName) editBannerName.textContent = updates.name;
          if (editBannerIcon) editBannerIcon.src = updates.iconUrl || 'assets/no_icon.gif';
          if (editAppNewCode) editAppNewCode.value = '';
          if (editSuccessBanner) editSuccessBanner.style.display = 'flex';
          if (typeof showToast === 'function') {
            showToast('App details updated successfully!');
          }
        })
        .catch((err) => {
          if (typeof showToast === 'function') {
            showToast('Error updating app: ' + err.message);
          }
        })
        .finally(() => {
          if (saveEditBtn) {
            saveEditBtn.disabled = false;
            if (saveEditBtn.dataset.originalHtml) {
              saveEditBtn.innerHTML = saveEditBtn.dataset.originalHtml;
            }
          }
        });
    });
  }

  // Support deep linking: upload.html?mode=edit or upload.html?edit=<appId>
  const params = new URLSearchParams(window.location.search);
  const editParam = params.get('edit') || params.get('id');
  const modeParam = params.get('mode');
  if (modeParam === 'edit' || editParam) {
    switchMode('edit');
    if (editParam && accessAppFilterInput) {
      accessAppFilterInput.value = editParam;
    }
  }
});
