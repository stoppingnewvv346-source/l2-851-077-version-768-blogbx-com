(() => {
  const video = document.getElementById('movie-video');
  const cover = document.getElementById('video-cover');
  const shell = document.getElementById('video-shell');
  const streamUrl = window.__PLAY_URL;
  let bound = false;

  function bindVideo() {
    if (!video || !streamUrl || bound) return;
    bound = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  async function playVideo() {
    bindVideo();
    if (shell) shell.classList.add('playing');
    try {
      await video.play();
    } catch (error) {
      if (shell) shell.classList.remove('playing');
    }
  }

  if (video) {
    video.addEventListener('play', () => shell?.classList.add('playing'));
    video.addEventListener('click', () => {
      if (video.paused) playVideo();
    });
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }
})();
