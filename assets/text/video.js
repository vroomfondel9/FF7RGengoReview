var videoPlayer;

// Async load of Youtube Iframes API
var iframe_api_tag = document.createElement('script');
iframe_api_tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(iframe_api_tag, firstScriptTag);

// Called when Async Youtube Iframes API load complete
function onYouTubeIframeAPIReady() {
	videoPlayer = new YT.Player('video-container', {
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

// Called when video ready to play
function onPlayerReady(event) {
	console.log('on ready called');
	event.target.mute();
	event.target.playVideo();
}

// Status key:
// -1: Unstarted	(no enum)
//  0: Ended		YT.PlayerState.ENDED
//  1: Playing		YT.PlayerState.PLAYING
//  2: Paused		YT.PlayerState.PAUSED
//  3: Buffering	YT.PlayerState.BUFFERING
//  5: Cued			YT.PlayerState.CUED
function onPlayerStateChange(event) {
	console.log('on state change called: ' + event.data);
	if (event.data == YT.PlayerState.PLAYING) {
		setTimeout(unmuteVideo, 6000);
	}
}
function unmuteVideo() {
	videoPlayer.unMute();
}

function stopVideo() {
	videoPlayer.stopVideo();
}
