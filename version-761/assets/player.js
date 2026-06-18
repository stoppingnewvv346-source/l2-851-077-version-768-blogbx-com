
(function () {
  window.MoviePlayer = {
    start: function (source) {
      function boot() {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("movie-play-overlay");
        var button = document.getElementById("movie-play-button");
        var attached = false;
        var pendingPlay = false;
        var hls = null;

        if (!video || !source) {
          return;
        }

        function hideOverlay() {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        }

        function attach() {
          if (attached) {
            return;
          }
          attached = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            if (pendingPlay) {
              video.play().catch(function () {});
            }
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              if (pendingPlay) {
                video.play().catch(function () {});
              }
            });
            return;
          }
          video.src = source;
          if (pendingPlay) {
            video.play().catch(function () {});
          }
        }

        function play() {
          pendingPlay = true;
          hideOverlay();
          attach();
          if (attached && !hls) {
            video.play().catch(function () {});
          }
        }

        attach();
        if (overlay) {
          overlay.addEventListener("click", play);
        }
        if (button) {
          button.addEventListener("click", play);
        }
        video.addEventListener("play", hideOverlay);
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }

      if (document.readyState !== "loading") {
        boot();
      } else {
        document.addEventListener("DOMContentLoaded", boot);
      }
    }
  };
})();
