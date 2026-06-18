(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menuButton = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  let slideIndex = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === slideIndex));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === slideIndex));
  }

  function startHero() {
    if (heroTimer) window.clearInterval(heroTimer);
    if (slides.length > 1) {
      heroTimer = window.setInterval(() => showSlide(slideIndex + 1), 5200);
    }
  }

  $('.hero-prev')?.addEventListener('click', () => {
    showSlide(slideIndex - 1);
    startHero();
  });

  $('.hero-next')?.addEventListener('click', () => {
    showSlide(slideIndex + 1);
    startHero();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.slide || 0));
      startHero();
    });
  });

  startHero();

  const filterForm = $('.js-filter-form');
  if (filterForm) {
    const grid = document.getElementById(filterForm.dataset.target || 'movie-grid');
    const empty = $('.empty-state');
    const cards = grid ? $$('.movie-card', grid) : [];

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function sortCards(visible, sortBy) {
      const sorted = [...visible];
      sorted.sort((a, b) => {
        if (sortBy === 'score') return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        if (sortBy === 'title') return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
      sorted.forEach((card) => grid.appendChild(card));
    }

    function applyFilter() {
      const formData = new FormData(filterForm);
      const q = normalize(formData.get('q'));
      const type = normalize(formData.get('type'));
      const region = normalize(formData.get('region'));
      const year = normalize(formData.get('year'));
      const category = normalize(formData.get('category'));
      const sortBy = formData.get('sort') || 'latest';
      const visible = [];

      cards.forEach((card) => {
        const haystack = normalize(`${card.dataset.title} ${card.dataset.region} ${card.dataset.year} ${card.dataset.type} ${card.dataset.tags}`);
        const matched = (!q || haystack.includes(q)) &&
          (!type || normalize(card.dataset.type).includes(type)) &&
          (!region || normalize(card.dataset.region).includes(region)) &&
          (!year || normalize(card.dataset.year).includes(year)) &&
          (!category || haystack.includes(category));
        card.hidden = !matched;
        if (matched) visible.push(card);
      });

      if (grid) sortCards(visible, sortBy);
      if (empty) empty.hidden = visible.length !== 0;
    }

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    filterForm.addEventListener('reset', () => window.setTimeout(applyFilter, 0));
    applyFilter();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
  }

  function renderMovie(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<article class="movie-card" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-tags="${escapeHtml((movie.tags || []).join(' ') + ' ' + movie.genre)}" data-score="${movie.score}">
  <a class="poster-link" href="./${movie.file}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-play">播放</span>
  </a>
  <div class="card-body">
    <div class="card-meta">
      <a href="./category-${movie.categorySlug}.html">${escapeHtml(movie.categoryName)}</a>
      <span>${escapeHtml(movie.year)}</span>
    </div>
    <h3><a href="./${movie.file}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
  }

  const searchResults = $('#search-results');
  if (searchResults && Array.isArray(window.MOVIES)) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const input = $('#search-page-input');
    const sort = $('#search-sort');
    const empty = $('#search-empty');
    if (input) input.value = q;

    function renderSearch() {
      const keyword = (input?.value || q).trim().toLowerCase();
      const sortBy = sort?.value || 'score';
      let results = window.MOVIES.filter((movie) => {
        const haystack = `${movie.title} ${movie.region} ${movie.type} ${movie.year} ${movie.genre} ${(movie.tags || []).join(' ')} ${movie.oneLine}`.toLowerCase();
        return !keyword || haystack.includes(keyword);
      });
      results.sort((a, b) => {
        if (sortBy === 'latest') return Number(b.year || 0) - Number(a.year || 0);
        if (sortBy === 'title') return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN');
        return Number(b.score || 0) - Number(a.score || 0);
      });
      results = results.slice(0, 240);
      searchResults.innerHTML = results.map(renderMovie).join('');
      if (empty) empty.hidden = results.length !== 0;
    }

    input?.addEventListener('input', renderSearch);
    sort?.addEventListener('change', renderSearch);
    renderSearch();
  }
})();
