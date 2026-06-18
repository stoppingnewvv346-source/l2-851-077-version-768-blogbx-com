(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindHeader() {
    qsa('.search-toggle').forEach(function(button) {
      button.addEventListener('click', function() {
        var panel = qs('.header-search');
        if (!panel) return;
        panel.hidden = !panel.hidden;
        if (!panel.hidden) {
          var input = qs('input[name="q"]', panel);
          if (input) input.focus();
        }
      });
    });

    qsa('.mobile-menu-toggle').forEach(function(button) {
      button.addEventListener('click', function() {
        var menu = qs('.mobile-menu');
        if (!menu) return;
        menu.hidden = !menu.hidden;
        button.textContent = menu.hidden ? '☰' : '×';
      });
    });
  }

  function bindHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) return;
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function movieCard(item) {
    var tags = item.tags.slice(0, 2).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card group">' +
      '<a href="' + item.url + '" title="' + escapeHtml(item.title) + '">' +
      '<div class="poster-shell aspect-[2/3]">' +
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.classList.add(\'is-hidden\')">' +
      '<span class="score-badge">' + item.score + '</span>' +
      '<span class="year-badge">' + escapeHtml(String(item.year || '')) + '</span>' +
      '<div class="poster-gradient"><div class="tag-row">' + tags + '</div></div>' +
      '</div>' +
      '<div class="pt-3">' +
      '<h3 class="text-stone-100 font-bold line-clamp-1 group-hover:text-amber-500 transition-colors">' + escapeHtml(item.title) + '</h3>' +
      '<p class="text-stone-400 text-sm line-clamp-2 mt-1">' + escapeHtml(item.oneLine) + '</p>' +
      '<p class="text-stone-500 text-xs mt-2">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
      '</div></a></article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  }

  function bindSearchPage() {
    var form = qs('#searchPageForm');
    var input = qs('#searchInput');
    var section = qs('#searchResultSection');
    var results = qs('#searchResults');
    var empty = qs('#noSearchResults');
    if (!form || !input || !section || !results) return;
    var data = typeof MOVIE_SEARCH_DATA !== 'undefined' ? MOVIE_SEARCH_DATA : [];
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        section.hidden = true;
        return;
      }
      var matched = data.filter(function(item) {
        return item.searchText.indexOf(q) !== -1;
      }).slice(0, 120);
      section.hidden = false;
      results.innerHTML = matched.map(movieCard).join('');
      if (empty) empty.hidden = matched.length > 0;
    }

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      history.replaceState(null, '', url);
      render(query);
    });

    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function() {
    bindHeader();
    bindHero();
    bindSearchPage();
  });
})();
