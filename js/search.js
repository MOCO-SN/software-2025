// ===== js/search.js =====
// Search & Category Filter

let allApps = [];
let currentCategory = 'all';
let searchQuery = '';

// Fetch all apps once and cache
function loadAllApps(callback) {
  appsRef.once('value', (snapshot) => {
    const apps = [];
    snapshot.forEach((child) => {
      apps.push({ id: child.key, ...child.val() });
    });
    allApps = apps;
    if (callback) callback(apps);
  }).catch(err => console.error('Error loading apps:', err));
}

// Filter apps based on category and search
function filterApps() {
  let filtered = allApps;

  // Category filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(app => app.category?.toLowerCase() === currentCategory);
  }

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(app => 
      app.name?.toLowerCase().includes(query) || 
      app.description?.toLowerCase().includes(query) ||
      app.category?.toLowerCase().includes(query) ||
      app.developer?.toLowerCase().includes(query)
    );
  }

  return filtered;
}

// Update UI with filtered apps
function updateAppGrids() {
  const filtered = filterApps();
  
  // Split into trending (first 4) and latest (remaining)
  const trending = filtered.slice(0, 4);
  const latest = filtered.slice(4, 16);
  
  renderAppCards(trending, 'trendingGrid');
  renderAppCards(latest, 'appGallery');
}

// Search input handler
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function performSearch() {
    searchQuery = searchInput ? searchInput.value : '';
    updateAppGrids();
  }

  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Category filter buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category?.toLowerCase() || 'all';
      updateAppGrids();
    });
  });

  // Check URL parameters (e.g., ?search=xyz or ?category=games)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const catParam = urlParams.get('category');

  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    searchQuery = searchParam;
  }

  if (catParam) {
    currentCategory = catParam.toLowerCase();
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.category || '').toLowerCase() === currentCategory);
    });
  }

  // Load all apps and render
  showSkeleton('trendingGrid', 4);
  showSkeleton('appGallery', 8);
  
  loadAllApps(() => {
    updateAppGrids();
  });
});
