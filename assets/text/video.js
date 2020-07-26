var videoPlayer;

var previousVideoTime = 0;
var currentVideoTime = 0;

var systemEvent = false;
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
        videoId: videoDetails.id,
		playerVars: {
			'enablejsapi': 1, 
			'origin': 'https://vroomfondel9.github.io',
			'controls': 0,
			'disablekb': 1,
			'fs': 0,
			'iv_load_policy': 3,
			'rel': 0,
			'start': videoDetails.intro.start
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

// Called when video ready to play
function onPlayerReady(event) {
	// This ugly hack must be done because the Youtube API doesn't include events for timeline progress. Oh well!
	function updateTime() {
		previousVideoTime = currentVideoTime;
		if (videoPlayer && videoPlayer.getCurrentTime) {
			currentVideoTime = videoPlayer.getCurrentTime();
		}
		if (currentVideoTime > previousVideoTime) {
			onPlayerProgress(currentVideoTime);
		}
	}
	videoPlayer.timelineMonitor = setInterval(updateTime, 100);
	videoPlayer.timelineBasedEvent = null;
	
	addTimelineBasedEvent(2411, testFunction, ["hello", "world"]);
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
	
	// Used for user-initiated events
	if (!systemEvent) {
		if (event.data == YT.PlayerState.PLAYING) {
			videoAuthorized = true;
			resumeGame();
		}
		else if (event.data == YT.PlayerState.PAUSED) {
			pauseGame();
		}
	}
	
	systemEvent = false;
}

function onPlayerProgress(time) {
	if (videoPlayer.timelineBasedEvent) {
		if (time >= videoPlayer.timelineBasedEvent.time) {
			var callback = videoPlayer.timelineBasedEvent.callback;
			var params = videoPlayer.timelineBasedEvent.params;
			clearTimelineBasedEvent();
			
			callback(params);
		}
	}
}

function addTimelineBasedEvent(time, callback, params) {
	videoPlayer.timelineBasedEvent = {
		"time": time,
		"callback": callback,
		"params": params
	};
}

function clearTimelineBasedEvent() {
	videoPlayer.timelineBasedEvent = null;
}

// "API" functions (to be called by the game, etc)

function testFunction(whatever) {
	console.log("Test function called! " + whatever);
}

function playVideo() {
	systemEvent = true;
	videoPlayer.playVideo();
}

function pauseVideo() {
	systemEvent = true;
	videoPlayer.pauseVideo();
}
