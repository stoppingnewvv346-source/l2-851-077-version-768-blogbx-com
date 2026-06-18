(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (navToggle && mobileNav) {
            navToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                navToggle.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                    dot.setAttribute("aria-pressed", dotIndex === current ? "true" : "false");
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });

            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-card-search]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-card-select]"));
            var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-card]"));
            var empty = panel.querySelector("[data-empty]");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function filterCards() {
                var keyword = normalize(input ? input.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var searchable = normalize(card.getAttribute("data-search"));
                    var matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
                    var matchesSelects = selects.every(function (select) {
                        var field = select.getAttribute("data-card-select");
                        var value = select.value;
                        return !value || card.getAttribute("data-" + field) === value;
                    });
                    var isVisible = matchesKeyword && matchesSelects;
                    card.classList.toggle("hidden-card", !isVisible);
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", filterCards);
            });
            filterCards();
        });
    });
})();
