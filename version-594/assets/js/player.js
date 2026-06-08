(function () {
    var player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var source = video ? video.getAttribute('data-video-url') : '';
    var hlsInstance = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    var hideOverlay = function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    };

    var playVideo = function () {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };

    var loadSource = function () {
        if (loaded) {
            hideOverlay();
            playVideo();
            return;
        }

        loaded = true;
        hideOverlay();

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            return;
        }

        video.src = source;
        video.load();
        playVideo();
    };

    if (overlay) {
        overlay.addEventListener('click', loadSource);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            loadSource();
        }
    });

    video.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
