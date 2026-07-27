document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navList = document.querySelector('.nav-list');

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navList?.classList.remove('open');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    uploadApp();
  });
});
