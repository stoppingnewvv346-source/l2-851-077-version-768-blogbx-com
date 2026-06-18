(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var activeValue = "all";

    function matchCard(card) {
      var query = input ? input.value.trim().toLowerCase() : "";
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-terms")
      ].join(" ").toLowerCase();
      var filterMatch = activeValue === "all" || text.indexOf(activeValue.toLowerCase()) !== -1;
      var queryMatch = !query || text.indexOf(query) !== -1;
      card.hidden = !(filterMatch && queryMatch);
    }

    function update() {
      cards.forEach(matchCard);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeValue = button.getAttribute("data-filter-value") || "all";
        update();
      });
    });

    if (input) {
      input.addEventListener("input", update);
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        stop();
        show(dotIndex);
        start();
      });
    });

    var stage = document.querySelector("[data-hero-stage]");
    if (stage) {
      stage.addEventListener("mouseenter", stop);
      stage.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("button");
      var source = player.getAttribute("data-source");
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function loadAndPlay() {
        if (video.getAttribute("data-loaded") !== "true") {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }
          video.setAttribute("data-loaded", "true");
          video.controls = true;
        }
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }
      video.addEventListener("click", function () {
        if (video.getAttribute("data-loaded") !== "true") {
          loadAndPlay();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
