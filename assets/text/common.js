var CONSTANTS = {
	"LANG": {
		"ENG": 0,
		"JPN": 1
	},
	"MODE": {
		"MULTI": 0,
		"KANJI": 1,
		"KANA": 2,
		"ROMAJI": 3
	}
};

var content = {
	"status": {
		"playerName": ["Cloud", "クラウド"],
		"command": {
			"options": {
				"answer": ["Answer", "こたえる"],
				"magic": ["Magic", "まほう"],
				"sense": ["Sense", "みやぶる"],
				"item": ["Item", "アイテム"]
			},
			"sub": {
				"answer": {
					"recallLabel": ["Enter Answer", "答え入力して"]
				}
			}
		}
	}
};

preprocessVideoDetails();

function preprocessVideoDetails() {
	validateVideoDetails();
	populateEndTimestamps();
}

function validateVideoDetails() {
	if (videoDetails) {
		if (videoDetails.intro) {
			if (!videoDetails.intro.start) {
				console.error("Video details intro section start time is not defined. Check content file.");
			}
			
			if (!videoDetails.intro.encounter) {
				console.error("Video details intro section encounter start time is not defined. Check content file.");
			}
		} else {
			console.error("Video details intro section is not defined. Check content file.");
		}
		
		if (videoDetails.questions && videoDetails.questions.length && videoDetails.questions.length > 0) {
			var curQuestion;
			for (var i = 0; i < videoDetails.questions.length; i++) {
				curQuestion = videoDetails.questions[i];
				if (curQuestion) {
					if (!curQuestion.intro) {
						console.error("Video details question " + i + " has no intro time defined. Check content file.");
					}
					
					if (!curQuestion.startTimer) {
						console.error("Video details question " + i + " has no question start time defined. Check content file.");
					}
					
					if (!curQuestion.endTimer) {
						console.error("Video details question " + i + " has no question end time defined. Check content file.");
					}
					
					if (!curQuestion.kill) {
						console.error("Video details question " + i + " has no question kill sfx start time defined. Check content file.");
					}
				} else {
					console.error("Video details question " + i + " is not defined. Check content file.");
				}
			}
		} else {
			console.error("Video details questions section is not defined, is not an array, or contains no questions. Check content file.");
		}
		
		if (videoDetails.outro) {
			if (!videoDetails.outro.fanfare) {
				console.error("Video details outro section fanfare start time is not defined. Check content file.");
			}
			
			if (!videoDetails.outro.exp) {
				console.error("Video details outro section experience gain screen start time is not defined. Check content file.");
			}
			
			if (!videoDetails.outro.items) {
				console.error("Video details outro section item gain screen start time is not defined. Check content file.");
			}
		} else {
			console.error("Video details outro section is not defined. Check content file.");
		}
	} else {
		console.error("Video details are not defined. Check content file.");
	}
}

function populateEndTimestamps() {
	videoDetails.intro.end = videoDetails.questions[0].intro;
	videoDetails.questions[videoDetails.questions.length - 1].end = videoDetails.outro.fanfare;
	
	for (var i = 0; i <= videoDetails.questions.length - 2; i++) {
		videoDetails.questions[i].end = videoDetails.questions[i + 1].intro;
	}
}