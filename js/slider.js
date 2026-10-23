// ===== js/slider.js =====
// Hero Slider

let sliderInterval = null;

function setupSliderAutoScroll(slider) {
  if (!slider) return;

  function stopAuto() {
    if (sliderInterval) {
      clearInterval(sliderInterval);
      sliderInterval = null;
    }
  }

  function startAuto() {
    stopAuto();
    sliderInterval = setInterval(() => {
      if (slider.matches(':hover')) return;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (maxScroll <= 10) return;

      const slide = slider.querySelector('.hero-slide');
      const step = slide ? (slide.offsetWidth + 14) : 320;

      if (slider.scrollLeft >= maxScroll - 15) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 4500);
  }

  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('touchstart', stopAuto, { passive: true });
  slider.addEventListener('touchend', () => {
    stopAuto();
    setTimeout(startAuto, 2500);
  }, { passive: true });

  startAuto();
}

function loadHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  slider.innerHTML = `
    <div class="hero-slide">
      <div class="skeleton skeleton-icon" style="width:64px;height:64px;border-radius:16px;flex-shrink:0;"></div>
      <div class="slide-info" style="flex:1;min-width:0;padding-right:70px;">
        <div class="skeleton skeleton-text" style="height:18px;width:70%;"></div>
        <div class="skeleton skeleton-text small" style="width:50%;"></div>
      </div>
    </div>
    <div class="hero-slide">
      <div class="skeleton skeleton-icon" style="width:64px;height:64px;border-radius:16px;flex-shrink:0;"></div>
      <div class="slide-info" style="flex:1;min-width:0;padding-right:70px;">
        <div class="skeleton skeleton-text" style="height:18px;width:70%;"></div>
        <div class="skeleton skeleton-text small" style="width:50%;"></div>
      </div>
    </div>
    <div class="hero-slide">
      <div class="skeleton skeleton-icon" style="width:64px;height:64px;border-radius:16px;flex-shrink:0;"></div>
      <div class="slide-info" style="flex:1;min-width:0;padding-right:70px;">
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
      <div class="hero-slide">
        <div style="font-size:42px;">📱</div>
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
    
    const fallbackIcon = 'assets/no_icon.gif';
    return `
      <div class="hero-slide" onclick="openAppDetail('${app.id}')">
        <img src="${app.iconUrl || fallbackIcon}" alt="${app.name || 'App'}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackIcon}'" />
        <div class="slide-info">
          <h3>${app.name || 'Untitled'}</h3>
          <p>${app.category || 'General'} • 👁 ${views} views</p>
        </div>
        <div class="slide-badge">${badge}</div>
      </div>
    `;
  }).join('');

  setupSliderAutoScroll(slider);
}

document.addEventListener('DOMContentLoaded', loadHeroSlider);
