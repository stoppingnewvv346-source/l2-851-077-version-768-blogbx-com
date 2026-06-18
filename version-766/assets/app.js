(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = nav.classList.toggle("open");
            document.body.classList.toggle("menu-open", opened);
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

    function textOf(value) {
        return (value || "").toString().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var select = panel.querySelector("[data-filter-select]");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));
            var scopeSelector = panel.getAttribute("data-filter-target");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var noResult = document.querySelector(panel.getAttribute("data-empty-target") || "");
            var activeChip = "all";
            function apply() {
                var keyword = textOf(input && input.value).trim();
                var typeValue = select ? select.value : "all";
                var visible = 0;
                cards.forEach(function (card) {
                    var content = textOf(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year") + " " + card.textContent);
                    var typeMatch = typeValue === "all" || card.getAttribute("data-category") === typeValue || card.getAttribute("data-type") === typeValue;
                    var chipMatch = activeChip === "all" || content.indexOf(activeChip) !== -1;
                    var keywordMatch = !keyword || content.indexOf(keyword) !== -1;
                    var showCard = typeMatch && chipMatch && keywordMatch;
                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });
                if (noResult) {
                    noResult.classList.toggle("show", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeChip = textOf(chip.getAttribute("data-filter-chip") || "all");
                    apply();
                });
            });
            apply();
        });
    }

    function startPlayback(video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    function initPlayer(url) {
        var video = document.getElementById("movie-player");
        var cover = document.getElementById("player-cover");
        var button = document.getElementById("play-button");
        var status = document.getElementById("player-status");
        if (!video || !url) {
            return;
        }
        var loaded = false;
        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }
        function load() {
            if (loaded) {
                startPlayback(video);
                return;
            }
            loaded = true;
            if (cover) {
                cover.classList.add("hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.addEventListener("loadedmetadata", function () {
                    startPlayback(video);
                }, { once: true });
                video.load();
                startPlayback(video);
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    startPlayback(video);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放加载失败，请稍后再试");
                    }
                });
                return;
            }
            setStatus("播放暂时不可用，请稍后重试");
        }
        if (cover) {
            cover.addEventListener("click", load);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                load();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                load();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.Site = {
        initPlayer: initPlayer
    };
})();
