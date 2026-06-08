(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('.cover-image').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var startTimer = function () {
            if (slides.length <= 1) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                window.clearInterval(timer);
                startTimer();
            });
        });

        startTimer();
    }

    document.querySelectorAll('[data-local-filter]').forEach(function (panel) {
        var searchInput = panel.querySelector('[data-filter-search]');
        var countLabel = panel.querySelector('[data-filter-count]');
        var results = document.querySelector('[data-filter-results]');

        if (!results) {
            return;
        }

        var cards = Array.prototype.slice.call(results.querySelectorAll('[data-movie-card]'));
        var filters = {
            year: '',
            region: '',
            type: ''
        };

        var applyFilter = function () {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !filters.year || card.getAttribute('data-year') === filters.year;
                var matchesRegion = !filters.region || card.getAttribute('data-region') === filters.region;
                var matchesType = !filters.type || card.getAttribute('data-type') === filters.type;
                var shouldShow = matchesText && matchesYear && matchesRegion && matchesType;

                card.classList.toggle('is-hidden', !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = visible + ' 部影片';
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        panel.querySelectorAll('[data-filter-group]').forEach(function (group) {
            var name = group.getAttribute('data-filter-group');

            group.querySelectorAll('[data-filter-value]').forEach(function (button) {
                button.addEventListener('click', function () {
                    group.querySelectorAll('[data-filter-value]').forEach(function (item) {
                        item.classList.remove('is-active');
                    });

                    button.classList.add('is-active');
                    filters[name] = button.getAttribute('data-filter-value') || '';
                    applyFilter();
                });
            });
        });
    });

    var tableSearch = document.querySelector('[data-table-search]');
    var rankingTable = document.querySelector('[data-ranking-table]');

    if (tableSearch && rankingTable) {
        var rows = Array.prototype.slice.call(rankingTable.querySelectorAll('tbody tr'));

        tableSearch.addEventListener('input', function () {
            var query = tableSearch.value.trim().toLowerCase();

            rows.forEach(function (row) {
                var haystack = row.getAttribute('data-search') || row.textContent.toLowerCase();
                row.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
            });
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchSummary = document.querySelector('[data-search-summary]');
    var searchForm = document.querySelector('[data-search-form]');

    if (searchResults && searchSummary && Array.isArray(window.SEARCH_INDEX)) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        var input = searchForm ? searchForm.querySelector('input[name="q"]') : null;

        if (input) {
            input.value = queryValue;
        }

        var renderCard = function (movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + movie.url + '">',
                '        <span class="poster-shell">',
                '            <img class="cover-image" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '            <span class="poster-gradient"></span>',
                '            <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
                '            <span class="poster-play">▶</span>',
                '        </span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <a class="movie-card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
                '        <p>' + escapeHtml(movie.description) + '</p>',
                '        <div class="movie-meta-row">',
                '            <span>⭐ ' + escapeHtml(movie.rating) + '</span>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '        </div>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('');
        };

        var runSearch = function () {
            var query = (input ? input.value : queryValue).trim().toLowerCase();

            if (!query) {
                searchSummary.textContent = '请输入关键词开始搜索。';
                searchResults.innerHTML = window.SEARCH_INDEX.slice(0, 24).map(renderCard).join('');
                attachSearchImageFallback();
                return;
            }

            var words = query.split(/\s+/).filter(Boolean);
            var matches = window.SEARCH_INDEX.filter(function (movie) {
                var haystack = movie.search;
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            });

            searchSummary.textContent = '搜索 “' + query + '” 找到 ' + matches.length + ' 部影片。';
            searchResults.innerHTML = matches.slice(0, 240).map(renderCard).join('');
            attachSearchImageFallback();
        };

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : '';
                var url = new URL(window.location.href);

                if (query) {
                    url.searchParams.set('q', query);
                } else {
                    url.searchParams.delete('q');
                }

                window.history.replaceState({}, '', url.toString());
                runSearch();
            });
        }

        runSearch();
    }

    function attachSearchImageFallback() {
        document.querySelectorAll('[data-search-results] .cover-image').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            });
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
