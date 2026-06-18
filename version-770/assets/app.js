(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
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

    function setupHeroCarousel() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
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
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupRails() {
        document.querySelectorAll("[data-scroll-left], [data-scroll-right]").forEach(function (button) {
            button.addEventListener("click", function () {
                var targetId = button.getAttribute("data-scroll-left") || button.getAttribute("data-scroll-right");
                var target = document.getElementById(targetId);
                if (!target) {
                    return;
                }
                var direction = button.hasAttribute("data-scroll-left") ? -1 : 1;
                target.scrollBy({
                    left: direction * Math.max(target.clientWidth * 0.8, 260),
                    behavior: "smooth"
                });
            });
        });
    }

    function uniqueValues(cards, key) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute("data-" + key) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var yearSelect = document.querySelector("[data-filter-select='year']");
        var regionSelect = document.querySelector("[data-filter-select='region']");
        var categorySelect = document.querySelector("[data-filter-select='category']");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);

        fillSelect(yearSelect, uniqueValues(cards, "year"));
        fillSelect(regionSelect, uniqueValues(cards, "region"));

        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        function update() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var category = categorySelect ? categorySelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var blob = (card.getAttribute("data-search") || "").toLowerCase();
                var matchesTerm = !term || blob.indexOf(term) !== -1;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                var matchesRegion = !region || card.getAttribute("data-region") === region;
                var matchesCategory = !category || card.getAttribute("data-category") === category;
                var show = matchesTerm && matchesYear && matchesRegion && matchesCategory;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, yearSelect, regionSelect, categorySelect].forEach(function (item) {
            if (item) {
                item.addEventListener("input", update);
                item.addEventListener("change", update);
            }
        });
        update();
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var hls = null;
        var loaded = false;

        if (!video || !overlay || !config.streamUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = config.streamUrl;
            }
        }

        function play() {
            load();
            overlay.hidden = true;
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    overlay.hidden = false;
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHeroCarousel();
        setupRails();
        setupFilters();
    });
}());
