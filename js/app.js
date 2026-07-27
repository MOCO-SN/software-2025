// ===== js/app.js =====
// Main App Initialization

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 MocoStore initialized');

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navList = document.querySelector('.nav-list');
  
  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navList?.classList.remove('open');
    });
  });

  // Keyboard shortcut: ESC to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('appModal')?.classList.remove('active');
    }
  });

  // Auto-refresh trending every 60 seconds (optional)
  setInterval(() => { loadAllApps(updateAppGrids); }, 60000);
});