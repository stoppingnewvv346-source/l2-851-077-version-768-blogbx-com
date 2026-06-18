(function() {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    if (!video || !streamUrl) return;
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared) return;
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      prepare();
      if (overlay) overlay.classList.add('is-hidden');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function() {
          if (overlay) overlay.classList.remove('is-hidden');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
      if (video.paused) start();
    });
    video.addEventListener('play', function() {
      if (overlay) overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function() {
      if (overlay && video.currentTime === 0) overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
