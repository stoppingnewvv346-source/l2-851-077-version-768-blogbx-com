(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var year = document.querySelector("[data-year-filter]");
    var region = document.querySelector("[data-region-filter]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matchText(card, value) {
      if (!value) {
        return true;
      }
      return (card.getAttribute("data-search") || "").toLowerCase().indexOf(value.toLowerCase()) !== -1;
    }

    function apply() {
      var q = input ? input.value.trim() : "";
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      cards.forEach(function (card) {
        var ok = matchText(card, q);
        if (ok && y) {
          ok = card.getAttribute("data-year") === y;
        }
        if (ok && r) {
          ok = card.getAttribute("data-region") === r;
        }
        card.hidden = !ok;
      });
    }

    [input, year, region].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      if (!video || !stream) {
        return;
      }

      function hideCover() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      function begin() {
        hideCover();
        video.controls = true;
        if (video.dataset.ready === "yes") {
          video.play().catch(function () {});
          return;
        }
        video.dataset.ready = "yes";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          video.hlsObject = hls;
          return;
        }
        video.src = stream;
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (video.dataset.ready !== "yes") {
          begin();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
