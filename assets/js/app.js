(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-button]');
    var mobileNav = qs('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    if (slides.length) {
        showSlide(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            restartHero();
        });
    });

    var search = qs('[data-role="movie-search"]');
    var yearFilter = qs('[data-role="year-filter"]');
    var regionFilter = qs('[data-role="region-filter"]');
    var cards = qsa('.movie-card');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var keyword = normalize(search && search.value);
        var year = normalize(yearFilter && yearFilter.value);
        var region = normalize(regionFilter && regionFilter.value);

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var ok = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                ok = false;
            }
            if (year && cardYear !== year) {
                ok = false;
            }
            if (region && cardRegion !== region) {
                ok = false;
            }

            card.classList.toggle('is-hidden', !ok);
        });
    }

    [search, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    window.MoviePlayer = function (stream) {
        var shell = qs('.player-shell');
        if (!shell) {
            return;
        }

        var video = qs('.movie-video', shell);
        var button = qs('.play-overlay', shell);
        var hlsInstance = null;
        var loaded = false;

        function attach() {
            if (!video || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function play() {
            attach();
            shell.classList.add('is-playing');
            if (video) {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
