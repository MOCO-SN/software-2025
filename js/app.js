// ===== js/app.js =====
// Main App Initialization

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 MocoStore initialized');

  // Mobile menu controller
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

  // Close mobile menu on link click
  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Keyboard shortcut: ESC to close modal and mobile nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      document.getElementById('appModal')?.classList.remove('active');
    }
  });

  // Auto-refresh trending every 60 seconds (optional)
  if (typeof loadAllApps === 'function' && typeof updateAppGrids === 'function') {
    setInterval(() => { loadAllApps(updateAppGrids); }, 60000);
  }
});
