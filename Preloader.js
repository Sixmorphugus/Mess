// options, changable in both main and ingame menus
BasicGame.version = "1.0";

BasicGame.playMusic = true;
BasicGame.playSFX = true;
BasicGame.musicVol = 1;
BasicGame.sfxVol = 1;

BasicGame.parallaxEnabled = true;
BasicGame.dialogSpeed = 1;

BasicGame.uiTheme = 1;

BasicGame.toLoad = -1;

// BATTLE STUFF
BasicGame.currentBattleFriendlies = [];
BasicGame.currentBattleAttackers = [];
BasicGame.currentBattleMusic = "";
BasicGame.currentBattleColor = "0x000000";
BasicGame.currentBattleBackground = "";
BasicGame.currentBattleStartDelay = 0;

// DEBUG STUFF
BasicGame.debugAllowed = false;

BasicGame.mlg = false; // always do max damage in battle
BasicGame.displayColliders = false; // display world collision overlay

// standalone version - note that these do not save between start ups currently
BasicGame.standalone = false; // enables extra options menu

BasicGame.winSize = 0; // window size
BasicGame.fs = false; // full screen

BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
	this.preloadBarBack = null;
    this.preloadText = null;

	this.newGame = false;

};

BasicGame.Preloader.prototype = {
	preload: function () {
		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2) - 100, 'preloaderBackground');
		this.preloadBarBack = this.add.sprite(Math.floor(window.innerWidth / 2) - 512, Math.floor(window.innerHeight / 2) + 88, 'preloaderBarBack');
		this.preloadBar = this.add.sprite(Math.floor(window.innerWidth / 2) - 512, Math.floor(window.innerHeight / 2) + 88, 'preloaderBar');
        this.preloadText = this.add.bitmapText(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), 'goldfishWhite', "", 18);
        
        this.loadSettings();
        
        this.changePreloadText("Initializing...");
        
		this.background.anchor.set(0.5, 0.5);
		this.preloadBar.anchor.set(0, 0.5);
		this.preloadBarBack.anchor.set(0, 0.5);

        this.background.alpha = 0;
        
		// set BG
		this.stage.setBackgroundColor('#000000');

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);
        this.load.onFileStart.add(this.loadCheck, this);

		console.log("[MESS] Loading assets.");
		//	Here we load the rest of the assets our game needs.
        
        this.load.image('controls', 'images/controls.png');
        this.load.image('ch1Seq', 'images/splash1.png');
        
        this.load.image('turnInd', 'images/battle/battlei.png');
        this.load.image('turnIndE', 'images/battle/battlei2.png');
        
        // ui themes
        this.load.image('ui1', 'images/bg/uiBlack.png');
        this.load.image('ui2', 'images/bg/uiRed.png');
        this.load.image('ui3', 'images/bg/uiGreen.png');
        this.load.image('ui4', 'images/bg/uiBlue.png');
        this.load.image('ui5', 'images/bg/uiYellow.png');
        this.load.image('ui6', 'images/bg/uiCyan.png');
        this.load.image('ui7', 'images/bg/uiPurp.png');
        
		// game stuff
		this.load.image('whiteout', 'images/bg/white.png');
		this.load.image('blackout', 'images/bg/black.png');
		this.load.image('battleGrey', 'images/battle/bggrey.png');
		this.load.image('battleGreen', 'images/battle/bggreen.png');
        
        this.load.image('battleTimeline', 'images/battleTimeline.png');
        this.load.image('whiteShapes1', 'images/battle/whiteShapes2.png'); // DON'T QUESTION IT
        this.load.image('whiteShapes2', 'images/battle/whiteShapes.png');
        
        this.load.image('darkMask', 'images/bg/dark.png');

		this.load.image('battleMop', 'images/battle/mop.png');
        this.load.image('battleSpray', 'images/battle/spray.png');

		this.load.image('greenMountain', 'images/bg/greenmountain.png');
        this.load.image('greenMountainLow', 'images/bg/greenmountainlow.png');

		this.load.spritesheet('WorldTiles', 'images/WorldTiles.png', 32, 32);
        
        this.load.spritesheet('playerPre', 'images/playerPre.png', 32, 48);
        this.load.spritesheet('playerPre2', 'images/playerPre2.png', 32, 48);
        this.load.spritesheet('playerMain', 'images/playerMain.png', 32, 48);
        
        this.load.spritesheet('farmDude', 'images/farmerDude.png', 32, 48);
        this.load.spritesheet('genDude', 'images/genDude.png', 32, 48);
        this.load.spritesheet('chaff', 'images/Chaff.png', 32, 48);
        this.load.spritesheet('jeff', 'images/jeff.png', 32, 48);
        this.load.spritesheet('wolf', 'images/Wolf.png', 32, 16);
        this.load.spritesheet('chawley', 'images/chawley.png', 1060, 748);
        
        this.load.image('playerBed', 'images/playerBed.png');
        this.load.image('playerBed2', 'images/playerBed2.png');
        this.load.image('playerBed3', 'images/playerBed3.png');

		this.load.spritesheet('speachCont', 'images/dialogScroll.png', 16, 16);
        this.load.spritesheet('speachSel', 'images/dialogSelect.png', 16, 16);
		this.load.image('speachBox', 'images/speachBox.png');
        
        this.load.image('canInteract', 'images/canInteract.png');
        this.load.image('canMove', 'images/canMove.png');
        this.load.image('canJump', 'images/canJump.png');
        
        this.load.image('martinCrouch', 'images/martinCrouch.png');
        this.load.image('martinUnsteady', 'images/martinUnsteady.png');
        this.load.image('martinGetHat', 'images/martinGetHat.png');
        this.load.image('martinGetHat2', 'images/martinGetHat2.png');
        this.load.image('martinShrug', 'images/martinShrug.png');
        this.load.image('martinYell', 'images/martinYell.png');
        
        this.load.spritesheet('moyleHandsUp', 'images/moyleHandsUp.png', 32, 48);
        this.load.spritesheet('moyleArmsFolded', 'images/moyleArmsFolded.png', 32, 48);
        
        this.load.image('jeffLook', 'images/jeffLook.png');
        
        this.load.image('windmill', 'images/windmillLarge.png');
        
        // battle actors
        this.load.spritesheet('battleA_martinMop', 'images/battle/mop.png', 240, 200);
        this.load.spritesheet('battleA_wolf', 'images/battle/wolf.png', 300, 200);
        this.load.spritesheet('battleA_cwolf', 'images/battle/cwolf.png', 300, 200);
        this.load.spritesheet('ghost', 'images/battle/ghoul.png', 200, 200);
        this.load.spritesheet('fatghost', 'images/battle/fatghoul.png', 300, 300);
        this.load.spritesheet('wizard', 'images/wizard.png', 69, 96);
        
		// game maps
		this.load.tilemap('intro1', 'maps/intro/office1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('intro2', 'maps/intro/office2.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('intro3', 'maps/intro/office3.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('town1','maps/grasslands/5town1.json',null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('town2','maps/grasslands/5town2.json',null, Phaser.Tilemap.TILED_JSON);
        
        // Jacks Maps - mostly made by Jack but not quite all of them
        this.load.tilemap('MoylesMill', 'maps/jack/moylesMill.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('WindMills', 'maps/jack/windmills.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('WindMillsBlocked', 'maps/jack/windmillsWithCrates.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('EmptyMill', 'maps/jack/emptyMill.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('cliffside3', 'maps/jack/cliffSide.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('cliffside1', 'maps/jack/cliffside3.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('cliffside2', 'maps/jack/cliffside2.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('cliffcave', 'maps/jack/cliffCave.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('creek', 'maps/jack/shitsCreek.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('ABMill', 'maps/jack/abandonedMill.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('Mine1', 'maps/jack/oldMines1.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('Mine2', 'maps/jack/oldMines2.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('Mine3', 'maps/jack/oldMines3.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('HUB', 'maps/jack/hub.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('HUB2', 'maps/jack/hubTownOnly.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('filler1', 'maps/jack/filler1.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('filler2', 'maps/jack/filler2.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('filler3', 'maps/jack/filler3.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('caveToTown', 'maps/jack/caveToTown.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('interior1', 'maps/jack/interior1.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('interior2', 'maps/jack/interior2.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('interior3', 'maps/jack/interior3.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('interior4', 'maps/jack/interior4.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('interior5', 'maps/jack/interior5.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('interior6', 'maps/jack/interior6.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('forest1', 'maps/jack/forest2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('forest2', 'maps/jack/forest1.json', null, Phaser.Tilemap.TILED_JSON);
		
		this.load.tilemap('nm1', 'maps/grasslands/4mines1.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('nm2', 'maps/grasslands/4mines2.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('nm3', 'maps/grasslands/4mines3.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('nm4', 'maps/grasslands/4mines4.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('nm5', 'maps/grasslands/4mines5.json',null,Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('nm6', 'maps/grasslands/4mines6.json',null,Phaser.Tilemap.TILED_JSON);
        
        this.load.tilemap('tower1', 'maps/chris/towerInterior.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('tower2', 'maps/chris/towerInterior2.json',null,Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('towerO', 'maps/chris/towerExterior.json',null,Phaser.Tilemap.TILED_JSON);

		// load SFX        
        this.load.audio('speach', 'sfx/talk1.wav');
        this.load.audio('select', 'sfx/select.ogg');
        
        this.load.audio('quake', 'sfx/quake.wav', 100, true);
        
        this.load.audio('spaceWhale', 'sfx/spacewhale.ogg');
        
        this.load.audio('climb','sfx/climb.wav');
        
		this.load.audio('playerJump','sfx/jump.wav');
		this.load.audio('playerLand', 'sfx/land.wav', 25);
		this.load.audio('playerStep', 'sfx/step.wav', 100, true);

        this.load.audio('enterBattle', 'sfx/enterBattle.wav');
        
        this.load.audio('hit1', "sfx/Hit1.wav");
        this.load.audio('hit2', "sfx/Hit2.wav");
        this.load.audio('hit3', "sfx/Hit3.wav");
        
        this.load.audio('death', "sfx/death.ogg");

		// load music
        this.load.audio('notreal', 'sfx/notreal.ogg');
        this.load.audio('sevenlights', 'sfx/sevenlights.ogg');
        this.load.audio('lumberjack', 'sfx/lumberjack.ogg');
        this.load.audio('chosenone', 'sfx/chosenone.ogg');
        this.load.audio('baseline', 'sfx/baseline.ogg');
        this.load.audio('wayfarer', 'sfx/wayfarer.ogg');
        this.load.audio('tribal', 'sfx/tribal.ogg');
        this.load.audio('messYourIn', 'sfx/messYourIn.ogg');
        this.load.audio('sblues', 'sfx/sBlues.ogg');
        this.load.audio('fishBarrel', 'sfx/fishBarrel.ogg');
        this.load.audio('wildn_calm', 'sfx/wildn_calm.ogg');
        
        this.load.audio('blood', 'sfx/blood.ogg');
        this.load.audio('hwoods', 'sfx/hwoods.ogg');
        this.load.audio('bloodsplatter', 'sfx/bs.ogg');
        this.load.audio('standup', 'sfx/standup.ogg');
        this.load.audio('wildn_bat', 'sfx/wildn_bat.ogg');
        
	},
    
	create: function () {
        // temp
        //this.game.state.start('Game');
        //return;
        
        this.test = this.add.sprite(0, 0, "whiteout");
        
        if(BasicGame.debugAllowed) {
            this.changePreloadText("DEBUG MODE IS ON");
        } else {
            this.changePreloadText("Version " + BasicGame.version + " /  Use your Up/Down and Enter keys to select");
        }
        
        this.preloadText.position.y = this.game.canvas.height - 30;
        
        this.preloadBar.destroy();
        this.preloadBarBack.destroy();
        
        this.ui = new uiObject(this.game);
        
        if(window.forceArea == null) {
            this.menuReset();
        } else {
            this.game.state.start('Game');
            return;
        }
        
        this.music = this.add.audio('sevenlights', 0.5, true);
        
        if(BasicGame.playMusic) {
            this.music.play('', 0, BasicGame.musicVol);
        }
        
	},
    
    update: function () {
        this.ui.update();
        
        // resize code
        this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
        
        if(BasicGame.debugAllowed) {
            this.changePreloadText("DEBUG MODE IS ON");
        } else {
            this.changePreloadText("Version " + BasicGame.version + " /  Use your Up/Down and Enter keys to select");
        }
        
        this.preloadText.position.y = this.game.canvas.height - 30;
        
        this.background.position.set(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2) - 100);
        
        if(this.background.alpha < 0.9 && !this.newGame) {
            this.background.alpha += 0.1;
        }
        
        if(this.newGame) {
            if(this.background.alpha > 0.1) {
                this.background.alpha -= 0.01;
                this.preloadText.alpha -= 0.01;
            } else {
                this.music.stop();
                this.game.state.start('Game');
            }
        }
        
        if(this.game.input.keyboard.downDuration(Phaser.Keyboard.SEVEN, 1)) {
            BasicGame.debugAllowed = !BasicGame.debugAllowed;
            
            if(BasicGame.debugAllowed) {
                this.changePreloadText("DEBUG MODE IS ON");
            } else {
                this.changePreloadText("Version " + BasicGame.version + " /  Use your Up/Down and Enter keys to select");
            }
        }
    },

    changePreloadText: function (str) {
        this.preloadText.text = str;
        this.preloadText.updateTransform();
        this.preloadText.position.x = Math.floor(this.game.canvas.width / 2) - Math.floor(this.preloadText.textWidth / 2);
    },
    
    loadCheck: function (id, name) {
        this.changePreloadText("Downloading Things (" + id + "% done)...\n\nNOTE: Mess is very large (50MB). If this is your first time playing, be prepared to\nwait a while for your browser to download the assets.");
    },
    
    menuSelect: function(option) {
        if(option == 0) {
            var lastSave = window.localStorage["mess_save_last"];
            
            this.loadGame(lastSave);
        }
        else if(option == 2) {
            //if(BasicGame.debugAllowed) {
                this.newGame = true;
                this.music.fadeOut(1000);
            //} else {
            //    this.ui.newMessageBox(this.game.canvas.width / 2, this.background.position.y + 180, "The game is currently in-dev. Please press the secret button and try again.", 0, this.menuReset, this);
            //}
            
        }
        else if(option == 3) {
            this.showLoadMenu();
        }
        else if(option == 5) {
            this.showOptionsMenu();
        }
        else if(option == 6) {
            this.ui.sequenceMessageBox(this.game.canvas.width / 2, this.background.position.y + 180, ["MESS was created by Chris Sixsmith, Jack Naylor and Oliver Bellingham.", "All areas in this version of the game were compiled and designed by Jack Naylor and Chris Sixsmith.", "The game features prodigously exuberating art that will thrill, created by the all-seeing master ........ Oliver Bellingham. Also, by Chris Sixsmith and Jack Naylor.", "The soundtrack of MESS was composed by Chris Sixsmith.", "MESS uses the Phaser HTML5 engine and is written entirely in Javascript!"], this.menuReset, this);
        }
        else {
            this.ui.newMessageBox(this.game.canvas.width / 2, this.background.position.y + 180, "lolwut error (You selected option " + option + ")", 0, this.menuReset, this);
        }
    },
    
    setWinSize: function(option) {
        BasicGame.winSize = option;
        this.winSizeUpdate();
        
        this.showStandaloneMenu(1, false);
    },
    
    winSizeUpdate: function() {
        if(BasicGame.winSize == 0) {
            window.resizeTo(1080, 680);
        }
        if(BasicGame.winSize == 1) {
            window.resizeTo(1280, 720);
        }
        if(BasicGame.winSize == 2) {
            window.resizeTo(1368, 840);
        }
        if(BasicGame.winSize == 3) {
            window.resizeTo(1680, 1080);
        }
    },
    
    optionsSelect: function(option) {
        if(option == 0) {
            this.showSpecialMenu();
        }
        else if(option == 1) {
            this.showAudMenu();
        }
        else if(option == 2) {
            this.showStandaloneMenu(0, false);
        }
        else if(option == 3) {
            this.showControls();
        }
        else if(option == 5) {
            this.saveSettings();
            this.menuReset(5);
        }
        else {
            this.ui.newMessageBox(this.game.canvas.width / 2, this.background.position.y + 180, "lolwut error (You selected option " + option + ")", 0, this.menuReset, this);
        }
    },
    
    audMenuSelect: function(option) {
        if(option == 0) {
            BasicGame.playMusic = !BasicGame.playMusic;
            
            if(BasicGame.playMusic) {
                this.music.play('', 0, BasicGame.musicVol);
            } else {
                this.music.stop();
            }
        }
        else if(option == 1) {
            BasicGame.playSFX = !BasicGame.playSFX;
        }
        else if(option == 2) {
            this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], this.musicVolSelect, this, (BasicGame.musicVol * 10) - 1);
            return;
        }
        else if(option == 3) {
            this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], this.sfxVolSelect, this, (BasicGame.sfxVol * 10) - 1);
            return;
        }
        else if(option == 5) {
            this.showOptionsMenu(1);
            return;
        }
        
        this.showAudMenu(option, true);
    },
    
    specialSelect: function(option) {
        if(option == 0) {
            BasicGame.parallaxEnabled = !BasicGame.parallaxEnabled;
        }
        else if(option == 1) {
            this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, ["1", "2", "3", "4", "5", "6"], [1, 1, 1, 1, 1, 1], this.dsSelect, this, BasicGame.dialogSpeed - 1);
            return;
        }
        else if(option == 3) {
            this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, ["Black", "Red", "Green", "Blue", "Yellow", "Cyan", "Purple"], [1, 1, 1, 1, 1, 1], this.uiThmSelect, this, BasicGame.uiTheme - 1);
            return;
        }
        else if(option == 5) {
            this.showOptionsMenu(0);
            return;
        }
        
        this.showSpecialMenu(option, true);
    },
    
    musicVolSelect: function(opSelected) {
        sel = 10 + (opSelected * 10);
        
        BasicGame.musicVol = sel / 100;
        this.music.play('', 0, BasicGame.musicVol);
        this.showAudMenu(2);
    },
    
    dsSelect: function(opSelected) {
        BasicGame.dialogSpeed = opSelected + 1;
        this.showSpecialMenu(1);
    },
    
    uiThmSelect: function(opSelected) {
        BasicGame.uiTheme = opSelected + 1;
        this.showSpecialMenu(3);
    },
    
    sfxVolSelect: function(opSelected) {
        sel = 10 + (opSelected * 10);
        
        BasicGame.sfxVol = sel / 100;
        this.showAudMenu(3);
    },
    
    standaloneSelect: function(opSelected) {
        if(opSelected == 0) {
            this.showStandaloneMenu(0, true)
        }
        if(opSelected == 1) {
            this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, ["1080x680", "1280x720", "1368x840", "1680x1080"], [1, 1, 1, 1], this.setWinSize, this, BasicGame.winSize);
        }
        if(opSelected == 3) {
            this.showOptionsMenu(2);
        }
    },
    
    menuReset: function(opSelected) {
        var game0 = window.localStorage["mess_save_slot0"] != null;
        var game1 = window.localStorage["mess_save_slot1"] != null;
        var game2 = window.localStorage["mess_save_slot2"] != null;
        
        var canLoad = (game0 || game1 || game2);
        
        this.ui.newOptionsBox(window.innerWidth / 2, (window.innerHeight / 2) + 300, ["Continue", "---", "Start New Game", "Load Saved Game", "---", "Settings", "Credits", "??? "], [canLoad, -1, 1, canLoad, -1, 1, 1, 0], this.menuSelect, this, opSelected);
    },
    
    showControls: function() {
        this.controls = this.add.sprite(this.game.canvas.width / 2, this.background.position.y + 280, "controls");
        this.controls.anchor.set(0.5, 1);
        
        this.ui.newMessageBox(this.game.canvas.width / 2, this.background.position.y + 380, "...", 0, this.closeControls, this);
    },
    
    closeControls: function() {
        this.controls.destroy();
        this.showOptionsMenu(3);
    },
    
    showLoadMenu: function(menuPos) {
        var game0 = window.localStorage["mess_save_slot0"] != null;
        var game1 = window.localStorage["mess_save_slot1"] != null;
        var game2 = window.localStorage["mess_save_slot2"] != null;
        
        this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, [" Slot 1", " Slot 2", " Slot 3", "---", "Back"], [game0, game1, game2, -1, 1], this.loadGame, this, menuPos);
    },
    
    showOptionsMenu: function(menuPos) {
        this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, ["Game ", "Audio", " Standalone", " Controls", "---", "Back"], [1, 1, BasicGame.standalone, 1, -1, 1], this.optionsSelect, this, menuPos);
    },
    
    showStandaloneMenu: function(menuPos, skipFade) {
        var fs = " Fullscreen OFF";
        
        if(BasicGame.fs) {
            fs = " Fullscreen ON";
        }
        
        var box = this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, [fs, "  Window Size...", "---", "Back"], [0, !BasicGame.fs, -1, 1], this.standaloneSelect, this, menuPos);
        
        if(skipFade) {
            box.skipFade();
        }
    },
    
    showSpecialMenu: function(menuPos, skipFade) {
        var parallaxMode = "   Parallax OFF";
        if(BasicGame.parallaxEnabled) {
            parallaxMode = "  Parallax ON";
        }
        
        var dialogSpeed = "   Dialog Speed: " + BasicGame.dialogSpeed;
        
        var box = this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, [parallaxMode, dialogSpeed, "---", "   Change UI Color...", "---", "Back"], [1, 1, -1, 1, -1, 1], this.specialSelect, this, menuPos);
        
        if(skipFade) {
            box.skipFade();
        }
    },
    
    showAudMenu: function(menuPos, skipFade) {
        var musicOp = "  Play Music OFF";
        var allowMusicVol = false;
        if(BasicGame.playMusic) {
            musicOp = "  Play Music ON";
            var allowMusicVol = true;
        }
        
        var sfxOp = " Play SFX OFF";
        var allowSfxVol = false;
        if(BasicGame.playSFX) {
            sfxOp = " Play SFX ON";
            var allowSfxVol = true;
        }

        var musicVol = "  Music Volume: " + BasicGame.musicVol * 100;
        var sfxVol = "  SFX Volume: " + BasicGame.sfxVol * 100; 

        var box = this.ui.newOptionsBox(this.game.canvas.width / 2, this.background.position.y + 380, [musicOp, sfxOp, musicVol, sfxVol, "---", "Back"], [1, 1, allowMusicVol, allowSfxVol, -1, 1], this.audMenuSelect, this, menuPos);
        
        if(skipFade) {
            box.skipFade();
        }
    },
    
    saveSettings: function() {
        console.log("[MESS] Saved new settings.");
        
        window.localStorage["mess_playMusic"] = BasicGame.playMusic;
        window.localStorage["mess_playSFX"] = BasicGame.playSFX;
        window.localStorage["mess_musicVol"] = BasicGame.musicVol;
        window.localStorage["mess_sfxVol"] = BasicGame.sfxVol;

        window.localStorage["mess_parallaxEnabled"] = BasicGame.parallaxEnabled;
        window.localStorage["mess_dialogSpeed"] = BasicGame.dialogSpeed;
        window.localStorage["mess_uiTheme"] = BasicGame.uiTheme;
        
        window.localStorage["mess_canLoad"] = true;
        
        if(BasicGame.standalone) {
            window.localStorage["mess_canLoadWin"] = true;
            window.localStorage["mess_screenSize"] = BasicGame.winSize;
        }
    },
    
    loadSettings: function() {
        if(window.localStorage["mess_canLoad"] != null) {
            BasicGame.playMusic = (window.localStorage["mess_playMusic"] == "true");
            BasicGame.playSFX = (window.localStorage["mess_playSFX"] == "true");
            BasicGame.musicVol = window.localStorage["mess_musicVol"];
            BasicGame.sfxVol = window.localStorage["mess_sfxVol"];

            BasicGame.parallaxEnabled = (window.localStorage["mess_parallaxEnabled"] == "true");
            BasicGame.dialogSpeed = window.localStorage["mess_dialogSpeed"];
            BasicGame.uiTheme = window.localStorage["mess_uiTheme"];
            
            console.log("[MESS] Loaded old settings.");
        }
        
        if(window.localStorage["mess_canLoadWin"] != null) {
            BasicGame.winSize = window.localStorage["mess_screenSize"];
            this.winSizeUpdate();
        }
        
        if(BasicGame.uiTheme == undefined) {
            BasicGame.uiTheme = 1;
        }
        
        if(BasicGame.standalone) {
            this.winSizeUpdate();
        }
    },
    
    loadGame: function(slot) {
        if(slot == 4) {
            this.menuReset(3);
            return;
        }
        
        window.localStorage["mess_save_last"] = slot;
        
        this.music.stop();
        
        console.log("[MESS] Loading from slot " + slot);
        
        BasicGame.toLoad = slot;
        this.game.state.start("Game", true, false);
    }

};
