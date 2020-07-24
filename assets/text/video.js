var videoPlayer;
var videoReady = false;
var videoAuthorized = false;

// Async load of Youtube Iframes API
var iframe_api_tag = document.createElement('script');
iframe_api_tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(iframe_api_tag, firstScriptTag);

// Called when Async Youtube Iframes API load complete
function onYouTubeIframeAPIReady() {
	videoReady = true;
	videoPlayer = new YT.Player('video-container', {
        width: '800',
		height: '600',
        videoId: videoId,
		playerVars: {
			'enablejsapi': 1, 
			'origin': 'https://vroomfondel9.github.io',
			'controls': 0,
			'disablekb': 1,
			'fs': 0,
			'iv_load_policy': 3,
			'rel': 0,
			'start': videoStartTime
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

// Called when video ready to play
function onPlayerReady(event) {
	console.log('on ready called');
	//event.target.mute();
	//event.target.playVideo();
}

// Status key:
// -1: Unstarted	(no enum)
//  0: Ended		YT.PlayerState.ENDED
//  1: Playing		YT.PlayerState.PLAYING
//  2: Paused		YT.PlayerState.PAUSED
//  3: Buffering	YT.PlayerState.BUFFERING
//  5: Cued			YT.PlayerState.CUED

// Note user can still manually pause by clicking video. Need to account for this.
function onPlayerStateChange(event) {
	console.log('on state change called: ' + event.data);
	if (event.data == YT.PlayerState.PLAYING) {
		videoAuthorized = true;
		//resumeGame();
	}
	else if (event.data == YT.PlayerState.PAUSED) {
		//pauseGame();
	}
}

function playVideo() {
	videoPlayer.playVideo();
}

function pauseVideo() {
	videoPlayer.pauseVideo();
}

function unmuteVideo() {
	videoPlayer.unMute();
}

function stopVideo() {
	videoPlayer.stopVideo();
}
