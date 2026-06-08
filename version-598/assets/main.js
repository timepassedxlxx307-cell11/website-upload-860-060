(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initHeader() {
        var header = $("#site-header");
        var toggle = $("[data-menu-toggle]");
        var menu = $("[data-mobile-menu]");

        function syncHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 20) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
                document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
            });
        }
    }

    function initHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = $all("[data-hero-slide]", hero);
        var dots = $all("[data-hero-dot]", hero);
        var previous = $("[data-hero-prev]", hero);
        var next = $("[data-hero-next]", hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        show(0);
        play();
    }

    function initSearchForms() {
        $all(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    window.location.href = "search.html";
                }
            });
        });
    }

    function initFilters() {
        var root = $("[data-filter-root]");
        if (!root) {
            return;
        }

        var cards = $all("[data-movie-card]", root);
        var keywordInput = $("[data-filter-keyword]", root);
        var regionSelect = $("[data-filter-region]", root);
        var typeSelect = $("[data-filter-type]", root);
        var button = $("[data-filter-button]", root);
        var noResults = $("[data-no-results]", root);
        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get("q") || "";

        if (keywordInput && urlQuery) {
            keywordInput.value = urlQuery;
        }

        function apply() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-keywords") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesRegion = !region || cardRegion === region;
                var matchesType = !type || cardType === type;
                var showCard = matchesKeyword && matchesRegion && matchesType;
                card.classList.toggle("is-hidden", !showCard);
                if (showCard) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle("is-visible", visible === 0);
            }
        }

        if (keywordInput) {
            keywordInput.addEventListener("input", apply);
        }
        if (regionSelect) {
            regionSelect.addEventListener("change", apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", apply);
        }
        if (button) {
            button.addEventListener("click", apply);
        }

        apply();
    }

    ready(function () {
        initHeader();
        initHero();
        initSearchForms();
        initFilters();
    });
})();
