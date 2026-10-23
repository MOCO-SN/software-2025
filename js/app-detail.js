// ===== js/app-detail.js =====
// App Detail Page Controller

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('id');

  const loadingEl = document.getElementById('appDetailLoading');
  const contentEl = document.getElementById('appDetailContent');
  const errorEl = document.getElementById('appDetailError');

  // Wire search input in header to redirect to home page with query
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

  if (!appId) {
    showError("No app ID provided in the URL.");
    return;
  }

  loadAppDetails(appId);

  function showError(message) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      const msgEl = document.getElementById('errorMessage');
      if (msgEl) msgEl.textContent = message;
    }
  }

  function loadAppDetails(id) {
    appsRef.child(id).once('value', (snapshot) => {
      const app = snapshot.val();
      if (!app) {
        showError("The requested app could not be found. It may have been removed.");
        return;
      }

      app.id = id;
      renderApp(app);
      loadRelatedApps(app);
    }).catch((err) => {
      showError("Error connecting to database: " + err.message);
    });
  }

  function renderApp(app) {
    // Dynamic SEO Metadata for Search Engine Ranking
    const pageTitle = `${app.name || 'App'} APK Download (v${app.version || '1.0'}) for Android – MocoStore`;
    document.title = pageTitle;

    const appSummary = app.description 
      ? (app.description.length > 155 ? app.description.slice(0, 152) + '...' : app.description)
      : `Download ${app.name || 'this app'} APK safely and fast on MocoStore. Free, verified Android package.`;

    const metaDesc = document.getElementById('metaDescription');
    if (metaDesc) metaDesc.setAttribute('content', appSummary);

    const canonicalEl = document.getElementById('metaCanonical');
    if (canonicalEl) canonicalEl.setAttribute('href', `https://software.mocosn.in/app.html?id=${encodeURIComponent(app.id)}`);

    const ogTitle = document.getElementById('ogTitle');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.getElementById('ogDescription');
    if (ogDesc) ogDesc.setAttribute('content', appSummary);

    const ogImage = document.getElementById('ogImage');
    if (ogImage) ogImage.setAttribute('content', app.iconUrl || 'https://software.mocosn.in/icon.gif');

    const twTitle = document.getElementById('twitterTitle');
    if (twTitle) twTitle.setAttribute('content', pageTitle);

    const twDesc = document.getElementById('twitterDescription');
    if (twDesc) twDesc.setAttribute('content', appSummary);

    const twImage = document.getElementById('twitterImage');
    if (twImage) twImage.setAttribute('content', app.iconUrl || 'https://software.mocosn.in/icon.gif');

    // Inject Google SoftwareApplication Rich Snippet Schema
    injectAppSchema(app);

    // Breadcrumb
    const bcCategory = document.getElementById('bcCategory');
    const bcAppName = document.getElementById('bcAppName');
    if (bcCategory) {
      bcCategory.textContent = app.category || 'Apps';
      bcCategory.href = `index.html?category=${encodeURIComponent((app.category || 'all').toLowerCase())}`;
    }
    if (bcAppName) bcAppName.textContent = app.name || 'App Details';

    // App Info
    const defaultIcon = 'assets/no_icon.gif';
    const iconEl = document.getElementById('appIcon');
    if (iconEl) {
      iconEl.src = app.iconUrl || defaultIcon;
      iconEl.onerror = () => { iconEl.src = defaultIcon; };
      iconEl.alt = app.name || 'App Icon';
    }

    const titleEl = document.getElementById('appName');
    if (titleEl) titleEl.textContent = app.name || 'Untitled App';

    const catBadge = document.getElementById('appCategoryBadge');
    if (catBadge) {
      catBadge.textContent = app.category || 'General';
      catBadge.href = `index.html?category=${encodeURIComponent((app.category || 'all').toLowerCase())}`;
    }

    const devEl = document.getElementById('appDeveloper');
    if (devEl) devEl.textContent = app.developer || 'Verified Developer';

    // Stats
    const versionEl = document.getElementById('appVersion');
    if (versionEl) versionEl.textContent = app.version || '1.0.0';

    const sizeEl = document.getElementById('appSize');
    if (sizeEl) sizeEl.textContent = app.size || 'N/A';

    const viewsEl = document.getElementById('appViews');
    if (viewsEl) viewsEl.textContent = Number(app.views || 0).toLocaleString();

    const likesEl = document.getElementById('appLikes');
    if (likesEl) likesEl.textContent = Number(app.likes || 0).toLocaleString();

    // Description
    const descEl = document.getElementById('appDescription');
    if (descEl) descEl.textContent = app.description || 'No detailed description provided.';

    // Tech Specs
    const specName = document.getElementById('specName');
    if (specName) specName.textContent = app.name || '-';

    const specDev = document.getElementById('specDeveloper');
    if (specDev) specDev.textContent = app.developer || 'Unknown';

    const specCat = document.getElementById('specCategory');
    if (specCat) specCat.textContent = app.category || 'General';

    const specVer = document.getElementById('specVersion');
    if (specVer) specVer.textContent = app.version || '1.0';

    const specSize = document.getElementById('specSize');
    if (specSize) specSize.textContent = app.size || 'N/A';

    const specViews = document.getElementById('specViews');
    if (specViews) specViews.textContent = Number(app.views || 0).toLocaleString();

    // Download Flow with 10-Second Countdown
    const downloadBtn = document.getElementById('downloadApkBtn');
    const timerBox = document.getElementById('downloadTimerBox');
    const readyBox = document.getElementById('downloadReadyBox');
    const countdownNumber = document.getElementById('countdownNumber');
    const progressFill = document.getElementById('timerProgressFill');
    const finalDownloadBtn = document.getElementById('finalDownloadBtn');
    const directDownloadLink = document.getElementById('directDownloadLink');
    const downloadAgainBtn = document.getElementById('downloadAgainBtn');

    let countdownTimer = null;
    let viewRecorded = false;

    function recordDownloadView() {
      if (!viewRecorded) {
        viewRecorded = true;
        appsRef.child(app.id).child('views').transaction((curr) => (curr || 0) + 1);
        const currentCount = parseInt((viewsEl?.textContent || '0').replace(/,/g, ''));
        if (viewsEl) viewsEl.textContent = (currentCount + 1).toLocaleString();
        if (specViews) specViews.textContent = (currentCount + 1).toLocaleString();
      }
    }

    function startDownloadCountdown() {
      if (!app.apkUrl) {
        alert("Download link is currently unavailable for this app.");
        return;
      }

      // Hide ready box, show timer box
      if (readyBox) readyBox.style.display = 'none';
      if (timerBox) timerBox.style.display = 'block';
      if (downloadBtn) {
        downloadBtn.style.display = 'none';
      }

      let timeLeft = 10;
      if (countdownNumber) countdownNumber.textContent = timeLeft;
      if (progressFill) progressFill.style.width = '0%';

      if (countdownTimer) clearInterval(countdownTimer);

      countdownTimer = setInterval(() => {
        timeLeft--;
        if (countdownNumber) countdownNumber.textContent = timeLeft;
        if (progressFill) {
          const progressPercent = ((10 - timeLeft) / 10) * 100;
          progressFill.style.width = `${progressPercent}%`;
        }

        if (timeLeft <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;

          // Transition to Ready Box
          if (timerBox) timerBox.style.display = 'none';
          if (readyBox) readyBox.style.display = 'block';

          // Set download links
          if (finalDownloadBtn) {
            finalDownloadBtn.href = app.apkUrl;
          }
          if (directDownloadLink) {
            directDownloadLink.href = app.apkUrl;
          }

          // Record view & trigger automatic download
          recordDownloadView();
          showToast("Your download link is ready! Starting download...");

          try {
            window.open(app.apkUrl, '_blank');
          } catch (e) {
            console.log("Auto-popup blocked, click button below to download.");
          }
        }
      }, 1000);
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startDownloadCountdown();
      });
    }

    if (downloadAgainBtn) {
      downloadAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startDownloadCountdown();
      });
    }

    if (finalDownloadBtn) {
      finalDownloadBtn.addEventListener('click', () => {
        recordDownloadView();
        showToast("Starting download...");
      });
    }

    if (directDownloadLink) {
      directDownloadLink.addEventListener('click', () => {
        recordDownloadView();
        showToast("Starting download...");
      });
    }

    // Like Button
    const likeBtn = document.getElementById('likeBtn');
    const likedKey = `liked_${app.id}`;
    let isLiked = localStorage.getItem(likedKey) === 'true';

    if (isLiked && likeBtn) {
      likeBtn.classList.add('liked');
    }

    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        if (isLiked) {
          // Unlike
          localStorage.removeItem(likedKey);
          isLiked = false;
          likeBtn.classList.remove('liked');
          appsRef.child(app.id).child('likes').transaction((curr) => Math.max((curr || 1) - 1, 0));
          const currentCount = Math.max(parseInt((likesEl?.textContent || '1').replace(/,/g, '')) - 1, 0);
          if (likesEl) likesEl.textContent = currentCount.toLocaleString();
          showToast("Removed from liked apps");
        } else {
          // Like
          localStorage.setItem(likedKey, 'true');
          isLiked = true;
          likeBtn.classList.add('liked');
          appsRef.child(app.id).child('likes').transaction((curr) => (curr || 0) + 1);
          const currentCount = parseInt((likesEl?.textContent || '0').replace(/,/g, '')) + 1;
          if (likesEl) likesEl.textContent = currentCount.toLocaleString();
          showToast("App liked! ❤️");
        }
      });
    }

    // Share Button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: `${app.name} on MocoStore`,
            text: `Download ${app.name} APK on MocoStore:`,
            url: window.location.href,
          }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            showToast("Link copied to clipboard! 📋");
          }).catch(() => {
            showToast("Failed to copy link");
          });
        } else {
          prompt("Copy this URL to share:", window.location.href);
        }
      });
    }

    // Show Content
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
  }

  function loadRelatedApps(currentApp) {
    const relatedContainer = document.getElementById('relatedAppsGrid');
    if (!relatedContainer) return;

    appsRef.limitToLast(12).once('value', (snapshot) => {
      const apps = [];
      snapshot.forEach((child) => {
        if (child.key !== currentApp.id) {
          apps.push({ id: child.key, ...child.val() });
        }
      });

      // Filter: prioritize same category
      let related = apps.filter(a => a.category?.toLowerCase() === currentApp.category?.toLowerCase());
      if (related.length < 4) {
        // Add others if not enough in same category
        const others = apps.filter(a => a.category?.toLowerCase() !== currentApp.category?.toLowerCase());
        related = [...related, ...others];
      }

      const finalApps = related.slice(0, 4);

      if (finalApps.length === 0) {
        relatedContainer.innerHTML = `<p style="grid-column:1/-1; color:var(--text-secondary); text-align:center;">No related apps found.</p>`;
        return;
      }

      const defaultFallbackIcon = 'assets/no_icon.gif';
      relatedContainer.innerHTML = finalApps.map(item => `
        <div class="app-card" onclick="window.location.href='app.html?id=${encodeURIComponent(item.id)}'">
          <img src="${item.iconUrl || defaultFallbackIcon}" alt="${item.name || 'App'}" class="card-icon" loading="lazy" onerror="this.onerror=null;this.src='${defaultFallbackIcon}'" />
          <div class="card-name">${item.name || 'Untitled'}</div>
          <div class="card-category"><i class="fas fa-tag"></i> ${item.category || 'General'}</div>
          <div class="card-footer">
            <div class="card-views"><i class="fas fa-eye"></i> ${item.views || 0}</div>
            <div class="card-likes"><i class="fas fa-heart"></i> ${item.likes || 0}</div>
          </div>
        </div>
      `).join('');
    }).catch(() => {
      relatedContainer.innerHTML = `<p style="grid-column:1/-1; color:var(--text-secondary); text-align:center;">Could not load recommendations.</p>`;
    });
  }
});

