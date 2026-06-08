(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  window.createMoviePlayer = function(videoId, coverId, source) {
    ready(function() {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger]"));
      var started = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (started) {
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function start(event) {
        if (event) {
          event.preventDefault();
        }
        attachSource();
        video.play().catch(function() {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
          started = false;
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      triggers.forEach(function(trigger) {
        trigger.addEventListener("click", start);
      });
    });
  };
})();
