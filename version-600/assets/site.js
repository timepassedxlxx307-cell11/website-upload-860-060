(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyQueryFromUrl() {
        if (!filterInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            filterInput.value = query;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var searchText = (card.getAttribute('data-search') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var matched = (!query || searchText.indexOf(query) !== -1) && (!year || cardYear === year);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards();
        });
    }

    if (filterInput) {
        applyQueryFromUrl();
        filterInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }

    filterCards();

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-m3u8');
        var initialized = false;
        var hlsInstance = null;

        function initialize(playNow) {
            if (!video || !source) {
                return;
            }
            if (!initialized) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
                        if (data && data.fatal && hlsInstance) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                hlsInstance.destroy();
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                initialized = true;
            }
            player.classList.add('is-playing');
            if (playNow) {
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function () {
                initialize(true);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!initialized) {
                    initialize(true);
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
