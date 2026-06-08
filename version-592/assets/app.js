(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });

    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')));
      startHero();
    });
  });

  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list] .movie-card'));
  var activeFilters = {
    type: '',
    region: '',
    year: ''
  };

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function cardMatches(card, query) {
    var target = [
      card.getAttribute('data-title'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();

    if (query && target.indexOf(query) === -1) {
      return false;
    }

    if (activeFilters.type && card.getAttribute('data-type') !== activeFilters.type) {
      return false;
    }

    if (activeFilters.region && card.getAttribute('data-region') !== activeFilters.region) {
      return false;
    }

    if (activeFilters.year && card.getAttribute('data-year') !== activeFilters.year) {
      return false;
    }

    return true;
  }

  function applySearch() {
    var query = normalize(searchInputs.length ? searchInputs[0].value : '');

    cards.forEach(function (card) {
      card.classList.toggle('hidden-card', !cardMatches(card, query));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });

      applySearch();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-kind]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var kind = button.getAttribute('data-filter-kind');
      var value = button.getAttribute('data-filter-value') || '';
      activeFilters[kind] = value;

      Array.prototype.slice.call(document.querySelectorAll('[data-filter-kind="' + kind + '"]')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      applySearch();
    });
  });

  var shell = document.querySelector('.stream-shell');
  var video = document.querySelector('.stream-player');
  var startButton = document.querySelector('.stream-start');
  var attached = false;

  function attachStream() {
    if (!video || attached) {
      return;
    }

    var url = video.getAttribute('data-stream');

    if (!url) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = url;
    attached = true;
  }

  function playVideo() {
    if (!video) {
      return;
    }

    attachStream();

    var playPromise = video.play();

    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }

    if (shell) {
      shell.classList.add('playing');
    }
  }

  if (startButton) {
    startButton.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove('playing');
      }
    });
  }
})();
