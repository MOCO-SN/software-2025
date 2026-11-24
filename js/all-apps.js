// ===== js/all-apps.js =====
// View All Apps Directory Controller

document.addEventListener('DOMContentLoaded', () => {
  const PAGE_SIZE = 24;

  let allApps = [];
  let currentCategory = 'all';
  let currentSort = 'latest';
  let searchQuery = '';
  let visibleLimit = PAGE_SIZE;

  const gridEl = document.getElementById('allAppsGrid');
  const titleEl = document.getElementById('allAppsTitle');
  const countBadgeEl = document.getElementById('appsCountBadge');
  const sortSelect = document.getElementById('sortSelect');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const categoryBtns = document.querySelectorAll('.cat-btn');

  // Read initial URL params (?category=, ?sort=, ?search=)
  const params = new URLSearchParams(window.location.search);
  const catParam = (params.get('category') || '').trim().toLowerCase();
  const sortParam = (params.get('sort') || '').trim().toLowerCase();
  const searchParam = (params.get('search') || '').trim();

  if (catParam) {
    currentCategory = catParam;
    categoryBtns.forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.category || '').toLowerCase() === currentCategory);
    });
  }

  if (sortParam && ['latest', 'trending', 'likes', 'az'].includes(sortParam)) {
    currentSort = sortParam;
    if (sortSelect) sortSelect.value = currentSort;
  }

  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    searchQuery = searchParam;
  }

  function updateHeadingAndClearBtn() {
    if (titleEl) {
      if (currentSort === 'trending') {
        titleEl.textContent = 'Trending Apps';
      } else if (currentSort === 'likes') {
        titleEl.textContent = 'Top Rated Apps';
      } else if (currentCategory !== 'all') {
        titleEl.textContent = `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Apps`;
      } else {
        titleEl.textContent = 'All Apps';
      }
    }

    if (clearFiltersBtn) {
      const hasActiveFilters = currentCategory !== 'all' || searchQuery.trim() !== '';
      clearFiltersBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }
  }

  function getFilteredAndSortedApps() {
    let list = allApps.slice();

    if (currentCategory !== 'all') {
      list = list.filter(app => (app.category || '').toLowerCase() === currentCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(app =>
        (app.name || '').toLowerCase().includes(q) ||
        (app.description || '').toLowerCase().includes(q) ||
        (app.category || '').toLowerCase().includes(q) ||
        (app.developer || '').toLowerCase().includes(q)
      );
    }

    if (currentSort === 'trending') {
      list.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
    } else if (currentSort === 'likes') {
      list.sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0));
    } else if (currentSort === 'az') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      // Latest first: sort by createdAt desc if present, otherwise reverse push key order
      list.sort((a, b) => {
        const timeA = Number(a.createdAt || 0);
        const timeB = Number(b.createdAt || 0);
        if (timeA !== timeB) return timeB - timeA;
        return b._order - a._order;
      });
    }

    return list;
  }

  function renderDirectory() {
    updateHeadingAndClearBtn();
    const filtered = getFilteredAndSortedApps();

    if (countBadgeEl) {
      countBadgeEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'App' : 'Apps'}`;
    }

    const slice = filtered.slice(0, visibleLimit);
    renderAppCards(slice, 'allAppsGrid');

    if (loadMoreWrap) {
      loadMoreWrap.style.display = filtered.length > visibleLimit ? 'flex' : 'none';
    }
  }

  function fetchAllApps() {
    if (typeof showSkeleton === 'function') {
      showSkeleton('allAppsGrid', 8);
    }

    appsRef.once('value')
      .then((snapshot) => {
        const loaded = [];
        let order = 0;
        snapshot.forEach((child) => {
          loaded.push({ id: child.key, _order: order++, ...child.val() });
        });
        allApps = loaded;
        renderDirectory();
      })
      .catch((err) => {
        if (countBadgeEl) countBadgeEl.textContent = '0 Apps';
        if (gridEl) {
          gridEl.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px 16px; color:var(--text-secondary);">
              <i class="fas fa-exclamation-circle" style="font-size:36px; color:#ff4757; margin-bottom:12px; display:block;"></i>
              Could not load apps (${err.message}).
            </div>
          `;
        }
      });
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = (btn.dataset.category || 'all').toLowerCase();
      visibleLimit = PAGE_SIZE;
      renderDirectory();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      visibleLimit = PAGE_SIZE;
      renderDirectory();
    });
  }

  function applySearch() {
    searchQuery = searchInput ? searchInput.value : '';
    visibleLimit = PAGE_SIZE;
    renderDirectory();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') applySearch();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', applySearch);
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      currentCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      categoryBtns.forEach(b => b.classList.toggle('active', (b.dataset.category || '').toLowerCase() === 'all'));
      visibleLimit = PAGE_SIZE;
      renderDirectory();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += PAGE_SIZE;
      renderDirectory();
    });
  }

  fetchAllApps();
});
