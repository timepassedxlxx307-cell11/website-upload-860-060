(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var forms = document.querySelectorAll('[data-site-search]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var keyword = input ? input.value.trim() : '';
      if (keyword) {
        var base = form.getAttribute('data-base') || '';
        window.location.href = base + 'search.html?q=' + encodeURIComponent(keyword);
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var emptyBox = document.querySelector('[data-empty-results]');

    var updateFilter = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre')).toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchCategory = !category || card.getAttribute('data-category') === category;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matched = matchKeyword && matchCategory && matchRegion && matchYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyBox) {
        emptyBox.style.display = visibleCount ? 'none' : 'block';
      }
    };

    [keywordInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', updateFilter);
        control.addEventListener('change', updateFilter);
      }
    });

    updateFilter();
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && typeof SEARCH_INDEX !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');

    if (input) {
      input.value = q;
    }

    var render = function (keyword) {
      var normalized = keyword.trim().toLowerCase();
      var matched = normalized
        ? SEARCH_INDEX.filter(function (item) {
            return (item.title + ' ' + item.region + ' ' + item.year + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine).toLowerCase().indexOf(normalized) !== -1;
          }).slice(0, 80)
        : SEARCH_INDEX.slice(0, 40);

      if (results) {
        results.innerHTML = matched.map(function (item) {
          return '<a class="movie-card" href="detail/' + item.file + '">' +
            '<div class="card-image"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '"><span class="card-tag">' + escapeHtml(item.region) + '</span><span class="card-score">' + item.rating + ' 分</span></div>' +
            '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div><p>' + escapeHtml(item.oneLine) + '</p></div>' +
            '</a>';
        }).join('');
      }

      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
      }
    };

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(q);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();

function initMoviePlayer(videoId, coverId, buttonId, source) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var button = document.getElementById(buttonId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  var attachSource = function () {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  };

  var start = function () {
    attachSource();
    video.controls = true;
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