// Toast notification helper
function showToast(message) {
  const existing = document.getElementById('appToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'appToast';
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '28px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'rgba(18, 19, 36, 0.95)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 26px';
  toast.style.borderRadius = '30px';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.zIndex = '99999';
  toast.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 188, 212, 0.3)';
  toast.style.border = '1px solid rgba(0, 188, 212, 0.3)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(-6px)';
  }, 20);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.remove(); }, 350);
  }, 2800);
}

// Inject Google Rich Result (SoftwareApplication JSON-LD Schema)
function injectAppSchema(app) {
  let schemaScript = document.getElementById('appJsonLd');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'appJsonLd';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const categoryName = app.category ? (app.category.charAt(0).toUpperCase() + app.category.slice(1)) : 'Application';

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name || "Android App",
    "operatingSystem": "Android 5.0 and up",
    "applicationCategory": categoryName.endsWith("Application") ? categoryName : `${categoryName}Application`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": Math.max(Number(app.likes || 1), 1),
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": app.developer || "Verified Developer"
    },
    "description": app.description || `Download ${app.name || 'this app'} APK for Android safely on MocoStore.`,
    "image": app.iconUrl || "https://software.mocosn.in/icon.gif",
    "fileSize": app.size || "Varies with device",
    "softwareVersion": app.version || "1.0.0"
  };

  schemaScript.textContent = JSON.stringify(schema);
}
