var config = {
    type: Phaser.AUTO,
	parent: 'game-container',
    width: 800,
    height: 600,
	dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game Options
var lang = content.LANG_JAPANESE;
var mode = content.MODE_KANJI;

// Fundemental variables
var battleEvents = [];
var env;
var ui;
var player;
var enemy;

var controls;
var gameOver = false;

var game = new Phaser.Game(config);

function preload ()
{
	// Background
    this.load.image('background', 'assets/images/backgrounds/background1.png');
    this.load.image('groundfore', 'assets/images/backgrounds/ground/groundfore-1.png');
	this.load.image('groundback', 'assets/images/backgrounds/ground/groundback-1.png');
	
	// Player
    this.load.spritesheet('player-idle', 'assets/images/sprites/player/player-idle.png', { frameWidth: 96, frameHeight: 97});
	this.load.spritesheet('player-run', 'assets/images/sprites/player/player-run.png', { frameWidth: 79, frameHeight: 97});
	this.load.spritesheet('player-attack', 'assets/images/sprites/player/player-attack.png', { frameWidth: 96, frameHeight: 96});
	this.load.spritesheet('player-land', 'assets/images/sprites/player/player-land3.png', { frameWidth: 96, frameHeight: 104});
	
	// UI
	this.load.image('ui-pause-background', 'assets/images/ui/pause-background.png');
	this.load.image('ui-bottom-foreground', 'assets/images/ui/menu-bottom-foreground6.png');
	this.load.image('ui-bottom-background', 'assets/images/ui/menu-bottom-background1.png');
	this.load.image('ui-bottom-gauge-single-green', 'assets/images/ui/single-gauge-green.png');
	this.load.image('ui-bottom-gauge-single-pink', 'assets/images/ui/single-gauge-pink2.png');
	this.load.image('ui-bottom-gauge-single-yellow', 'assets/images/ui/single-gauge-yellow.png');
	this.load.image('ui-command-menu', 'assets/images/ui/command-menu4.png');
	this.load.image('ui-command-sub-menu', 'assets/images/ui/command-sub-menu3.png');
	this.load.image('ui-move-name', 'assets/images/ui/move-name-label3.png');
	this.load.image('ui-cursor', 'assets/images/ui/cursor.png');
	this.load.html('ui-answerform', 'assets/text/answerform.html');
}

function create ()
{
	createEnvironment(this);
	createPlayer(this);
	createEnemies(this);
	createUI(this);
	createControls(this);
}

function update (time, delta)
{
	if (videoAuthorized) {
		if (gameOver)
		{
			return;
		}
		
		if (!player.animating && !enemy.animating) {
			if (battleEvents.length > 0) {
				console.log('stopping time');
				ui.status.time.pause();
				pauseVideo();
				
				var battleEvent = battleEvents.shift();
				battleEvent.evnt(battleEvent.params);
				
				if (battleEvent.playerAction) {
					ui.status.timefilled.hide();
				}
			} else if (!ui.status.time.flowing) {
				console.log('resuming time');
				ui.status.time.resume();
				playVideo();
			}
		}
		
		if (ui.controlledobject != null) {
			if (Phaser.Input.Keyboard.JustDown(controls.UP))
			{
				ui.controlledobject.next();
			}
			if (Phaser.Input.Keyboard.JustDown(controls.DOWN))
			{
				ui.controlledobject.previous();
			}
			if (Phaser.Input.Keyboard.JustDown(controls.ENTER))
			{
				ui.controlledobject.confirm();
			}
			if (Phaser.Input.Keyboard.JustDown(controls.ESCAPE))
			{
				ui.controlledobject.cancel();
			}
		}
		
		// TODO only for test purposes
		if (Phaser.Input.Keyboard.JustDown(controls.RIGHT))
		{
			//ui.status.time.pause();
		}
		
		if (Phaser.Input.Keyboard.JustDown(controls.LEFT))
		{
			console.log(this);
			console.log(game);
		}
	}
}

function createEnvironment(game) {
	env = {};
	
	// Cosmetic background
    env.background = game.add.image(400, 200, 'background');
	
	// Grouping of physics bodies
    env.ground = game.physics.add.staticGroup();

	env.ground.background = game.add.image(400, 329, 'groundback').setScale(2);
    env.ground.foreground = env.ground.create(400, 394, 'groundfore').setScale(2).refreshBody();
}

function createUI(game) {
	// Create UI parent container
	ui = {};
	
	createPauseDisplay(game);
	createUIStatusDisplay(game);
	createUIMoveName(game);
	
	createAnswerSubCommandMenu(game);
	
	createCommandMenu(game);
	
	ui.controlledobject = null;
}

function createUIMoveName(game) {
	ui.movename = {};

	// Move Name Label
	ui.movename.background = game.add.image(400, 50, 'ui-move-name');
	ui.movename.background.setDepth(200);
	ui.movename.background.visible = false;
	
	ui.movename.label = game.add.text(400, 50, "", {fontSize: '24px', fill: '#FFF'});
	ui.movename.label.setStroke('#BBB', 2);
	ui.movename.label.setOrigin(0.5);
	ui.movename.label.setDepth(210);
	ui.movename.label.visible = false;
	
	// Behaviors
	ui.movename.show = function(movename) {
		ui.movename.label.setText(movename);
		ui.movename.label.visible = true;
		ui.movename.background.visible = true;
	}
	
	ui.movename.hide = function() {
		ui.movename.label.visible = false;
		ui.movename.background.visible = false;
	}
}

function createPauseDisplay(game) {
	ui.pause = {};
	
	ui.pause.background = game.add.image(400, 300, 'ui-pause-background');
	ui.pause.background.setDepth(2000);
	ui.pause.background.visible = false;
	
	ui.pause.label = game.add.text(400, 225, "Paused", {fontSize: '24px', fill: '#FFF'});
	ui.pause.label.setStroke('#BBB', 2);
	ui.pause.label.setOrigin(0.5);
	ui.pause.label.setDepth(2010);
	ui.pause.label.visible = false;
}

function createUIStatusDisplay(game) {
	ui.status = {};

	ui.status.background = game.add.image(400, 520, 'ui-bottom-background');
	ui.status.background.setDepth(10);
	
	ui.status.limit = game.add.image(601, 474, 'ui-bottom-gauge-single-pink');
	ui.status.limit.setDepth(14);
	ui.status.limit.setOrigin(0);
	//TODO base on # of enemies
	ui.status.limit.incrementAmount = 1.0 / (videoDetails.questions.length - 1);
	ui.status.limit.setScale(0, 1);
	
	ui.status.time = game.add.image(700, 474, 'ui-bottom-gauge-single-green');
	ui.status.time.setDepth(14);
	ui.status.time.setOrigin(0);
	ui.status.time.fillTime = 1000;
	ui.status.time.elapsed = 0;
	ui.status.time.setScale(0, 1);
	ui.status.time.flowing = false;
	
	ui.status.timefilled = game.add.image(700, 474, 'ui-bottom-gauge-single-yellow');
	ui.status.timefilled.setDepth(15);
	ui.status.timefilled.setOrigin(0);
	ui.status.timefilled.setVisible(false);
	
	ui.status.foreground = game.add.image(400, 520, 'ui-bottom-foreground');
	ui.status.foreground.setDepth(20);
	
	ui.status.playername = game.add.text(15, 475, content["status-player-name"][lang], {fontSize: '24px', fill: '#FFF'});
	ui.status.playername.setStroke('#BBB', 2);
	ui.status.playername.setOrigin(0);
	ui.status.playername.setDepth(22);
	
	createUIStatusDisplayBehavior(game);
}

function createUIStatusDisplayBehavior(game) {
	ui.status.time.resume = function() {
		ui.status.time.flowing = true;
		
		if (!ui.status.timefilled.visible) {
			ui.status.time.tween = game.tweens.timeline({
				tweens: [
					{
						targets     : [ ui.status.time ],
						scaleX: 1,
						ease        : 'Linear',
						duration    : ui.status.time.fillTime - ui.status.time.elapsed,
						yoyo        : false,
						repeat      : 0,
						callbackScope   : ui.status.time,
						onComplete: function() {
							ui.status.time.setScale(0, 1);
							ui.status.time.elapsed = 0;
							ui.status.timefilled.show();
							
							if (ui.controlledobject == null) {
								ui.command.show();
								ui.controlledobject = ui.command;
							}
						}
					},
				]
			});
		}
	};
	
	ui.status.time.pause = function() {
		ui.status.time.flowing = false;
		if (ui.status.time.tween != null) {
			if (!ui.status.timefilled.visible) {
				ui.status.time.elapsed += ui.status.time.tween.elapsed;
				ui.status.time.tween.stop();
			}
		}
	};
	
	ui.status.timefilled.show = function() {
		ui.status.timefilled.setVisible(true);
		
		const flashduration = 1000;
		ui.status.timefilled.tween = game.tweens.timeline({
			tweens: [
				{
					targets: ui.status.timefilled,
					alpha: 1,
					onUpdate: function(state) {
						var elapsed = state.elapsed % flashduration;
						var done = (flashduration - elapsed) / flashduration;
						var color = done > 1.0 ? 1.0 : (done < 0.0 ? 0.0 : done);
						
						// Target RGB: 248, 235, 135
						ui.status.timefilled.setTint(Phaser.Display.Color.GetColor(255 - (7 * color), 255 - (20 * color), 255 - (120 * color)));
					},
					duration: flashduration,
					ease: 'Linear'
				},
				{
					targets: ui.status.timefilled,
					alpha: 1,
					onUpdate: function(state) {
						var elapsed = state.elapsed % flashduration;
						var done = (flashduration - elapsed) / flashduration;
						var color = done > 1.0 ? 1.0 : (done < 0.0 ? 0.0 : done);
						
						// Target RGB: 255, 255, 255
						ui.status.timefilled.setTint(Phaser.Display.Color.GetColor(248 + (7 * color), 235 + (20 * color), 135 + (120 * color)));
					},
					duration: flashduration,
					ease: 'Linear'
				},
			],
			loop: -1
		});
	};
	
	ui.status.timefilled.hide = function() {
		ui.status.timefilled.setVisible(false);
		if (ui.status.timefilled.tween) {
			ui.status.timefilled.tween.stop();
		}
	};
	
	ui.status.limit.enemydefeated = function() {
		game.tweens.timeline({
			tweens: [
				{
					targets     : [ ui.status.limit ],
					scaleX: '+' + ui.status.limit.incrementAmount,
					ease        : 'Linear',
					duration    : 300,
					yoyo        : false,
					repeat      : 0,
					callbackScope   : ui.status.limit,
					onComplete: function() {
						//floating point precision means cannot compare to 1.0
						if (ui.status.limit.scaleX >= 0.999) {
							console.log('TODO limit gauge full PLACEHOLDER');
						}
					}
				},
			]
		});
	}
}

function createCommandMenu(game) {
	ui.command = {};
	
	const optionsRaw = [
		content["command-options-answer"][lang], 
		//content["command-options-magic"][lang], 
		content["command-options-sense"][lang],  
		//content["command-options-item"][lang], 
	];
	
	ui.command.numOptions = optionsRaw.length;
	ui.command.current = 0;
	ui.command.selected = false;

	ui.command.background = game.add.image(275, 520, 'ui-command-menu');
	ui.command.background.setDepth(50);
	
	// Menu Options Text
	const commandFontSize = 24;
	ui.command.options = [];
	for (var i = 0; i < ui.command.numOptions; i++) {
		ui.command.options[i] = {};
		
		ui.command.options[i].text = game.add.text(230, 458 + (commandFontSize + 10) * i, optionsRaw[i], {fontSize: commandFontSize + 'px', fill: '#FFF'});
		ui.command.options[i].text.setStroke('#BBB', 2);
		ui.command.options[i].text.setOrigin(0);
		ui.command.options[i].text.setDepth(52);
		
		ui.command.options[i].hasSubMenu = optionsRaw[i] != content["command-options-sense"][lang];
		ui.command.options[i].freeEntrySubmenu = optionsRaw[i] == content["command-options-answer"][lang];
		ui.command.options[i].alliesSelectableDefault = false;
		ui.command.options[i].enemiesSelectableDefault = true;
		
		ui.command.sub = createCommandSubBehaviors(game, ui.command.options[i], optionsRaw[i]);
	}
	
	createCommandCursor(game, commandFontSize);
	createCommandBehaviors(game);
	
	ui.command.hide();
}

function createCommandCursor(game, commandFontSize) {
	// Command Cursor
	const cursorYOffset = commandFontSize / 2 - 3;
	ui.command.cursor = game.add.image(ui.command.options[ui.command.current].text.x, ui.command.options[ui.command.current].text.y + cursorYOffset, 'ui-cursor');
	ui.command.cursor.setScale(0.10);
	ui.command.cursor.setOrigin(1, 0.5);
	ui.command.cursor.setDepth(54);
	ui.command.cursor.selected = false;
	
	// Cursor Animations & Behaviors
	ui.command.cursor.anim_select = function() {
		ui.command.cursor.selected = true;
		if (ui.command.cursor.tween_select) {
			ui.command.cursor.tween_select.stop();
		}
		ui.command.cursor.tween_select = game.tweens.timeline({
			tweens: [
				{
					targets: ui.command.cursor,
					alpha: "-=1",
					duration: 0.5
				},
				{
					targets: ui.command.cursor,
					alpha: "+=1",
					duration: 0.5
				},
			],
			loop: -1
		});
		ui.command.options[ui.command.current].selectCallback();
	};
	
	ui.command.cursor.anim_deselect = function() {
		ui.command.cursor.selected = false;
		if (ui.command.cursor.tween_select) {
			ui.command.cursor.tween_select.stop();
		}
		ui.command.cursor.alpha = 1;
	};
	
	ui.command.cursor.advance = function(index) {
		ui.command.current = (index >= ui.command.numOptions) ? 0 : ((index < 0) ? ui.command.numOptions - 1 : index);
		ui.command.cursor.x = ui.command.options[ui.command.current].text.x;
		ui.command.cursor.y = ui.command.options[ui.command.current].text.y + cursorYOffset;
	};
	
	ui.command.cursor.next = function() {ui.command.cursor.advance(ui.command.current + 1);};
	ui.command.cursor.prev = function() {ui.command.cursor.advance(ui.command.current - 1);};
}

function createCommandSubBehaviors(game, curOption, parentMenuName) {
	if (content["command-options-answer"][lang] == parentMenuName) {
		curOption.selectCallback = function() {ui.sub.answer.show();};
	}
	else if (content["command-options-sense"][lang] == parentMenuName) {
		curOption.selectCallback = function() {console.log('TODO Sense Functionality Placeholder'); ui.command.cursor.anim_deselect();};
	}
}

function createCommandBehaviors(game) {
	// Standard Behaviors
	ui.command.confirm = function () {ui.command.cursor.anim_select();};
	ui.command.cancel = function () {ui.command.cursor.anim_deselect();};
	ui.command.next = function () {ui.command.cursor.next();};
	ui.command.previous = function () {ui.command.cursor.prev();};
	
	// Menu Behaviors
	ui.command.toggle = function (show) {
		ui.command.cancel();
		ui.command.cursor.advance(0);
		
		ui.command.background.setVisible(show);
		ui.command.cursor.setVisible(show);
		
		for (var i = 0; i < ui.command.numOptions; i++) {
			ui.command.options[i].text.setVisible(show);
		}
		
		if (ui.sub) {
			for (var i = 0; i < ui.sub.types.length; i++) {
				ui.sub.types[i].cancel();
			}
		}
	};
	ui.command.hide = function () {ui.command.toggle(false);};
	ui.command.show = function () {ui.command.toggle(true);};
}

function createAnswerSubCommandMenu(game) {
	if (!ui.sub) {
		ui.sub = {};
		ui.sub.types = [];
	}
	ui.sub.answer = {};
	ui.sub.types.push(ui.sub.answer);

	// Sub Menu Background
	ui.sub.answer.background = game.add.image(175, 530, 'ui-command-sub-menu');
	ui.sub.answer.background.setDepth(70);
	ui.sub.answer.background.setVisible(false);
	
	// Input Label
	const labelFontSize = 24;
	const labelY = 530 - (ui.sub.answer.background.height / 2) + (labelFontSize + 0);
	ui.sub.answer.label = game.add.text(175, labelY, content["sub-answer-recall-label"][lang], {fontSize: labelFontSize + 'px', fill: '#FFF'});
	ui.sub.answer.label.setStroke('#BBB', 2);
	ui.sub.answer.label.setOrigin(0.5);
	ui.sub.answer.label.setDepth(72);
	ui.sub.answer.label.setVisible(false);
	
	// Input Box
	ui.sub.answer.htmlcontainer = game.add.dom(175, labelY + labelFontSize + 100).createFromCache('ui-answerform');
	ui.sub.answer.htmlcontainer.setDepth(72);
	ui.sub.answer.htmlcontainer.setVisible(false);
	ui.sub.answer.input = ui.sub.answer.htmlcontainer.getChildByName('answerField');

	createAnswerSubMenuBehaviors(game);
}

function createAnswerSubMenuBehaviors(game) {
	// Custom Behaviors
	ui.sub.answer.showOrHide = function(show) {
		ui.sub.answer.background.setVisible(show);
		ui.sub.answer.label.setVisible(show);
		ui.sub.answer.htmlcontainer.setVisible(show);
		
		var value = ui.sub.answer.input.value;
		ui.sub.answer.input.value = '';
		
		if (!show) {
			ui.command.cursor.anim_deselect();
			window.setTimeout(function ()
			{
				ui.sub.answer.input.blur();
			}, 0);
			
			if (ui.command.background.visible)
			{
				ui.controlledobject = ui.command;
			}
			else
			{
				ui.controlledobject = null;
			}
		}
		else {
			window.setTimeout(function ()
			{
				ui.sub.answer.input.focus();
			}, 0);
			ui.controlledobject = ui.sub.answer;
		}
		
		return value;
	};
	ui.sub.answer.show = function() {ui.sub.answer.showOrHide(true);};
	
	// Standard Behaviors
	ui.sub.answer.confirm = function() {
		var providedAnswer = ui.sub.answer.showOrHide(false);
		
		battleEvents.push({evnt: player.anim_attack, params: [providedAnswer], playerAction: true});
		ui.command.hide();
	};
	ui.sub.answer.cancel = function() {ui.sub.answer.showOrHide(false);};
	ui.sub.answer.next = function () {};
	ui.sub.answer.previous = function () {};
}

function createPlayer(game) {
	var surfaceHeight = env.ground.foreground.getBounds().y - (env.ground.foreground.getBounds().height / 2)

	player = game.physics.add.sprite(600, surfaceHeight, 'player-idle');
	player.setScale(3);
	player.setDepth(100);
	player.flipX = true;
	player.setY(surfaceHeight - (player.height / 2) - 50);
	player.animating = false;

    //  Animations
    createPlayerAnimations(game);
	
	//  Physics
	player.setBounce(0.5);
	player.setDrag(1000, 0);
	player.body.setAllowDrag(false);
	game.physics.add.collider(player, env.ground);
	
	player.anims.play('player-idle', true);
}

function createPlayerAnimations(game) {
	// Tweens Definitions
	game.anims.create({
        key: 'player-idle',
        frames: game.anims.generateFrameNumbers('player-idle', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });
	game.anims.create({
        key: 'player-run',
        frames: game.anims.generateFrameNumbers('player-run', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });
	game.anims.create({
        key: 'player-attack',
        frames: game.anims.generateFrameNumbers('player-attack', { start: 0, end: 5 }),
        frameRate: 10
    });
	game.anims.create({
        key: 'player-land',
        frames: game.anims.generateFrameNumbers('player-land', { start: 0, end: 2 }),
        frameRate: 10
    });
	
	// Full Animations
	player.anim_attack = function(params) {
		if (!player.animating)
		{
			var playerAnswer = params[0];
			
			player.animating = true;
			ui.movename.show(playerAnswer);
			
			game.tweens.timeline({
				tweens: [
					{
						targets: player,
						alpha: "+=0",
						duration: 1,
						onComplete: function() {
							player.setVelocityX(-420);
							player.anims.play('player-run', true);
						}
					},
					{
						targets: player,
						alpha: "+=0",
						duration: 1000,
						onComplete: function() {
							player.setVelocityX(360);
							player.setVelocityY(-160);
							
							if (enemy.acceptableAnswers.indexOf(playerAnswer) != -1)
							{
								enemy.anim_get_hit_and_die();
							}
							else
							{
								enemy.anim_dodge();
							}
							
							player.anims.play('player-attack', true);
						}
					},
					{
						targets: player,
						alpha: "+=0",
						duration: 1000,
						onComplete: function() {
							player.body.setAllowDrag(true);
							player.anims.play('player-land', true);
						}
					},
					{
						targets: player,
						alpha: "+=0",
						duration: 400,
						onComplete: function() {
							ui.movename.hide();
							player.body.setAllowDrag(false);
							player.anims.play('player-idle', true);
							player.animating = false;
						}
					}
				]

			});
		}
	};
}

function createEnemies(game) {
	const fontSize = 32;
	const strokeSize = 8;
	const fontColor = '#FFF';
	const strokeBaseColor = '#1f039c';
	const wrapWidth = 500;
	const lineHeight = fontSize + strokeSize;

	text = '';

	enemy = game.add.text(300, 275, text, {fontSize: fontSize + 'px', fill: fontColor,  wordWrap: {width: wrapWidth, useAdvancedWrap: true}});
	enemy.setStroke(strokeBaseColor, strokeSize);
	numLines = enemy.getWrappedText(text).length;
	enemy.setOrigin(0.5);
	enemy.animating = false;
	enemy.index = -1;
	
	enemy.damage = game.add.text(enemy.x, enemy.y, 'Miss', {fontSize: '20px', fill: '#FFF'});
	enemy.damage.setStroke('#000', 8);
	enemy.damage.setOrigin(0.5);
	enemy.damage.setDepth(75);
	enemy.damage.setAlpha(0.0);
	
	var floatHeight = env.ground.foreground.getBounds().y - (env.ground.foreground.getBounds().height / 2) - 25;
	var textbottom = enemy.getBounds().y + (numLines - 1) * lineHeight;
	enemy.setY(enemy.getBounds().y  - (textbottom - floatHeight));
	
	enemy.baseX = enemy.x;
	enemy.baseY = enemy.y;
	
	// Animations
	createEnemyAnimations(game, fontColor, strokeBaseColor, strokeSize);
	
	// Make first enemy appear
	battleEvents.push({evnt: enemy.anim_appear, params: [], playerAction: false});
}

// Answers surrounded by asterisks should be obscured
function preprocessEnemyText(text) {
	const answerDelimiter = "\uFF0A";
	const blocker = "\u2592";
	
	var delimited = text.split(answerDelimiter);
	if (delimited.length != 3) {
		alert("Forgot to put ＊ around the answer properly in '" + text + "'. Fix it!");
	}
	
	var answerLength = delimited[1].length;
	delimited[1] = blocker.repeat(answerLength);
	
	return delimited.join("");
}

function determineAcceptableAnswers(curVideoContent) {
	var acceptableAnswers = [].concat(curVideoContent.answersKanji);
	acceptableAnswers = (mode >= content.MODE_KANA) ? acceptableAnswers.concat(curVideoContent.answersKana) : acceptableAnswers;
	acceptableAnswers = (mode >= content.MODE_ROMAJI) ? acceptableAnswers.concat(curVideoContent.answersRomaji) : acceptableAnswers;
	
	return acceptableAnswers;
}

function createEnemyAnimations(game, fontColor, strokeBaseColor, strokeSize) {
	// Animation-Specific Colors
	const fontColorKilled = '#ff0008';
	const strokeHitColor = '#990207';
	const col_font_alive = Phaser.Display.Color.HexStringToColor(fontColor);
	const col_font_killed = Phaser.Display.Color.HexStringToColor(fontColorKilled);
	const col_stroke_alive = Phaser.Display.Color.HexStringToColor(strokeBaseColor);
	const col_stroke_killed = Phaser.Display.Color.HexStringToColor(strokeHitColor);
	
	enemy.damage.anim_appear = function(amount) {
		if (amount) {
			enemy.damage.setText(amount);
		} else {
			enemy.damage.setText("Miss");
		}
		
		enemy.damage.setX(enemy.x);
		enemy.damage.setY(enemy.y);
		enemy.damage.setAlpha(1.0);
		
		game.tweens.timeline({
			tweens: [
				{
					targets: enemy.damage,
					y: enemy.damage.y - 50,
					alpha: 0,
					duration: 1200,
					ease: 'Linear'
				}
			]
		});
	}

	// Full Animations
	enemy.anim_appear = function() {
		if (!enemy.animating)
		{
			enemy.index++;
			
			if (enemy.index >= videoDetails.questions.length) {
				//TODO actual game over behavior
				gameOver = true;
				alert("Game Over!");
				return;
			}
			
			enemy.rawSentence = videoDetails.questions[enemy.index].sentence;
			enemy.plainSentence = enemy.rawSentence.replace(/\uFF0A/g, "");
			enemy.acceptableAnswers = determineAcceptableAnswers(videoDetails.questions[enemy.index]);
			
			enemy.animating = true;
			
			if (enemy.tween_idle) {
				enemy.tween_idle.stop();
			}
			
			enemy.setX(-7 * enemy.baseX);
			enemy.setY(enemy.baseY - 200);
			
			enemy.setText(preprocessEnemyText(enemy.rawSentence));
			enemy.setVisible(true);
			
			game.tweens.timeline({
				tweens: [
					{
						targets: enemy,
						x: enemy.baseX,
						y: enemy.baseY,
						duration: 1200,
						ease: 'Quint',
						onComplete: function() {
							enemy.animating = false;
							window.setTimeout(function ()
							{
								enemy.anim_idle();
							}, 0);
						}
					}
				]
			});
		}
	};
	
	enemy.anim_idle = function() {
		if (!enemy.animating)
		{
			enemy.tween_idle = game.tweens.timeline({
				tweens: [
					{
						targets: enemy,
						x: enemy.baseX + Math.random() * 20 - 10.0,
						y: enemy.baseY + Math.random() * 20 - 10.0,
						angle: 0 + Math.random() * 4 - 2.0,
						duration: 1500,
						ease: 'Linear',
						onComplete: function() {
							window.setTimeout(function ()
							{
								enemy.anim_idle();
							}, 0);
						}
					}
				]
			});
		}
	};
	
	enemy.anim_dodge = function() {
		if (!enemy.animating)
		{
			enemy.animating = true;
			
			if (enemy.tween_idle) {
				enemy.tween_idle.stop();
			}
			
			enemy.damage.anim_appear();
			
			game.tweens.timeline({
				tweens: [
					{
						targets: enemy,
						x: enemy.baseX - 50 - 50 * Math.random(),
						y: enemy.baseY - 50 - 50 * Math.random(),
						angle: -10 - 15 * Math.random(),
						duration: 800,
						ease: 'Elastic',
						easeParams: [ 1.5, 0.5 ]
					},
					{
						targets: enemy,
						x: enemy.baseX,
						y: enemy.baseY,
						angle: 0,
						duration: 800,
						delay: 1000,
						ease: 'Elastic',
						easeParams: [ 1.5, 0.5 ],
						onComplete: function() {
							enemy.animating = false;
							window.setTimeout(function ()
							{
								enemy.anim_idle();
							}, 0);
						}
					}
				]
			});
		}
	};
	
	enemy.anim_get_hit_and_die = function() {
		if (!enemy.animating)
		{
			const killDuration = 1000;
		
			enemy.animating = true;
			
			if (enemy.tween_idle) {
				enemy.tween_idle.stop();
			}
			
			var tiltX = 35 + 35 * Math.random();
			var tiltY = 15 + 15 * Math.random();
			
			game.tweens.timeline({
				tweens: [
					{
						targets: enemy,
						x: enemy.baseX - tiltX,
						y: enemy.baseY + tiltY,
						angle: 3 + 5 * Math.random(),
						duration: 800,
						delay: 200,
						ease: 'Elastic',
						easeParams: [ 1.5, 0.5 ],
						onStart: function() {
							enemy.setText(enemy.plainSentence);
							enemy.damage.anim_appear(Math.round(2000 + 2000 * Math.random()));
						}
					},
					{
						targets: enemy,
						alpha: 0,
						onUpdate: function(state) {
							var totalDuration = state.duration + 800 + 200;
							var curFillColor = Phaser.Display.Color.Interpolate.ColorWithColor(col_font_alive, col_font_killed, totalDuration, state.elapsed);
							var curStrokeColor = Phaser.Display.Color.Interpolate.ColorWithColor(col_stroke_alive, col_stroke_killed, totalDuration, state.elapsed);
							var curFillColorHex = Phaser.Display.Color.RGBToString(curFillColor.r, curFillColor.g, curFillColor.b, curFillColor.a).substring(0, 7);
							var curStrokeColorHex = Phaser.Display.Color.RGBToString(curStrokeColor.r, curStrokeColor.g, curStrokeColor.b, curStrokeColor.a).substring(0, 7);
							
							enemy.setColor(curFillColorHex);
							enemy.setStroke(curStrokeColorHex, strokeSize);
						},
						duration: killDuration,
						delay: 200,
						ease: 'Linear',
						onStart: function() {
							ui.status.limit.enemydefeated();
						}
					},
					{
						targets: enemy,
						x: '+=' + tiltX - 800,
						y: '-=' + tiltY,
						angle: 0,
						alpha: 1,
						duration: 1,
						delay: 800,
						ease: 'Linear',
						onComplete: function() {
							enemy.setColor(fontColor); 
							enemy.setStroke(strokeBaseColor, strokeSize); 
							enemy.animating = false;
							enemy.anim_appear();
						}
					}
				]
			});
		}
	};
}

function createControls(game) {
	controls = {};
	
	// Keys to listen to
	controls.UP = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
	controls.DOWN = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
	controls.LEFT = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
	controls.RIGHT = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
	
	controls.ENTER = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
	controls.ESCAPE = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
}

// Descriptive naming! Thanks, Phaser!
function getScene() {
	return game.scene.scenes[0].scene;
}

function pauseGame() {
	ui.pause.background.visible = true;
	ui.pause.label.visible = true;
	
	var scene = getScene();
	if (!scene.isPaused()) {
		scene.pause();
	}
}

function resumeGame() {
	ui.pause.background.visible = false;
	ui.pause.label.visible = false;
	
	var scene = getScene();
	if (scene.isPaused()) {
		scene.resume();
	}
}