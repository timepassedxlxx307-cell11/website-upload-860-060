var MoviePlayer = (function () {
    function load(video, source) {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
        } else {
            video.src = source;
        }

        video.setAttribute("data-ready", "1");
    }

    function init(videoId, playId, coverId, source) {
        var video = document.getElementById(videoId);
        var play = document.getElementById(playId);
        var cover = document.getElementById(coverId);

        if (!video || !play || !cover || !source) {
            return;
        }

        function start() {
            load(video, source);
            cover.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        play.addEventListener("click", start);
        cover.addEventListener("click", start);
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
    }

    return {
        init: init
    };
})();
