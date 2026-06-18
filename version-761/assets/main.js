
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function textOf(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
          slide.setAttribute("aria-hidden", i === index ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function autoplay() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          autoplay();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          autoplay();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          autoplay();
        });
      });
      show(0);
      autoplay();
    }

    var input = document.querySelector("[data-search-input]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var regionFilter = document.querySelector("[data-filter-region]");
    var sortSelect = document.querySelector("[data-sort]");
    var grid = document.querySelector("[data-list-grid]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    if (input && window.location.search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }

    function applyFilters() {
      var q = input ? textOf(input.value) : "";
      var type = typeFilter ? textOf(typeFilter.value) : "";
      var year = yearFilter ? textOf(yearFilter.value) : "";
      var region = regionFilter ? textOf(regionFilter.value) : "";
      cards.forEach(function (card) {
        var body = textOf(card.getAttribute("data-text") + " " + card.getAttribute("data-title"));
        var cardType = textOf(card.getAttribute("data-type"));
        var cardYear = textOf(card.getAttribute("data-year"));
        var cardRegion = textOf(card.getAttribute("data-region"));
        var visible = true;
        if (q && body.indexOf(q) === -1) {
          visible = false;
        }
        if (type && cardType !== type) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (region && cardRegion !== region) {
          visible = false;
        }
        card.classList.toggle("is-hidden", !visible);
      });
    }

    function applySort() {
      if (!grid || !sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      if (mode === "default") {
        cards.sort(function (a, b) {
          return Number(a.getAttribute("data-title") > b.getAttribute("data-title")) - Number(a.getAttribute("data-title") < b.getAttribute("data-title"));
        });
      }
      if (mode === "newest") {
        cards.sort(function (a, b) {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
      }
      if (mode === "oldest") {
        cards.sort(function (a, b) {
          return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
        });
      }
      if (mode === "title") {
        cards.sort(function (a, b) {
          return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [input, typeFilter, yearFilter, regionFilter].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilters);
        item.addEventListener("change", applyFilters);
      }
    });
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        applySort();
        applyFilters();
      });
    }
    applyFilters();
  });
})();
