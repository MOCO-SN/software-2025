document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navList = document.querySelector('.nav-list');

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      navList.classList.toggle('open');
      const icon = menuBtn.querySelector('i');
      if(icon) {
        if(navList.classList.contains('open')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navList?.classList.remove('open');
      const icon = document.querySelector('#mobileMenuBtn i');
      if(icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    uploadApp();
  });
});

