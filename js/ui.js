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

  container.innerHTML = apps.map(app => `
    <div class="app-card" data-id="${app.id}" onclick="openAppDetail('${app.id}')">
      ${app.featured ? '<div class="card-badge">Featured</div>' : ''}
      <img src="${app.iconUrl || 'https://via.placeholder.com/64/6c5ce7/ffffff?text=App'}" alt="${app.name}" class="card-icon" loading="lazy" />
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

// Open app detail modal
function openAppDetail(appId) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  
  content.innerHTML = `<div class="spinner"></div>`;
  modal.classList.add('active');
  
  appsRef.child(appId).once('value', (snapshot) => {
    const app = snapshot.val();
    if (!app) {
      content.innerHTML = `<p>App not found</p>`;
      return;
    }
    app.id = appId;
    
    content.innerHTML = `
      <img src="${app.iconUrl || 'https://www.mocosn.in/favicon.png'}" alt="${app.name}" class="modal-icon" />
      <h2 class="modal-name">${app.name || 'Untitled'}</h2>
      <div class="modal-developer"><i class="fas fa-user"></i> ${app.developer || 'Unknown'}</div>
      <p class="modal-description">${app.description || 'No description available.'}</p>
      <div class="modal-meta">
        <span><strong>Version</strong> ${app.version || '1.0'}</span>
        <span><strong>Size</strong> ${app.size || 'N/A'}</span>
        <span><strong>Views</strong> 👁 ${app.views || 0}</span>
        <span><strong>Likes</strong> ❤️ ${app.likes || 0}</span>
        <span><strong>Category</strong> ${app.category || 'General'}</span>
      </div>
      <button class="modal-download-btn" onclick="downloadApp('${appId}')">
        <i class="fas fa-download"></i> Download APK
      </button>
    `;
  }).catch(err => {
    content.innerHTML = `<p style="color: #ef4444;">Error loading app: ${err.message}</p>`;
  });
}

// Close modal
document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('appModal').classList.remove('active');
});

document.getElementById('appModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('appModal').classList.remove('active');
  }
});

// Download app
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
