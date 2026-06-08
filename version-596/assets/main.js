(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = menu.hasAttribute("hidden") === false;
            if (opened) {
                menu.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            } else {
                menu.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            }
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector(".js-hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-index"));
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilter() {
        var input = document.querySelector(".js-page-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-filter-card"));
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }
        function apply() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var hay = card.getAttribute("data-search") || card.textContent.toLowerCase();
                card.hidden = query.length > 0 && hay.indexOf(query) === -1;
            });
        }
        input.addEventListener("input", apply);
        apply();
    }

    function setupForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("form[action='./search.html']"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (input && input.value.trim()) {
                    input.value = input.value.trim();
                }
            });
        });
    }

    window.initMoviePlayer = function (videoId, url, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !url) {
            return;
        }
        var loaded = false;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            load();
        });
        video.addEventListener("loadedmetadata", function () {
            if (overlay && !video.paused) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupLocalFilter();
        setupForms();
    });
})();
