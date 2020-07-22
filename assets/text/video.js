var videoPlayer;

// Async load of Youtube Iframes API
var iframe_api_tag = document.createElement('script');
iframe_api_tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(iframe_api_tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {
	videoPlayer = new YT.Player('video-container', {
	  events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
	  }
	});
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
	console.log('on ready called');
	event.target.mute();
	event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
	console.log('on state change called: ' + event.data);
if (event.data == YT.PlayerState.PLAYING && !done) {
  setTimeout(stopVideo, 6000);
  done = true;
}
}
function stopVideo() {
	videoPlayer.stopVideo();
}
