(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initNav() {
    var toggle = qs('.nav-toggle');
    var links = qs('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var select = qs('[data-filter-select]', scope);
      var cards = qsa('[data-card]', scope);
      var empty = qs('[data-empty]', scope);

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var selected = normalize(select ? select.value : 'all');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var year = normalize(card.getAttribute('data-year'));
          var matchText = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = selected === 'all' || year === selected;
          var show = matchText && matchYear;
          card.classList.toggle('hidden-by-filter', !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      apply();
    });
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('.player-overlay', player);
      var stream = player.getAttribute('data-stream');
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function bindStream() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.setAttribute('data-ready', '1');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.setAttribute('data-ready', '1');
          return;
        }

        video.src = stream;
        video.setAttribute('data-ready', '1');
      }

      function playVideo() {
        bindStream();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
