(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("open");
      toggle.textContent = panel.classList.contains("open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
      });
    }

    show(0);
    window.setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  function initLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    scopes.forEach(function(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
      var clear = scope.querySelector("[data-filter-clear]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var activeTerm = "";

      function runFilter() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function(card) {
          var index = normalize(card.getAttribute("data-index"));
          var matched = true;
          if (query && index.indexOf(query) === -1) {
            matched = false;
          }
          if (activeTerm && index.indexOf(activeTerm) === -1) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", runFilter);
      }

      chips.forEach(function(chip) {
        chip.addEventListener("click", function() {
          activeTerm = normalize(chip.getAttribute("data-filter-chip"));
          chips.forEach(function(item) {
            item.classList.toggle("active", item === chip);
          });
          if (clear) {
            clear.classList.remove("active");
          }
          runFilter();
        });
      });

      if (clear) {
        clear.addEventListener("click", function() {
          activeTerm = "";
          chips.forEach(function(item) {
            item.classList.remove("active");
          });
          clear.classList.add("active");
          runFilter();
        });
      }

      runFilter();
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-global-search]");
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var input = page.querySelector("[data-global-search-input]");
    var button = page.querySelector("[data-global-search-button]");
    var results = page.querySelector("[data-global-search-results]");
    var empty = page.querySelector("[data-global-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input) {
      input.value = initial;
    }

    function buildCard(item) {
      return "<article class="movie-card">" +
        "<a class="poster-link" href="" + escapeHtml(item.url) + "" aria-label="观看 " + escapeHtml(item.title) + "">" +
        "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">" +
        "<span class="poster-shade"></span>" +
        "<span class="play-pill">立即观看</span>" +
        "</a>" +
        "<div class="movie-card-body">" +
        "<div class="meta-line"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
        "<h3><a href="" + escapeHtml(item.url) + "">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.oneLine) + "</p>" +
        "<div class="tag-row"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.genre) + "</span></div>" +
        "</div>" +
        "</article>";
    }

    function render() {
      var query = normalize(input ? input.value : "");
      var list = window.SEARCH_MOVIES.filter(function(item) {
        if (!query) {
          return item.featured;
        }
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags + " " + item.oneLine + " " + item.category).indexOf(query) !== -1;
      }).slice(0, 96);
      results.innerHTML = list.map(buildCard).join("");
      if (empty) {
        empty.classList.toggle("visible", list.length === 0);
      }
    }

    if (input) {
      input.addEventListener("input", render);
      input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          render();
        }
      });
    }

    if (button) {
      button.addEventListener("click", render);
    }

    render();
  }

  ready(function() {
    initMobileMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
