(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initializeMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initializeHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
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

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initializeFiltering() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!input || !cards.length) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    });
  }

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card" data-movie-card data-search="' + escapeHtml(movie.searchText) + '">',
      '<a href="' + escapeHtml(movie.url) + '">',
      '<div class="poster">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="badge">' + escapeHtml(movie.year) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h2 class="card-title">' + escapeHtml(movie.title) + '</h2>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initializeSearchPage() {
    var input = document.querySelector("[data-global-search]");
    var grid = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-empty-state]");
    if (!input || !grid || !window.MOVIE_INDEX) {
      return;
    }

    function render(keyword) {
      var normalized = keyword.trim().toLowerCase();
      var results = window.MOVIE_INDEX.filter(function (movie) {
        return !normalized || movie.searchText.toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 120);

      grid.innerHTML = results.map(movieCardTemplate).join("");
      if (empty) {
        empty.style.display = results.length ? "none" : "block";
      }
    }

    input.addEventListener("input", function () {
      render(input.value);
    });
    render("");
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-video-player]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !streamUrl) {
      return;
    }

    var loaded = false;
    var hls = null;

    function attachStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    initializeMobileMenu();
    initializeHero();
    initializeFiltering();
    initializeSearchPage();
  });
})();
