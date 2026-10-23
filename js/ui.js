// ===== js/ui.js =====
// UI Helper Functions

// Render app cards
function renderAppCards(apps, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!apps || apps.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 0; color:var(--text-secondary);">
        <i class="fas fa-box-open" style="font-size:40px; margin-bottom:12px; display:block;"></i>
        No apps found
      </div>
    `;
    return;
  }

  const fallbackIcon = 'assets/no_icon.gif';

  container.innerHTML = apps.map(app => `
    <div class="app-card" data-id="${app.id}" onclick="openAppDetail('${app.id}')">
      ${app.featured ? '<div class="card-badge">Featured</div>' : ''}
      <img src="${app.iconUrl || fallbackIcon}" alt="${app.name || 'App'}" class="card-icon" loading="lazy" onerror="this.onerror=null;this.src='${fallbackIcon}'" />
      <div class="card-name">${app.name || 'Untitled'}</div>
      <div class="card-category"><i class="fas fa-tag"></i> ${app.category || 'General'}</div>
      <div class="card-footer">
        <div class="card-views">
          <i class="fas fa-eye"></i> ${app.views || 0}
        </div>
        <div class="card-likes">
          <i class="fas fa-heart"></i> ${app.likes || 0}
        </div>
      </div>
    </div>
  `).join('');
}

// Show skeleton loading
function showSkeleton(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-icon"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
      <div style="display:flex; justify-content:space-between; margin-top:10px;">
        <div class="skeleton skeleton-text small"></div>
        <div class="skeleton skeleton-text small" style="width:30%;"></div>
      </div>
    </div>
  `).join('');
}

// Redirect to new app detail page with ID in URL
function openAppDetail(appId) {
  if (!appId) return;
  window.location.href = `app.html?id=${encodeURIComponent(appId)}`;
}

// Download app directly
function downloadApp(appId) {
  appsRef.child(appId).once('value', (snapshot) => {
    const app = snapshot.val();
    if (app && app.apkUrl) {
      window.open(app.apkUrl, '_blank');
      appsRef.child(appId).child('views').transaction((current) => {
        return (current || 0) + 1;
      });
    } else {
      alert('APK link not available for this app.');
    }
  });
}
