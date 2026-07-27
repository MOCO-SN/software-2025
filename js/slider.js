// ===== js/slider.js =====
// Hero Slider

function loadHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  slider.innerHTML = `
    <div class="hero-slide" style="min-width:420px; background:var(--bg-card);">
      <div class="skeleton skeleton-icon" style="width:72px;height:72px;border-radius:16px;"></div>
      <div style="flex:1;">
        <div class="skeleton skeleton-text" style="height:18px;width:70%;"></div>
        <div class="skeleton skeleton-text small" style="width:50%;"></div>
      </div>
    </div>
    <div class="hero-slide" style="min-width:420px; background:var(--bg-card);">
      <div class="skeleton skeleton-icon" style="width:72px;height:72px;border-radius:16px;"></div>
      <div style="flex:1;">
        <div class="skeleton skeleton-text" style="height:18px;width:70%;"></div>
        <div class="skeleton skeleton-text small" style="width:50%;"></div>
      </div>
    </div>
    <div class="hero-slide" style="min-width:420px; background:var(--bg-card);">
      <div class="skeleton skeleton-icon" style="width:72px;height:72px;border-radius:16px;"></div>
      <div style="flex:1;">
        <div class="skeleton skeleton-text" style="height:18px;width:70%;"></div>
        <div class="skeleton skeleton-text small" style="width:50%;"></div>
      </div>
    </div>
  `;

  appsRef.orderByChild('views').limitToLast(5).once('value', (snapshot) => {
    const apps = [];
    snapshot.forEach((child) => {
      apps.push({ id: child.key, ...child.val() });
    });
    apps.reverse();

    if (apps.length === 0) {
      appsRef.limitToFirst(5).once('value', (snap) => {
        const fallback = [];
        snap.forEach((child) => {
          fallback.push({ id: child.key, ...child.val() });
        });
        renderSlider(fallback, slider);
      });
      return;
    }
    renderSlider(apps, slider);
  }).catch(() => {
    slider.innerHTML = `
      <div class="hero-slide" style="min-width:420px; background:var(--bg-card);">
        <div style="font-size:48px;">📱</div>
        <div class="slide-info">
          <h3>Welcome to MocoStore</h3>
          <p>Discover amazing Android apps</p>
        </div>
      </div>
    `;
  });
}

function renderSlider(apps, slider) {
  if (!apps || apps.length === 0) {
    slider.innerHTML = `<div class="hero-slide">No apps yet</div>`;
    return;
  }

  slider.innerHTML = apps.map(app => {
    const views = app.views || 0;
    const badge = views > 0 ? '🔥 Popular' : 'New';
    
    return `
      <div class="hero-slide" onclick="openAppDetail('${app.id}')">
        <img src="${app.iconUrl || 'https://www.mocosn.in/favicon.png'}" alt="${app.name || 'App'}" loading="lazy" />
        <div class="slide-info">
          <h3>${app.name || 'Untitled'}</h3>
          <p>${app.category || 'General'} • 👁 ${views} views</p>
        </div>
        <div class="slide-badge">${badge}</div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadHeroSlider);
