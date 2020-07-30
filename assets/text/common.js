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
	//Should probably do some validation but that's boring!
	populateEndTimestamps();
}

function populateEndTimestamps() {
	videoDetails.intro.end = videoDetails.questions[0].intro;
	videoDetails.questions[videoDetails.questions.length - 1].end = videoDetails.outro.fanfare;
	
	for (var i = 0; i <= videoDetails.questions.length - 2; i++) {
		videoDetails.questions[i].end = videoDetails.questions[i + 1].intro;
		console.log(i + ': ' + videoDetails.questions[i].end);
	}
}