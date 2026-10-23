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

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof uploadApp === 'function') {
        uploadApp();
      }
    });
  }
});
