// GAME MANAGER
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game
    this.add;       //  used to add sprites, text, groups, etc
    this.camera;    //  a reference to the game camera
    this.cache;     //  the game cache
    this.input;     //  the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;      //  for preloading assets
    this.math;      //  lots of useful common math operations
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc
    this.stage;     //  the game stage
    this.time;      //  the clock
    this.tweens;    //  the tween manager
    this.state;     //  the state manager
    this.world;     //  the game world
    this.particles; //  the particle manager
    this.physics;   //  the physics manager
    this.rnd;       //  the repeatable random number generator

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    BasicGame.currentBattleFriendlies = [];
    BasicGame.currentBattleFriendlies.push(new BattleActor(this.game, "Martin", "battleA_martinMop", 3, 150, 0, 0x9797D8));
    
    // Additions:
    this.tWorld = null;
    this.speachObject = null;
    this.objects = [];
    
    this.thePlayer = null;

    this.fadeMode = 0; // 0 = fade in, 1 = fade out
    this.screenFadeSurface = null;
    this.darkMask = null;
    this.darkMaskArms = [];
    
    this.tempSnd = null;
    
    this.respawn_area = null;
    this.respawn_x = 0;
    this.respawn_y = 0;
    this.respawnProgress = 0;
    this.respawn_player = "playerPre";
    this.respawn_inventory = [];
    this.respawn_inventoryD = [];
    this.respawn_inventoryA = [];
    this.respawn_quests = [];
    this.respawn_questsD = [];
    this.respawn_questsA = [];
    this.respawn_group = JSON.parse(JSON.stringify(BasicGame.currentBattleFriendlies));
    this.respawn_jump = 0;
    
    this.cutsceneActionQueue = [];
    
    this.canvas = null;
    this.zoomTexture = null;
    this.zoomRTexture = null;
    
    this.doObjectUpdates = true;
    
    this.curAreaName = "";
    
    this.startingBattle = false;
    this.waitingForBattle = false;
    
    this.menusAllowed = true;
    
    //this.lighting = null; // our lighting object except it didn't ####ing work did it
    
    this.battleObject = null;
    this.bobby = null;
    
    // inbuilt sequences
    this.doChapterOneSeq = 0; // ugh
    
    // chapterOneSeq
    this.chapterOneSprite = null;
    
    this.usingOnChar = -1;
    this.inventoryItemsList = [];//["Test item"];
    this.inventorySelectableList = [];//[true];
    this.inventoryDescriptionsList = [];//["A test item."];
    
    this.questsList = [];//["Test quest"];
    this.questsSelectableList = [];//[true];
    this.questsDescriptionsList = [];//["Suck a lemon."];
    
    this.progress = 0; // quests completed
    
    this.correctX = 0;
    this.correctY = 0;
};

BasicGame.savedPlayerType = "playerMain";

BasicGame.Game.prototype = {
    init: function(resuming, respawning) {
        // main stuff
        this.canvas = this.game.canvas;
        
        this.chapterOneSprite = this.add.sprite(0, 0, 'ch1Seq');
        
        this.chapterOneSprite.anchor.set(0.5, 0.5);
        this.chapterOneSprite.alpha = 0;
        
        // setup world
        this.tWorld = new MessWorld(this.game, null);
        
        this.screenFadeSurface = this.add.sprite(0, 0, 'blackout');
        this.screenFadeSurface.width = this.canvas.width;
        this.screenFadeSurface.height = this.canvas.height;
        this.screenFadeSurface.fixedToCamera = true;
        //this.screenFadeSurface.tint = 0x000000;
        
        this.darkMask = this.add.sprite(0, 0, 'darkMask');
        this.darkMask.anchor.set(0.5, 0.5);
        
        this.darkMaskArms = [];
        
        this.darkMaskArms.push(this.add.sprite(0, 0, 'blackout'));
        this.darkMaskArms.push(this.add.sprite(0, 0, 'blackout'));
        this.darkMaskArms.push(this.add.sprite(0, 0, 'blackout'));
        this.darkMaskArms.push(this.add.sprite(0, 0, 'blackout'));
        
        this.respawned = true;
        
        // ui obj
        this.ui = new uiObject(this.game);
        
        if(this.thePlayer != null) {
            this.thePlayer.destroy();
            this.thePlayer = null;
        }
        
        if(BasicGame.toLoad != -1) {
            var slot = BasicGame.toLoad;
            BasicGame.toLoad = -1;
            
            // load game with this id
            this.respawn_area = window.localStorage["mess_save_slot" + slot + "_area"];
            this.respawn_x = parseInt(window.localStorage["mess_save_slot" + slot + "_x"]);
            this.respawn_y = parseInt(window.localStorage["mess_save_slot" + slot + "_y"]);
            this.respawnProgress = parseInt(window.localStorage["mess_save_slot" + slot + "_progress"]);
            this.respawn_player = window.localStorage["mess_save_slot" + slot + "_player"];
            this.respawn_jump = parseInt(window.localStorage["mess_save_slot" + slot + "_jump"]);
            this.respawn_inventory = JSON.parse(window.localStorage["mess_save_slot" + slot + "_inventory"]);
            this.respawn_inventoryD = JSON.parse(window.localStorage["mess_save_slot" + slot + "_inventoryD"]);
            this.respawn_inventoryA = JSON.parse(window.localStorage["mess_save_slot" + slot + "_inventoryA"]);
            this.respawn_quests = JSON.parse(window.localStorage["mess_save_slot" + slot + "_quests"]);
            this.respawn_questsD = JSON.parse(window.localStorage["mess_save_slot" + slot + "_questsD"]);
            this.respawn_questsA = JSON.parse(window.localStorage["mess_save_slot" + slot + "_questsA"]);
            this.respawn_group = JSON.parse(window.localStorage["mess_save_slot" + slot + "_group"]);
            
            BasicGame.savedPlayerType = this.respawn_player;
            
            var plyr = new Actor(this.game, 0, 0, "playerPre", 'plyr');
            
            plyr.enabled = true;
            plyr.controllable = true;
            plyr.body.collideWorldBounds = true;
            
            this.camera.follow(plyr, Phaser.Camera.LOCK_ON);
            this.thePlayer = plyr;
            
            this.allow_respawn = true;
            return;
        }
        
        if(resuming != null) {
            if(respawning != null) {
                this.respawn();
            } else {
                this.resumeGame();
            }
        } else {
            if(window.forceArea != null && resuming == null) {
                var plyr = new Actor(this.game, 0, 0, "playerPre", 'plyr');

                plyr.enabled = true;
                plyr.controllable = true;
                plyr.body.collideWorldBounds = true;

                this.camera.follow(plyr, Phaser.Camera.LOCK_ON);
                this.thePlayer = plyr;

                this.respawn_area = window.forceArea;
                this.respawnProgress = 1000;
                this.respawn_jump = 2;

                if(window.forceSpawnX != null && window.forceSpawnY != null) {
                    this.respawn_x = window.forceSpawnX;
                    this.respawn_y = window.forceSpawnY;
                } else {
                    this.respawn_x = 0;
                    this.respawn_y = 0;
                }

                if(window.forceProgress != null)
                    this.respawnProgress = window.forceProgress;

                this.respawn_player = "playerMain";
                this.allow_respawn = true;

                return;
            }
            
            // setup player
            var plyr = new Actor(this.game, 10000, 10000, 'playerPre', 'plyr');
            
            plyr.jumpLevel = 0;

            plyr.isPersistent = true;
            plyr.controllable = true;
            plyr.body.collideWorldBounds = true;
            
            this.thePlayer = plyr;
            this.camera.follow(plyr, Phaser.Camera.LOCK_ON);
            
            // setup game
            this.ui.newOptionsBox(this.camera.position.x, this.camera.position.y, [" Watch the intro", "  Skip the intro"], [1, 1], this.newGame, this);
        }
    },
    
    create: function () {
        
    },
    
    update: function () {
        // resize code
        this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
        this.screenFadeSurface.width = this.canvas.width;
        this.screenFadeSurface.height = this.canvas.height;
        
        // update lighting
        //this.lighting.update();
        
        this.ui.update();
        
        if(this.game.input.keyboard.downDuration(Phaser.Keyboard.F, 1)) {
            // insert random debug shit here
        }
        
        // update objects
        if(this.tWorld.loaded) {
            BasicGame.savedX = this.thePlayer.position.x;
            BasicGame.savedY = this.thePlayer.position.y;
            BasicGame.savedJumpLevel = this.thePlayer.jumpLevel;
            BasicGame.savedProgress = this.progress;
            
            if(this.tWorld.data.randomEncounters != null && this.thePlayer.walking) {
                if(this.tWorld.data.randomEncounters == 1) { // cave wolves
                    var chance = randomIntFromInterval(0, 600);
                    
                    if(chance == 0) {
                        // square go!
                        BasicGame.currentBattleColor = "#003355";
                        BasicGame.currentBattleMusic = "hwoods";
                        BasicGame.currentBattleBackground = "whiteShapes2";
                        BasicGame.currentBattleStartDelay = 2000;

                        BasicGame.currentBattleAttackers = [];
                        
                        var numWolves = randomIntFromInterval(1, 2);
                        for(var i = 0; i < numWolves; i++) {
                            BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Cave Wolf", "battleA_cwolf", randomIntFromInterval(1, 2) + (1 / randomIntFromInterval(2, 8)), 70, 0, 0x444444));
                        }
                        
                        var invList = [];
                        var invList2 = [];

                        for(var i = 0; i < this.inventoryItemsList.length; i++) {
                            if(this.inventorySelectableList[i]) {
                                invList.push(this.inventoryItemsList[i]);
                                invList2.push(true);
                            }
                        }
                        
                        BasicGame.BattleInventory = invList;
                        BasicGame.BattleInventorySelectable = invList2;
                        
                        if(this.tWorld.musicData != null) {
                            this.tWorld.musicData.stop();
                        }
                        
                        this.game.state.start('Battle');
                    }
                }
                else if(this.tWorld.data.randomEncounters == 2) { // spectres
                    var chance = randomIntFromInterval(0, 1500);
                    
                    if(chance == 0) {
                        // square go!
                        BasicGame.currentBattleColor = "#9922ee";
                        BasicGame.currentBattleMusic = "wildn_bat";
                        BasicGame.currentBattleBackground = "whiteShapes2";
                        BasicGame.currentBattleStartDelay = 2000;

                        BasicGame.currentBattleAttackers = [];
                        
                        var numWolves = randomIntFromInterval(1, 3);
                        for(var i = 0; i < numWolves; i++) {
                            var ty = randomIntFromInterval(0, 2);
                            
                            if(ty) {
                                BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Spectre", "ghost", randomIntFromInterval(1, 4) + (1 / randomIntFromInterval(2, 8)), 100, 0, 0xdddddd));
                            } else {
                                BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Fat Spectre", "fatghost", randomIntFromInterval(1, 2) + (1 / randomIntFromInterval(2, 8)), 120, 0, 0xffffff));
                            }
                        }
                        
                        var invList = [];
                        var invList2 = [];

                        for(var i = 0; i < this.inventoryItemsList.length; i++) {
                            if(this.inventorySelectableList[i]) {
                                invList.push(this.inventoryItemsList[i]);
                                invList2.push(true);
                            }
                        }
                        
                        BasicGame.BattleInventory = invList;
                        BasicGame.BattleInventorySelectable = invList2;
                        
                        if(this.tWorld.musicData != null) {
                            this.tWorld.musicData.stop();
                        }
                        
                        this.game.state.start('Battle');
                    }
                }
                else if(this.tWorld.data.randomEncounters == 3) { // bad spectres
                    var chance = randomIntFromInterval(0, 800);
                    
                    if(chance == 0) {
                        // square go!
                        BasicGame.currentBattleColor = "#9922ee";
                        BasicGame.currentBattleMusic = "wildn_bat";
                        BasicGame.currentBattleBackground = "whiteShapes2";
                        BasicGame.currentBattleStartDelay = 2000;

                        BasicGame.currentBattleAttackers = [];
                        
                        var numWolves = randomIntFromInterval(1, 3);
                        for(var i = 0; i < numWolves; i++) {
                            var ty = randomIntFromInterval(0, 2);
                            
                            if(ty == 0) {
                                BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Spectre", "ghost", randomIntFromInterval(1, 4) + (1 / randomIntFromInterval(2, 8)), 100, 0, 0xdddddd));
                            } else if(ty == 1) {
                                BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Fat Spectre", "fatghost", randomIntFromInterval(1, 2) + (1 / randomIntFromInterval(2, 8)), 120, 0, 0xffffff));
                            } else {
                                BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "???", "wizard", randomIntFromInterval(1, 3) + (1 / randomIntFromInterval(2, 8)), 120, 0, 0x551A8B));
                            }
                        }
                        
                        var invList = [];
                        var invList2 = [];

                        for(var i = 0; i < this.inventoryItemsList.length; i++) {
                            if(this.inventorySelectableList[i]) {
                                invList.push(this.inventoryItemsList[i]);
                                invList2.push(true);
                            }
                        }
                        
                        BasicGame.BattleInventory = invList;
                        BasicGame.BattleInventorySelectable = invList2;
                        
                        if(this.tWorld.musicData != null) {
                            this.tWorld.musicData.stop();
                        }
                        
                        this.game.state.start('Battle');
                    }
                }
                else if(this.tWorld.data.randomEncounters == 1337) { // Chawley [RARE]
                    var chance = randomIntFromInterval(0, 3000);
                    
                    if(chance == 0) {
                        BasicGame.currentBattleColor = "#000000";
                        BasicGame.currentBattleMusic = "blood";
                        BasicGame.currentBattleBackground = "whiteShapes2";
                        BasicGame.currentBattleStartDelay = 2000;

                        BasicGame.currentBattleAttackers = [];
                        BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Chawley", "chawley", 4, 200, 0, 0xffffff));

                        var invList = [];
                        var invList2 = [];

                        for(var i = 0; i < this.inventoryItemsList.length; i++) {
                            if(this.inventorySelectableList[i]) {
                                invList.push(this.inventoryItemsList[i]);
                                invList2.push(true);
                            }
                        }

                        BasicGame.BattleInventory = invList;
                        BasicGame.BattleInventorySelectable = invList2;
                        
                        if(this.tWorld.musicData != null) {
                            this.tWorld.musicData.stop();
                        }
                        
                        this.game.state.start('Battle');
                    }
                }
            }
            
            if(this.correctPlayer) {
                if(this.correctPlayer == 1) {
                    this.thePlayer.position.x = this.correctX;
                    this.thePlayer.position.y = this.correctY;

                    this.correctPlayer = false;
                    
                    this.thePlayer.loadTexture(this.correctType);

                    console.log("player corrected to", this.correctX, this.correctY);
                }
                
                this.correctPlayer -= 1;
            }
            
            if(this.camshake > 0) {
                var offsetX = randomIntFromInterval(-this.camshake, this.camshake);
                var offsetY = randomIntFromInterval(-this.camshake, this.camshake);

                this.camera.focusOnXY(this.camshakeCenter.x + offsetX, this.camshakeCenter.y + offsetY);

                this.camera.update();
            }
            
            for(var i = 0; i < this.objects.length; i++) {
                // collide objects with world
                this.tWorld.doCollisionCheck(this.objects[i]);
            }
            
            this.tWorld.doCollisionCheck(this.thePlayer);
            
            // check for player object interactions
            if(this.thePlayer.customSprite == "") {
                this.thePlayer.alpha = 1;
            }
            
            // move dark mask
            this.darkMask.position.set(this.thePlayer.position.x + 12, this.thePlayer.position.y + 16);
            
            // recalculate dark mask arms
            var position = this.darkMask.position;
            
            this.darkMaskArms[0].width = position.x + 64;
            this.darkMaskArms[0].height = position.y - 64;
            
            this.darkMaskArms[1].position.x = this.game.world.width;
            this.darkMaskArms[1].width = (position.x + 64) - this.game.world.width;
            this.darkMaskArms[1].height = position.y + 64;
            
            this.darkMaskArms[2].position.x = this.game.world.width;
            this.darkMaskArms[2].position.y = this.game.world.height;
            this.darkMaskArms[2].width = (position.x - 64) - this.game.world.width;
            this.darkMaskArms[2].height = (position.y + 64) - this.game.world.height;
            
            this.darkMaskArms[3].position.y = this.game.world.height;
            this.darkMaskArms[3].width = position.x - 64;
            this.darkMaskArms[3].height = (position.y - 64) - this.game.world.height;

            this.thePlayer.showInteractIcon = false;

            posX = Math.floor((this.thePlayer.position.x + 16) / 32);
            posY = Math.floor(this.thePlayer.position.y / 32);

            posY += 1;

            var iData = this.tWorld.getInteractData(posX, posY);

            while(true) {
                if(iData == null) {
                    break;
                }
                
                var cannotInteract = false;
                if(iData.requireExamine && !this.thePlayer.interacting) {
                    if(!this.thePlayer.examine) {
                        this.thePlayer.showInteractIcon = true;
                        break;
                    }
                }
                
                if(!this.thePlayer.showInteractIcon) {
                    if(iData.playSound != null) {
                        if(this.tempSnd != null) {
                            if(!this.tempSnd.isPlaying) {
                                this.playSound(iData.playSound);
                            }
                        } else {
                            this.playSound(iData.playSound);
                        }
                    }

                    if(iData.setRespawnPoint != null) {
                        this.respawn_area = iData.setRespawnPoint;

                        if(iData.setRespawnPointX != null) {
                            this.respawn_x = iData.setRespawnPointX;
                        } else {
                            this.respawn_x = this.thePlayer.position.x;
                        }

                        if(iData.setRespawnPointY != null) {
                            this.respawn_y = iData.setRespawnPointY;
                        } else {
                            this.respawn_y = this.thePlayer.position.y;
                        }
                    }
                    
                    if(iData.saveGame != null) {
                        this.thePlayer.enabled = false;
                        
                        this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, [" Slot 1", " Slot 2", " Slot 3", "---", "Cancel"], [1, 1, 1, -1, 1], this.saveGame, this);
                    }
                    
                    if(iData.sleep != null) {
                        this.thePlayer.enabled = false;
                        
                        this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, ["Sleep", "Don't"], [1, 1], this.sleep, this);
                    }
                    
                    if(iData.getItem != null) {
                        if(iData.getItemDesc != null) {
                            this.aquireItem(iData.getItem, iData.getItemDesc, true);
                        } else {
                            this.aquireItem(iData.getItem, "", false);
                        }
                    }
                    
                    if(iData.callFunction != null) {
                        eval("this." + iData.callFunction + "();");
                    }
                    
                    if(iData.forcePlayerFace != null) {
                        this.thePlayer.facingDirection = iData.forcePlayerFace;
                    }

                    if(iData.goTo != null) {
                        this.respawned = false;
                        this.thePlayer.interacting = true;

                        if(this.screenFadeSurface.alpha < 0.9 && iData.goTo != "") {
                            this.fadeMode = 3;
                            this.thePlayer.enabled = false;
                            
                            // hotfix
                            this.thePlayer.position.x = iData.posX*32;
                            this.thePlayer.position.y = (iData.posY*32) - 18;
                        } else {
                            this.fadeMode = 2;
                            this.thePlayer.enabled = true;

                            this.clearObjects();
                            this.tWorld.loadArea(iData.goTo);
                            
                            BasicGame.savedLevel = iData.goTo;
                            
                            if(iData.moveToX >= 0) {
                                this.thePlayer.position.x = iData.moveToX * 32;
                            }

                            if(iData.moveToY >= 0) {
                                this.thePlayer.position.y = (iData.moveToY * 32) - 18;
                            }
                            
                            // load objects from tWorld map
                            this.loadMapObjects();
                            
                            if(this.tWorld.data.callOnLoad != null) {
                                eval("this." + this.tWorld.data.callOnLoad + "();");
                            }
                            
                            this.screenFadeSurface.bringToTop();
                            this.bringDarkMaskToTop();                            
                            
                            if(iData.message != null) {
                                this.thePlayer.enabled = false;
                                var msgArray = iData.message.split("#");
                                
                                if(!msgArray.length > 1) {
                                    this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, iData.message, 0, this.messagesOver, this);
                                } else {
                                    this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, msgArray, this.messagesOver, this);
                                }
                            }
                        }
                    } else {
                        if(iData.message != null) {
                            this.thePlayer.enabled = false;
                            this.thePlayer.enabled = false;
                            var msgArray = iData.message.split("#");

                            if(msgArray.length > 1) {
                                this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, msgArray, this.messagesOver, this);
                            } else {
                                this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, iData.message, 0, this.messagesOver, this);
                            }
                        }
                        
                        if(iData.moveToX >= 0) {
                            this.thePlayer.position.x = iData.moveToX*32;
                        }

                        if(iData.moveToY >= 0) {
                            this.thePlayer.position.y = (iData.moveToY*32) - 18;
                        }
                    }
                }

                if(iData.cutscene != null) {
                    this.doCutscene = iData.cutscene;
                }
                
                if(iData.progression != null) {
                    if(this.progress < iData.progression) {
                        this.progress = iData.progression;
                    }
                }
                
                if(iData.isSavePoint != null) {
                    if(iData.isSavePoint) {
                        this.doCutscene = 1337;
                    }
                }
                
                break;
            }
        } else {
            //console.log("world not loaded...");
            
            this.stage.backgroundColor = "#000000";
            this.thePlayer.alpha = 0;
            
            if(!this.ui.activeDialogs.length > 0 && this.allow_respawn) {
                this.tWorld.loadArea(this.respawn_area);
                this.progress = this.respawnProgress;
                this.thePlayer.jumpLevel = this.respawn_jump;
                BasicGame.savedLevel = this.respawn_area;
                
                // load objects from tWorld map
                this.loadMapObjects();
                
                if(this.tWorld.data.callOnLoad != null) {
                    eval("this." + this.tWorld.data.callOnLoad + "();");
                }
                
                this.respawned = false;
                
                this.screenFadeSurface.bringToTop();
                this.bringDarkMaskToTop();
                
                this.inventoryItemsList = this.respawn_inventory.slice();
                this.inventoryDescriptionsList = this.respawn_inventoryD.slice();
                this.inventorySelectableList = this.respawn_inventoryA.slice();
                
                this.questsList = this.respawn_quests.slice();
                this.questsDescriptionsList = this.respawn_questsD.slice();
                this.questsSelectableList = this.respawn_questsA.slice();
                
                BasicGame.currentBattleFriendlies = JSON.parse(JSON.stringify(this.respawn_group));
                
                // correct player position RIGHT after level loads
                this.correctX = this.respawn_x;
                this.correctY = this.respawn_y;
                
                this.correctType = this.respawn_player;
                
                this.correctPlayer = true;
            }
        }
          
        // fade
        if(this.tWorld.loaded) {
            if(this.fadeMode == 0 && this.screenFadeSurface.alpha > 0.1) {
                this.screenFadeSurface.alpha -= 0.01;
            }

            if(this.fadeMode == 1 && this.screenFadeSurface.alpha < 0.9) {
                this.screenFadeSurface.alpha += 0.01;
            }

            if(this.fadeMode == 2 && this.screenFadeSurface.alpha > 0.1) {
                this.screenFadeSurface.alpha -= 0.1;
            }

            if(this.fadeMode == 3 && this.screenFadeSurface.alpha < 0.9) {
                this.screenFadeSurface.alpha += 0.1;
            }

            if(this.fadeMode == 10 && this.screenFadeSurface.alpha > 0.1) {
                this.screenFadeSurface.alpha -= 0.01;
            } else if (this.fadeMode == 10) {
                // reset tint
                //this.screenFadeSurface.tint = 0x000000;
                this.fadeMode = 0;
            }
            
            if(this.thePlayer.enabled && !this.ui.activeDialogs.length > 0 && this.game.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
                this.openEscapeMenu();
            }
        }
        
        if(this.doChapterOneSeq > 0) {
            this.chapterOneSprite.position.set(this.camera.position.x, this.camera.position.y);
            this.chapterOneSprite.bringToTop();
            
            if(this.doChapterOneSeq == 1) {
                if(this.chapterOneSprite.alpha < 0.9) {
                    this.chapterOneSprite.alpha += 0.002;
                }
                else {
                    this.doChapterOneSeq = 2;
                }
            }
            if(this.doChapterOneSeq == 2) {
                if(this.chapterOneSprite.alpha > 0.1) {
                    this.chapterOneSprite.alpha -= 0.002;
                }
                else {
                    this.doChapterOneSeq = 0;
                    this.chapterOneSprite.alpha = 0;
                    
                    this.introducingMoyle();
                }
            }
        }
    },
    
    shutdown: function () {
        
    },
    
    // other functionality
    loadMapObjects: function() {
        if(this.tWorld.data.objects != null) {
            for(var j = 0; j < this.tWorld.data.objects.length; j++) {
                var objData = this.tWorld.data.objects[j];
                var newObj = null;
                
                if(objData.type == "Actor") {
                    newObj = new Actor(this.game, objData.x  * 32, (objData.y * 32) - 24, objData.sprite);
                    newObj.facingDirection = objData.actor_facingDirection;
                } else {
                    newObj = new Basic(this.game, (objData.x * 32) + 16, (objData.y * 32) + 16, objData.sprite);
                    newObj.anchor.set(0.5, 0.5);
                    
                    if(objData.basic_spin != null) {
                        newObj.spin = objData.basic_spin;
                    }
                    
                    if(objData.basic_rotation != null) {
                        newObj.rotation = objData.basic_rotation;
                    }
                }
                
                if(objData.appearProgressMax != null) {
                    if(this.progress > objData.appearProgressMax) {
                        newObj.destroy();
                        newObj = null;
                        
                        continue;
                    }
                }
                if(objData.appearProgressMin != null) {
                    if(this.progress < objData.appearProgressMin) {
                        newObj.destroy();
                        newObj = null;
                        
                        continue;
                    }
                }
                
                //console.log(newObj);
                this.objects.push(newObj);
            }
            
            //this.tWorld.layer5.bringToTop();
            
            this.screenFadeSurface.bringToTop();
            this.bringDarkMaskToTop();
        }
        
        // flash up the map name if there is one
        if(this.curAreaName != this.tWorld.name) {
            //this.speachObject.doCentreText(this.tWorld.name, 4000);
            this.curAreaName = this.tWorld.name;
        }
        
        // update the dark mask if there's a set light level
        if(this.tWorld.data.lightLevel != null) {
            this.setDarkMaskAlpha(1 - this.tWorld.data.lightLevel);
        } else {
            this.setDarkMaskAlpha(0);
        }
    },
    
    clearObjects: function () {
        for(var i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
            this.objects[i] = null;
        }
        
        this.objects.length = 0;
    },
    
    newGame: function (selection) {
        if(selection == 0) {
            // 2spooky4me
            this.ui.sequenceMessageBox(this.camera.position.x, this.camera.position.y, ["Today, I woke up in a strange place.", "It wasn't anywhere I'd been before. Not that I recalled being anywhere before being here, but...", "...", "Well.", "I'll let you see for yourself."], this.newGameFinal, this);

            this.respawn_player = 'playerPre';
            this.fadeMode = 1;
        } else {
            this.respawn_player = 'playerPre2';
            this.thePlayer.loadTexture('playerPre2');
            BasicGame.savedPlayerType = 'playerPre2';

            this.fadeMode = 1;
            this.doChapterOneSeq = true;
            this.playSound("spaceWhale");
        }
    },
    
    newGameFinal: function() {
        // new games start here
        this.thePlayer.showMoveIcon = true;
        
        this.progress = 0;
        this.respawn_area = "intro1";
        this.respawn_x = 400;
        this.respawn_y = 880;
        
        this.allow_respawn = true;
        
        this.menusAllowed = false;
        
        this.fadeMode = 0;
    },
    
    resumeGame: function() {
        console.log("[MESS] resuming game");
        
        // setup player
        var plyr = new Actor(this.game, 10000, 10000, BasicGame.savedPlayerType, 'plyr');
        
        plyr.isPersistent = true;
        plyr.controllable = true;
        plyr.body.collideWorldBounds = true;
        
        this.camera.follow(plyr, Phaser.Camera.LOCK_ON);
        this.thePlayer = plyr;
        
        /*
        // create respawn point in current area
        this.respawn_area = BasicGame.savedLevel;
        this.respawn_x = BasicGame.savedX;
        this.respawn_y = BasicGame.savedY;
        this.respawnProgress = this.progress;
        this.respawn_player = BasicGame.savedPlayerType;
        this.respawn_jump = BasicGame.savedJumpLevel;
        this.respawn_inventory = this.inventoryItemsList.slice();
        this.respawn_inventoryD = this.inventoryDescriptionsList.slice();
        this.respawn_inventoryA = BasicGame.BattleInventorySelectable.slice();
        this.respawn_quests = this.questsList.slice();
        this.respawn_questsD = this.questsDescriptionsList.slice();
        this.respawn_questsA = this.questsSelectableList.slice();
        
        this.allow_respawn = true;
        */
        
        this.tWorld.loadArea(BasicGame.savedLevel);
        this.progress = this.progress;
        this.thePlayer.jumpLevel = BasicGame.savedJumpLevel;
        BasicGame.savedLevel = BasicGame.savedLevel;

        // load objects from tWorld map
        this.loadMapObjects();
        
        this.respawned = true;
        
        if(this.tWorld.data.callOnLoad != null) {
            eval("this." + this.tWorld.data.callOnLoad + "();");
        }

        this.respawned = false;

        this.screenFadeSurface.bringToTop();
        this.bringDarkMaskToTop();
        
        for(var i = 0; i < BasicGame.BattleInventory.length; i++) {
            if(BasicGame.BattleInventorySelectable[i] == false) {
                // make this non-selectable in the main inventory
                for(var j = 0; j < this.inventoryItemsList.length; j++) {
                    if(this.inventoryItemsList[j] == BasicGame.BattleInventory[i]) {
                        this.inventorySelectableList[j] = false;
                        break;
                    }
                }
            }
        }

        // correct player position RIGHT after level loads
        this.correctType = BasicGame.savedPlayerType;
        
        this.correctX = BasicGame.savedX;
        this.correctY = BasicGame.savedY;
        
        this.correctPlayer = 2;
    },
    
    createRespawnPoint: function() {
        if(!this.tWorld.loaded)
            return;
        
        this.respawn_area = this.tWorld.loadedKey;
        this.respawn_x = this.thePlayer.position.x;
        this.respawn_y = this.thePlayer.position.y;
        this.respawnProgress = this.progress;
        this.respawn_player = BasicGame.savedPlayerType;
        this.respawn_jump = this.thePlayer.jumpLevel;
        this.respawn_inventory = this.inventoryItemsList.slice();
        this.respawn_inventoryD = this.inventoryDescriptionsList.slice();
        this.respawn_inventoryA = this.inventoryItemsList.slice();
        this.respawn_quests = this.questsList.slice();
        this.respawn_questsD = this.questsDescriptionsList.slice();
        this.respawn_questsA = this.questsSelectableList.slice();
        this.respawn_group = JSON.parse(JSON.stringify(BasicGame.currentBattleFriendlies));
        
        console.log("[MESS] respawn point created.");
    },
    
    respawn: function() {
        console.log("[MESS] respawning...");
        
        // setup player
        if(this.thePlayer == null) {
            var plyr = new Actor(this.game, 0, 0, "playerPre", 'plyr');

            plyr.isPersistent = true;
            plyr.controllable = true;
            plyr.body.collideWorldBounds = true;

            this.camera.follow(plyr, Phaser.Camera.LOCK_ON);
            this.thePlayer = plyr;
        }
        
        this.allow_respawn = true;
        
        if(this.tWorld.loaded) {
            this.clearObjects();
            this.tWorld.unloadArea();
        }
        
        this.respawned = true;
    },
    
    attemptLoadGame: function () {
        return false;
    },
    
    render: function () {
        /*
        if(!this.speach) {
            this.lighting.render();
        }
        */
    },
    
    playSound: function (snd) {
        this.tempSnd = this.add.audio(snd);
        this.tempSnd.play('', 0, BasicGame.sfxVol, false);
    },
    
    haltSound: function() {
        this.tempSnd.destroy();
    },
    
    setCameraShake: function(shake) {
        this.camshakeCenter = this.camera.position;
        
        if(shake > 0) {
            // detach cam from player and shake
            this.camshake = shake;
            this.camera.unfollow();
        } else {
            // normalize everything
            this.camshake = 0;
            this.camera.follow(this.thePlayer);
        }
    },
    
    bringDarkMaskToTop: function() {
        this.darkMask.bringToTop();
        
        this.darkMaskArms[0].bringToTop();
        this.darkMaskArms[1].bringToTop();
        this.darkMaskArms[2].bringToTop();
        this.darkMaskArms[3].bringToTop();
    },
    
    setDarkMaskAlpha: function(alp) {
        this.darkMask.alpha = alp;
        
        this.darkMaskArms[0].alpha = alp;
        this.darkMaskArms[1].alpha = alp;
        this.darkMaskArms[2].alpha = alp;
        this.darkMaskArms[3].alpha = alp;
    },
    
    // callbacks
    messagesOver: function() { // callback for end of most message ui sequences
        this.thePlayer.enabled = true;
    },
    
    //---------------------------------------------------------------------------------
    
    // MENUS
    
    openEscapeMenu: function(opSelected) {
        if(!BasicGame.debugAllowed) {
            this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, ["Resume", "---", "Return To Menu", "---", "Party", "Inventory", "Quest Log"], [1, -1, 1, -1, this.menusAllowed, this.menusAllowed, this.menusAllowed], this.escapeMenuSelect, this, opSelected);
        }
        else {
            this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, ["Resume", "---", "Return To Menu", "---", "Party", "Inventory", "Quest Log", "---", "DEBUG"], [1, -1, 1, -1, this.menusAllowed, this.menusAllowed, this.menusAllowed, -1, 1], this.escapeMenuSelect, this, opSelected);
        }
         
        this.thePlayer.enabled = false;
    },
    
    escapeMenuSelect: function(selection) {
        if(selection == 0) {
            this.messagesOver();
        }
        else if(selection == 2) {
            this.escapeMenuPreNG1();
        }
        else if(selection == 4) {
            this.showPartyMenu();
        }
        else if(selection == 5) {
            this.showInventory();
        }
        else if(selection == 6) {
            this.showQuests();
        }
        else if(selection == 8) { // debug
            this.showDebugMenu();
        }
    },
    
    escapeMenuPreNG1: function() {
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y, "Are you sure?", 0, this.escapeMenuPreNG2, this);
    },
    
    escapeMenuPreNG2: function() {
        this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, [" No, that was an accident", " Afraid so"], [1, 1], this.escapeMenuNGCheck, this);
    },
    
    escapeMenuNGCheck: function(selection) {
        if(selection == 0) {
            this.openEscapeMenu(2);
        }
        else {
            location.reload();
        }
    },
    
    showPartyMenu: function() {
        var parList = [];
        var parList2 = [];

        for(var i = 0; i < BasicGame.currentBattleFriendlies.length; i++) {
            parList.push(" " + BasicGame.currentBattleFriendlies[i].uiName);
            parList2.push(1);
        }

        parList.push("---");
        parList.push("Back");
        
        parList2.push(-1);
        parList2.push(1);
        
        this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, parList, parList2, this.partyMenuSelect, this);
    },
    
    partyMenuSelect: function(selection) {
        this.usingOnChar = selection;
        
        var partyMembers = BasicGame.currentBattleFriendlies.length;
        var a = BasicGame.currentBattleFriendlies; // reference
        
        if(selection == partyMembers + 1) {
            this.openEscapeMenu(4);
            this.usingOnChar = -1;
            return;
        }
        
        // show stats for selected party member
        this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, ["   " + a[selection].uiName + " (Lv: " + a[selection].level + ")", "   Health: " + a[selection].health + "/" + a[selection].maxHealth, "MP: " + a[selection].MP + "/" + a[selection].maxMP, "Speed: " + a[selection].readyTime, "Attack: " + a[selection].atkMultiplier, "Exp: " + a[selection].exp + "/" + a[selection].expReq, "---", "   Use Item...", "Back"], [0, 0, 0, 0, 0, 0, -1, 1, 1], this.partyMenuSelect2, this);
    },
    
    partyMenuSelect2: function(selection) {
        if(selection == 7) {
            this.showInventory();
        }
        else {
            this.showPartyMenu();
        }
    },
    
    showInventory: function() {
        var invList = [];
        var invList2 = [];

        for(var i = 0; i < this.inventoryItemsList.length; i++) {
            if(this.inventorySelectableList[i]) {
                invList.push(this.inventoryItemsList[i]);
                invList2.push(true);
            }
        }

        invList.push("---");
        invList.push("Back");

        invList2.push(-1);
        invList2.push(1);
        
        var items = invList.length - 2;
        
        if(items != 0) {
            this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, invList, invList2, this.inventorySelect, this);
        } else {
            this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, [" You have nothing.", " :-/", "---", "Back"], [0, 0, -1, 1], this.inventorySelect, this);
        }
    },
    
    inventorySelect: function(selection) {
        var invList = [];
        var invList2 = [];

        for(var i = 0; i < this.inventoryItemsList.length; i++) {
            if(this.inventorySelectableList[i]) {
                invList.push(this.inventoryItemsList[i]);
                invList2.push(this.inventoryDescriptionsList[i]);
            }
        }
        
        var items = invList.length;
        
        if(items != 0) {
            if(selection == items + 1) {
                if(this.usingOnChar == -1) {
                    this.openEscapeMenu(5);
                } else {
                    this.showPartyMenu();
                }
            } else {
                if(this.usingOnChar == -1) {
                    // display item description
                    this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 300, invList2[selection], 0, this.showInventory, this);
                } else {
                    var itemName = invList[selection];
                    
                    // rice pudding
                    if(itemName.search("Rice Pudding") != -1) {
                        this.removeItem(itemName);
                        BasicGame.currentBattleFriendlies[this.usingOnChar].health = BasicGame.currentBattleFriendlies[this.usingOnChar].maxHealth;
                        this.showPartyMenu();
                    }
                    else {
                        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 300, "Can't use this here.", 0, this.showPartyMenu, this);
                    }
                }
            }
        } else {
            if(this.usingOnChar == -1) {
                this.openEscapeMenu(5);
            } else {
                this.showPartyMenu();
            }
        }
    },
    
    showQuests: function() {
        var quests = this.questsList.length;
        
        if(quests != 0) {
            var invArray = this.questsList;
            var invOpts = ["---", "Back"];

            var invList = invArray.concat(invOpts);

            var invSelectable = this.questsSelectableList;
            var invSOpts = [-1, 1];

            var invList2 = invSelectable.concat(invSOpts);

            this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, invList, invList2, this.questsSelect, this);
        } else {
            this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, ["     Your life is without meaning.", "| ", "---", "Back"], [0, 0, -1, 1], this.questsSelect, this);
        }
    },
    
    questsSelect: function(selection) {
        var itemRange = this.questsList.length - 1;
        
        if(itemRange != -1) {
            if(selection == itemRange + 2) {
                this.openEscapeMenu(6);
            } else {
                // display item description
                this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 300, this.questsDescriptionsList[selection], 0, this.showQuests, this);
            }
        } else {
            this.openEscapeMenu(6);
        }
    },
    
    showDebugMenu: function(menuPos, skipFade) {
        var opMode = "OP Mode OFF ";
        if(this.thePlayer.debugMode) {
            opMode = "OP Mode ON ";
        }
        
        var mlgOp = "MLG Mode OFF ";
        if(BasicGame.mlg) {
            mlgOp = "MLG Mode ON ";
        }
        
        var shColOp = "    Collision Overlay OFF"
        if(BasicGame.displayColliders) {
            shColOp = "    Collision Overlay ON"
        }
        
        var smOp = "Slow Motion OFF";
        if(this.game.time.slowMotion == 3.0) {
            smOp = "Slow Motion ON";
        }

        var box = this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 300, [opMode, mlgOp, shColOp, smOp, "---", "Reset Player", "---", "Back"], [1, 1, 1, 1, -1, 1, -1, 1], this.debugMenuSelect, this, menuPos);
        
        if(skipFade) {
            box.skipFade();
        }
    },
    
    debugMenuSelect: function(selected) {
        if(selected == 0) {
            this.thePlayer.debugMode = !this.thePlayer.debugMode;
            this.thePlayer.debugModeCheck();
        }
        else if(selected == 1) {
            BasicGame.mlg = !BasicGame.mlg;
        }
        else if(selected == 2) {
            BasicGame.displayColliders = !BasicGame.displayColliders;
            this.tWorld.setDebug(BasicGame.displayColliders);
        }
        else if(selected == 3) {
            if(this.game.time.slowMotion == 1.0) {
                this.game.time.slowMotion = 3.0;
            } else {
                this.game.time.slowMotion = 1.0;
            }
        }
        else if(selected == 5) {
            this.respawn();
            this.messagesOver();
            return;
        }
        else if(selected == 7) {
            this.openEscapeMenu(8);
            return;
        }
        
        this.showDebugMenu(selected, true);
    },
    
    aquireQuest: function(questName, questDescription) {
        this.thePlayer.enabled = false;
        
        this.questsList.push(" " + questName);
        this.questsDescriptionsList.push(questDescription);
        this.questsSelectableList.push(true);
        
        var box = this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 300, "Quest aquired: " + questName + "! See your quest log for more info.", 0, this.messagesOver, this);
        
        for(var i = 0; i < box.visibleText.length; i++) {
            box.visibleText[i].alpha = 0.7;
        }
    },
    
    completeQuest: function(questName) {
        for(var i = 0; i < this.questsList.length; i++) {
            if(this.questsList[i] == " " + questName) {
                this.questsSelectableList[i] = false;
            }
        }
        
        var box = this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 300, "Quest completed: " + questName + "!", 0, this.messagesOver, this);
        
        for(var i = 0; i < box.visibleText.length; i++) {
            box.visibleText[i].alpha = 0.7;
        }
    },
    
    hasQuest: function(questName) {
        for(var i = 0; i < this.questsList.length; i++) {
            if(this.questsList[i] == " " + questName && this.questsSelectableList[i] == true) {
                return true;
            }
        }
        
        return false;
    },
    
    aquireItem: function(itemName, itemDescription, canExamine) {
        this.thePlayer.enabled = false;
        
        for(var i = 0; i < this.inventoryItemsList.length; i++) {
            if(this.inventoryItemsList[i] == " " + itemName) {
                this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Nothing to see here...", 0, this.messagesOver, this);
                return; // already have this.
            }
        }
        
        this.inventoryItemsList.push(" " + itemName);
        this.inventoryDescriptionsList.push(itemDescription);
        this.inventorySelectableList.push(canExamine);
        
        var box = this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 300, "You got " + itemName + ".", 0, this.messagesOver, this);
        
        for(var i = 0; i < box.visibleText.length; i++) {
            box.visibleText[i].alpha = 0.7;
        }
    },
    
    removeItem: function(itemName) {
        for(var i = 0; i < this.inventoryItemsList.length; i++) {
            if(this.inventoryItemsList[i] == itemName) {
                this.inventorySelectableList[i] = false;
            }
        }
    },
    
    hasItem: function(name) {
        for(var i = 0; i < this.inventoryItemsList.length; i++) {
            if(this.inventoryItemsList[i] == name) {
                return true;
            }
        }
        
        return false;
    },
    
    sleep: function(selection) {
        this.thePlayer.enabled = true;
        
        if(selection == 1)
            return;
        
        for(var i = 0; i < BasicGame.currentBattleFriendlies.length; i++) {
            BasicGame.currentBattleFriendlies[i].health = BasicGame.currentBattleFriendlies[i].maxHealth;
            BasicGame.currentBattleFriendlies[i].MP = BasicGame.currentBattleFriendlies[i].maxMP;
        }
        
        this.createRespawnPoint();
        this.screenFadeSurface.alpha = 1;
    },
    
    saveGame: function(slot) {
        // slot must be 0-2 (represents 1-3)
        // javascript is a good language, by the way. More fun to dev with than C++ or Py. I could totally get into it.
        
        if(slot == 4) {
            this.thePlayer.enabled = true;
            return;
        }
        
        this.createRespawnPoint();
        
        window.localStorage["mess_save_last"] = slot;
        window.localStorage["mess_save_slot" + slot] = true;
        
        window.localStorage["mess_save_slot" + slot + "_area"] = this.respawn_area;
        window.localStorage["mess_save_slot" + slot + "_x"] = this.respawn_x;
        window.localStorage["mess_save_slot" + slot + "_y"] = this.respawn_y;
        window.localStorage["mess_save_slot" + slot + "_progress"] = this.respawnProgress;
        window.localStorage["mess_save_slot" + slot + "_player"] = this.respawn_player;
        window.localStorage["mess_save_slot" + slot + "_jump"] = this.respawn_jump;
        window.localStorage["mess_save_slot" + slot + "_inventory"] = JSON.stringify(this.respawn_inventory);
        window.localStorage["mess_save_slot" + slot + "_inventoryD"] = JSON.stringify(this.respawn_inventoryD);
        window.localStorage["mess_save_slot" + slot + "_inventoryA"] = JSON.stringify(this.respawn_inventoryA);
        window.localStorage["mess_save_slot" + slot + "_quests"] = JSON.stringify(this.respawn_quests);
        window.localStorage["mess_save_slot" + slot + "_questsD"] = JSON.stringify(this.respawn_questsD);
        window.localStorage["mess_save_slot" + slot + "_questsA"] = JSON.stringify(this.respawn_questsA);
        window.localStorage["mess_save_slot" + slot + "_group"] = JSON.stringify(this.respawn_group);
        
        // finish
        this.thePlayer.enabled = true;
    },
    
    //---------------------------------------------------------------------------------
    
    // CUTSCENE FUNCTIONS
    
    shakeIt: function() {
        this.thePlayer.enabled = false;
        this.thePlayer.pose("martinCrouch", 1000, this.shakeIt1, this);
    },
    
    shakeIt1: function() {
        // remove the hat at 41, 28
        this.tWorld.manager.removeTile(41, 28, this.tWorld.layer2);
        
        this.thePlayer.facingDirection = 1;
        this.thePlayer.customSprite = "martinGetHat";
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "It says \"Martin\". Why does that sound familiar?", 0, this.shakeIt2, this);
    },
    
    shakeIt2: function() {
        this.thePlayer.customSprite = "martinGetHat2";
        BasicGame.savedPlayerType = "playerPre2";
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Any takers?", "...", "Welp, free hat..."], this.shakeIt3, this);
    },
    
    shakeIt3: function() {
        this.thePlayer.customSprite = "";
        this.thePlayer.loadTexture("playerPre2");
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Doesn't really help things much, does it?", "Let's see here...", "I don't know where I am.", "I'm not too sure WHO I am.", "I'm a bit miffed, actually.", "But I sure am glad I've got this cool hat! That's just great, isn't it?", "Jeez, I thought there would be something interesting over here. All I can see is odd blue pillar things and a really long drop.", "...am I supposed to jump off the edge? I'm definitely not going down there.", "Nope. No, sir. Not in a million years."], this.shakeIt4, this);
    },
    
    shakeIt4: function() {
        this.tWorld.musicData.fadeOut(1000);
        
        this.playSound("quake");
        
        this.setCameraShake(5);
        this.thePlayer.facingDirection = 0;
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["...ah.", "I might just have spoken too soon."], this.shakeIt5, this);
    },
    
    shakeIt5: function() {
        this.setCameraShake(20);
        this.thePlayer.customSprite = "martinUnsteady";
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Woah, okay! Let's talk about this!", 0, this.shakeIt6, this);
    },
    
    shakeIt6: function() {
        this.thePlayer.customSprite = "";
        
        this.haltSound();
        
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y, "Let's- AAAAAAAAHHHHHHHHHHHHHH!", 0, this.shakeIt7, this);
        
        this.allow_respawn = false;
        this.tWorld.unloadArea();
    },
    
    shakeIt7: function() {
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y - 100, "AAAAAAAAHHHHHHHHHHHHHH!", 1000, null, null);
        
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, "...", 0, this.shakeIt8, this);
    },
    
    shakeIt8: function() {
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y - 100, "OH GOD OH GOD OH GOD AHHHHHHHHHH!", 2000, null, null);
        
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, "...", 0, this.shakeIt9, this);
    },
    
    shakeIt9: function() {
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y - 100, "I'M SPINNING! I'M SPIIINIIIING!", 2000, null, null);
        
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, "He's a loud one, isn't he?", 0, this.shakeIt10, this);
    },
    
    shakeIt10: function() {
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y - 100, "I CAN'T FEEL MY EARS! MY EEEARS!", 2000, null, null);
        
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, "...", 0, this.shakeIt11, this);
    },
    
    shakeIt11: function() {
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y - 100, "I'M GONNA BLACK OUT! I'M GONNA-", 2000, null, null);
        
        this.ui.newMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, "...", 0, this.shakeIt12, this);
    },
    
    shakeIt12: function() {    
        this.ui.sequenceMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, ["...", "...there we go. Peace at last.", "Okay, Listen, you.", "No, not him. You. I'm talking to you. You're in control here, right?"], this.shakeIt13, this);
    },
    
    shakeIt13: function() {
        this.ui.newOptionsBox(this.game.camera.position.x, this.game.camera.position.y + 100, ["What?", "Yes?", "No?", "Moo?"], [1, 1, 1, 1], this.shakeIt14, this);
    },
    
    shakeIt14: function(selection) {
        this.ui.sequenceMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, ["Um...", "Well, either way. The being you just met was formerly known as Martin. You're assigned to him, in case you need reminding.", "You need to be vigilant. Reality is bending in on Martin. It's breaking down, falling apart. And soon, it'll be closing in.", "I know what's been said. I'm aware of what you're thinking, because I'm thinking it too. But I need you to do this.", "Look after him. Guide him. Aid him, lead him, and when the time comes, show him the light.", "We're all counting on you."], this.shakeIt15, this);
    },
    
    shakeIt15: function() {
        // i hate to do this but we're on a time budget so invoke an inbuilt sequence
        this.doChapterOneSeq = 1;
        this.playSound('spaceWhale');
    },
    
    // MOYLE'S CUTSCENE
    introducingMoyle: function() {
        this.clearObjects();
        
        this.tWorld.loadArea("MoylesMill");
        this.loadMapObjects();
        
        this.camera.follow(this.thePlayer, Phaser.Camera.LOCK_ON);
        
        this.thePlayer.x = (25*32) + 6;
        this.thePlayer.y = 32*32;
        
        this.objects[0].facingDirection = 1;
        
        this.thePlayer.pose("blackout", 1000, this.introducingMoyle1, this);
        
        this.fadeMode = 1;
        this.screenFadeSurface.alpha = 1;
        this.screenFadeSurface.bringToTop();
        
        this.tWorld.musicData.stop();
    },
    
    introducingMoyle1: function() {
        this.thePlayer.enabled = false;
        
        this.ui.sequenceMessageBox(this.game.camera.position.x, this.game.camera.position.y + 100, ["Hello? Are you alright?", "(oh god, I haven't got space in the storehouse for another body...)", "Hey! Wake up, will you?"], this.introducingMoyle2, this);
    },
    
    introducingMoyle2: function() {
        if(BasicGame.playMusic) {
            this.tWorld.musicData.play();
        }
        
        this.fadeMode = 0;
        this.thePlayer.customSprite = "playerBed";
        
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Huh?", 0, this.introducingMoyle3, this);
    },
    
    introducingMoyle3: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["AHHHHHHHHHHHHHHHHHHHH!", "I mean... sorry.", "You jumped up so suddenly! It was like you were hit by lightning or something!"], this.introducingMoyle4, this);
        this.objects[0].customSprite = "moyleHandsUp";
        this.thePlayer.customSprite = "playerBed2";
    },
    
    introducingMoyle4: function() {
        this.objects[0].customSprite = "";
        this.thePlayer.pose("playerBed3", 1000, this.introducingMoyle5, this);
    },
    
    introducingMoyle5: function() {
        this.thePlayer.facingDirection = 0;
        
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["...Where am I?", "What's going on?"], this.introducingMoyle6, this);
    },
    
    introducingMoyle6: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["Oh, this is my house.", "I found you in my nectar plant. You know. After you crushed it.", "You didn't happen to fall from the wall, did you?"], this.introducingMoyle7, this);
    },
    
    introducingMoyle7: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["The wall...", "..?"], this.introducingMoyle8, this);
    },
    
    introducingMoyle8: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["Oh, I just though you might be one of those people. Sky people, we call em.", "Live with their heads in the clouds. Yammering about blue pillars, and... boxes...", "What's your name?"], this.introducingMoyle9, this);
    },
    
    introducingMoyle9: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Um...", "Martin, I think?"], this.introducingMoyle10, this);
    },
    
    introducingMoyle10: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["You THINK?", "Well, whatever.", "Nice to meet you, Martin. The name's Moyle. Farmer dude."], this.introducingMoyle11, this);
    },
    
    introducingMoyle11: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["...", "How long have I-"], this.introducingMoyle12, this);
    },
    
    introducingMoyle12: function() {
        this.ui.newMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, "2 days.", 0, this.introducingMoyle13, this);
    },
    
    introducingMoyle13: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Wow.", "Thank you for looking after me.", "Sorry if I was a burden..."], this.introducingMoyle14, this);
    },
    
    introducingMoyle14: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["You weren't.", "I've been working outside for the last few days. Sheltering you was like, no effort for me. At all."], this.introducingMoyle15, this);
    },
    
    introducingMoyle15: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Well, still. I guess I owe you my life.", "Or, at the very least, a minor favor in the form of an initial fetch quest which ends with an unexpected twist."], this.introducingMoyle16, this);
    },
    
    introducingMoyle16: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["(Oh, I get it.)", "Well, I guess when you put it like that...", "There's something I lost a while ago that you could get for me.", "I tried sending my assistant, but he's far too cowardly to go look up there.", "The wall, you see... people don't like to go there. Gives them the creepy creeps.", "It's a satchel. S'got some stuff in it I need.", "But, it's dangerous..."], this.introducingMoyle17, this);
    },
    
    introducingMoyle17: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Understood! Be right back!", 0, this.introducingMoyle18, this);
    },
    
    introducingMoyle18: function() {
        this.thePlayer.enabled = true;
        this.thePlayer.jumpLevel = 0;
        this.objects[0].pose("moyleArmsFolded", 8000, this.introducingMoyle19, this);
    },
    
    introducingMoyle19: function() {
        this.thePlayer.enabled = false;
        this.objects[0].facingDirection = 0;
        
        if(this.ui.activeDialogs == 0) { // don't glitchily continue if the player is messing around
            this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["Having problems already?", "Gosh, there's more to this quest malarkey than meets the eye, ain't there?"], this.introducingMoyle20, this);
        } else {
            this.objects[0].pose("moyleArmsFolded", 1000, this.introducingMoyle19, this);
        }
    },
    
    introducingMoyle20: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["If only there was some kind of reverse-fall I could do here...", "..."], this.introducingMoyle21, this);
    },
    
    introducingMoyle21: function() {
        this.ui.sequenceMessageBox(this.objects[0].position.x + 12, this.objects[0].position.y - 20, ["Oh, for god's sake.", "Jump, you dummy. Jump!"], this.introducingMoyle22, this);
        this.thePlayer.jumpLevel = 1;
        this.thePlayer.showJumpIcon = true;
    },
    
    introducingMoyle22: function() {
        this.menusAllowed = true;
        
        this.aquireQuest("Moyle's Satchel", "Moyle wants me to look for a satchel he lost on the cliffs to the left. Let's get on it!");
        
        this.createRespawnPoint();
    },
    
    satchelGet: function() {
        this.thePlayer.enabled = false;
        
        if(this.progress < 1) {
            this.thePlayer.customSprite = "martinCrouch";

            this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "...last time I picked something up off the ground like this, bad things happened...", 0, this.satchelGet1, this);
        } else {
            this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "I already picked it up. There's just a patch of ground here.", 0, this.messagesOver, this);
        }
    },
    
    satchelGet1: function() {
        this.thePlayer.customSprite = "";
        this.thePlayer.loadTexture("playerMain");
        
        // remove satchel from map
        this.tWorld.manager.removeTile(55, 34, this.tWorld.layer3);
        
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Well, whatever...", 0, this.satchelGet2, this);
    },
    
    satchelGet2: function() {
        this.progress = 1;
        BasicGame.savedPlayerType = "playerMain";
        this.aquireItem("A Satchel", "Clue's in the name.", true);
    },
    
    wolfAttack: function() {
        if(this.progress == 1) {
            this.tWorld.musicData.stop();
            this.thePlayer.enabled = false;
            this.objects.push(new Actor(this.game, 16*32, 14*32, "wolf"));
            
            this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "...!", 0, this.wolfAttack1, this);
        }
    },
    
    wolfAttack1: function() {
        this.ui.newMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, "*growl*...", 0, this.wolfAttack2, this);
    },
    
    wolfAttack2: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Uh...", "Hey, little guy..."], this.wolfAttack3, this);
    },
    
    wolfAttack3: function() {
         this.ui.newMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, "rrrrrrRRRRRRRRRRRRRRRRRRRR!", 0, this.wolfAttack4, this);
    },
    
    wolfAttack4: function() {
        this.progress = 2;
        
        BasicGame.currentBattleColor = "#880000";
        BasicGame.currentBattleMusic = "standup";
        BasicGame.currentBattleBackground = "whiteShapes2";
        BasicGame.currentBattleStartDelay = 2000;

        BasicGame.currentBattleAttackers = [];
        BasicGame.currentBattleAttackers.push(new BattleActor(this.game, "Small Bad Wolf", "battleA_wolf", 2.1, 50, 0, 0x666666));
        
        var invList = [];
        var invList2 = [];

        for(var i = 0; i < this.inventoryItemsList.length; i++) {
            if(this.inventorySelectableList[i]) {
                invList.push(this.inventoryItemsList[i]);
                invList2.push(true);
            }
        }

        BasicGame.BattleInventory = invList;
        BasicGame.BattleInventorySelectable = invList2;

        this.game.state.start('Battle');
    },
    
    moreDialog: function() {
        if(this.respawned)
            return;
        
        this.thePlayer.enabled = false;
        this.thePlayer.interacting = false;
        this.thePlayer.facingDirection = 1;
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Oh, you're back.", "Got the satchel?"], this.moreDialog1, this);
    },
    
    moreDialog1: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "No.", 0, this.moreDialog2, this);
    },
    
    moreDialog2: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["...", "What did you come back for?"], this.moreDialog3, this);
    },
    
    moreDialog3: function() {
        this.thePlayer.pose("martinShrug", 200, this.moreDialog4, this);
    },
    
    moreDialog4: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Seeing if there was more dialog.", 0, this.moreDialog5, this);
    },
    
    moreDialog5: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["...", "I'm busy, Martin.", "I mean, seriously. Do you know how much work it is, standing here all day?", "...", "Oh, just go. Get the satchel, then come back."], this.messagesOver, this);
    },
    
    moyleQuestFinish: function() {
        this.thePlayer.enabled = false;
        this.thePlayer.interacting = false;
        
        this.thePlayer.facingDirection = 1;
        
        this.thePlayer.position.x += 48;
        
        // create chaff in the doorway but make him invisible for now
        this.objects.push(new Actor(this.game, 6*32, 32*32, "chaff"));
        this.objects[1].alpha = 0;
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Oh, you're back.", "Got the satchel?"], this.moyleQuestFinish1, this);
    },
    
    moyleQuestFinish1: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Yep. I got attacked by a wolf, by the way.", 0, this.moyleQuestFinish2, this);
    },
    
    moyleQuestFinish2: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Yeah, that happens. Let's see...", "...?", "That's not my satchel you have there, Martin.", "...In fact, I've never seen that before."], this.moyleQuestFinish3, this);
    },
    
    moyleQuestFinish3: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["What? But I found it in the cliffs and fought a wolf to get it back...", "The only other satchel I've seen is..."], this.moyleQuestFinish4, this);
    },
    
    moyleQuestFinish4: function() {
        this.objects[1].alpha = 1;
        this.ui.sequenceMessageBox(this.objects[1].x + 12, this.objects[1].y - 20, ["Hey, boss. I finished moving those boxes.", "What's this about a satchel?"], this.moyleQuestFinish5, this);
    },
    
    moyleQuestFinish5: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["...", "What are you wearing there, Chaff?", "That wouldn't be mine, by any chance?"], this.moyleQuestFinish6, this);
        this.objects[0].customSprite = "moyleArmsFolded";
    },
    
    moyleQuestFinish6: function() {
        this.objects[0].facingDirection = 1;
        this.objects[0].customSprite = "";
        
        this.ui.sequenceMessageBox(this.objects[1].x + 12, this.objects[1].y - 20, ["Yeah, I was using your tools.", "...", "Um...", "What are you both sighing about..?"], this.moyleQuestFinish7, this);
    },
    
    moyleQuestFinish7: function() {
        this.objects[0].facingDirection = 0;
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Never mind.", "Well, I don't know whose satchel that was, Martin, but it's yours now.", "Finders keepers, I guess. You can put stuff you find in there."], this.moyleQuestFinish8, this);
    },
    
    moyleQuestFinish8: function() {
        this.ui.newMessageBox(this.objects[1].x + 12, this.objects[1].y - 20, "I'm gonna go back outside, boss.", 0, this.moyleQuestFinish9, this);
    },
    
    moyleQuestFinish9: function() {
        this.objects[1].alpha = 0;
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["So, um...", "What now?", "I mean, I don't know how I got here, and it was awfully nice of you to help me out and everything, but I kind of need to be getting home..."], this.moyleQuestFinish10, this);
    },
    
    moyleQuestFinish10: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["...", "I'm honestly not too sure what to tell you, Martin.", "I reckon you should go up to Yarnberg.", "It's a little town not far from here.", "Although you have to go through the mines... but seeing how you say you handled the wolf without running away, you should be fine.", "If you're a sky person, you need to talk to Jeff. He'll help you find your way home. Or do the next best thing...", "Anyway, thanks for the help.", "If you need a job in the miller village, I'm your man.", "Just make sure you don't squash any more nectar bushes. I LIVE off those..."], this.moyleQuestFinish11, this);
    },
    
    moyleQuestFinish11: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Alright...", "Goodbye, then."], this.moyleQuestFinish12, this);
    },
    
    moyleQuestFinish12: function() {
        this.completeQuest("Moyle's Satchel");
        this.aquireQuest("Welcome To The Other World", "I need to go to a place called Yarnberg. According to Moyle, there are people there who can help me.");
        
        this.progress = 4;
        
        this.createRespawnPoint();
    },
    
    introducingJeff: function() {
        this.thePlayer.enabled = false;
        this.thePlayer.interacting = false;
        
        this.thePlayer.facingDirection = 0;
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["So, if we just put two people on the barn overnight, guard the place... Huh?", "What was...? Oh."], this.introducingJeff1, this);
    },
    
    introducingJeff1: function() {
        this.thePlayer.facingDirection = 1;
        
        this.objects[0].customSprite = "jeffLook";
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["OH.", "That's your game, is it?", "Hanging around down there? Listening in on my little monolouge?"], this.introducingJeff2, this);
    },
    
    introducingJeff2: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Um...", "Not on purpose...?"], this.introducingJeff3, this);
    },
    
    introducingJeff3: function() {
        this.objects[0].customSprite = "";
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Hah.", "Come up here."], this.messagesOver, this);
    },
    
    jeffQuest: function() {
        this.thePlayer.enabled = false;
        this.thePlayer.interacting = false;
        
        this.thePlayer.facingDirection = 1;
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["...", "Martin, is it?"], this.jeffQuest1, this);
    },
    
    jeffQuest1: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "How did you know?", 0, this.jeffQuest2, this);
    },
    
    jeffQuest2: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Says on the hat.", "Anyway...", "Martin, my man, that was horrifying.", "Your jumping technique is flawed to the extreme."], this.jeffQuest3, this);
    },
    
    jeffQuest3: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Yeah, i've heard-", 0, this.jeffQuest4, this);
    },
    
    jeffQuest4: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Look out of one of these windows, Martin.", "There are biologically inert flora growing in the lake down there that have developed greater jumping capability than you."], this.jeffQuest5, this);
    },
    
    jeffQuest5: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Okay, but Moyle-", 0, this.jeffQuest6, this);
    },
    
    jeffQuest6: function() {
        this.ui.newMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, "I have seen iron wraught anvils with more air mobility than you, Martin.", 0, this.jeffQuest7, this);
    },
    
    jeffQuest7: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "Okay, Fine. But-", 0, this.jeffQuest8, this);
    },
    
    jeffQuest8: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Martin, if you would allow me to finish.", "You demonstrate similar confidence in the air perhaps to a man who learned to jump on a roundabout...", "And your lackluster efficiency and bad sense of timing, what not, means that you had to cross most of the room just to get to me.", "Those extra platforms you just tread on are HARDLY used, Martin. They are here exclusively for the use of people like you.", "Does it not bother you that your ability could be so much more, if only you were to master the art of the double jump-"], this.jeffQuest9, this);
    },
    
    jeffQuest9: function() {
        this.objects[0].customSprite = "jeffLook";
        this.thePlayer.customSprite = "martinYell";
        
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["WILL YOU DROP IT!?", "...ahem. Sorry..."], this.jeffQuest10, this);
    },
    
    jeffQuest10: function() {
        this.objects[0].customSprite = "";
        this.thePlayer.customSprite = "";
        
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["No, no, my apologies, Martin...", "Moyle, the man you mentioned, has been in contact.", "It seems he found you near the wall, from which I assume you fell.", "You are a sky person, correct? From the world above?"], this.jeffQuest11, this);
    },
    
    jeffQuest11: function() {
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["I think so.", "Though I'm not entirely sure what the term means..."], this.jeffQuest12, this);
    },
    
    jeffQuest12: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Well, Martin, if you want to get home, there's something you should know.", "You are not unique. Sky people have come by here before, many times, though you may be the only one that had the pleasure of meeting Moyle. And many of them had bad jumps, like you, too."], this.jeffQuest13, this);
    },
    
    jeffQuest13: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "I'd like to see you jump.", 0, this.jeffQuest14, this);
    },
    
    jeffQuest14: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["I'd rather avoid the strain.", "Anyhow, Martin, all of them wanted to get home. All of them were lost.", "And I could offer no assistance."], this.jeffQuest15, this);
    },
    
    jeffQuest15: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "...where are they now?", 0, this.jeffQuest16, this);
    },
    
    jeffQuest16: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["They have gone on.", "I gave them lodging, and eventually, they all left. Gone off to lands other than this one, over the seas and far away.", "I haven't heard from any of them for a time. It is possible that some could still be there."], this.jeffQuest17, this);
    },
    
    jeffQuest17: function() {
        this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "There are lands here other than this one?", 0, this.jeffQuest18, this);
    },
    
    jeffQuest18: function() {
        this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["My point, Martin:", "I feel that you could not have picked a worse time or place to show up.", "Even the bad lands have not suffered plauges as sudden as this one. And I can see by the tears in your clothes that you have met them too.", "Creatures. Wolves, some would say. Wolves that don't act like wolves, but...", "Well. That's another story entirely.", "I can offer you shelter, Martin, but nothing more.", "If you feel you must do something in return, I have some tasks for you."], this.jeffQuest19, this);
    },
    
    jeffQuest19: function() {
        this.ui.newOptionsBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["   Thank you. I'll go now.", " Go on...", "  What was that about other lands?"], [1, 1, 1], this.jeffQuestion, this);
    },
    
    jeffRetalk: function() {
        this.thePlayer.enabled = false;
        this.thePlayer.interacting = false;
        
        this.thePlayer.facingDirection = 1;
        
        this.ui.newMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, "Welcome back to my office, Martin. Need something?", 0, this.jeffRetalk1, this);
    },
    
    jeffRetalk1: function() {
        this.ui.newOptionsBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["   No. Just popping in to say hi.", "  About those jobs you had for me...", "  What was that about other lands?", "  This is a platform."], [1, 1, 1, 1], this.jeffQuestion, this);
    },
    
    jeffQuestion: function(selection) {
        if(selection == 0) {
            if(this.hasQuest("Welcome To The Other World")) {
                this.completeQuest("Welcome To The Other World");
            }
            
            this.messagesOver();
        }
        else if(selection == 1) {
            this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["First of all, I need to know you feel up to it. It's dangerous. You've been attacked on the way here.", "Yarnberg is a safe, guarded place. You do not have to do something you do not wish to do. I hope you understand that.", "Anyway.", "Not far from here are paths to several places. One goes to a forest, with a tower which, if intelligence informs me correctly, may contain something useful to you.", "Another goes off to an old temple that is not used any more. By anyone. Not very religious around here any more, you see.", "There are artifacts there that could prove useful to the people of this town. Obtaining them would definitely improve things.", "There's also the matter of the unusable mines, which seem to have picked up an infestation...", "They are in dire need of some... 'care' shall we say. But you'll need to learn to double jump before you can reach those.", "And finally, there is pauline bridge, which, as it leads to the only portal from the green lands to the other worlds, is in dire need of repair and has been for a time. It burned down, you see. Just a week ago.", "I have reason to beleive this was not an accident. A repair effort is under way, but if you can track down the perportrators... it would be MOST useful, what not.", "So? Interested in any of that?"], this.jeffQuests, this);
        }
        else if(selection == 2) {
            this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Well... it's a long story.", "Right now we're in the green lands. Easy to identify - yellow sky, vibrant colors, lots of grass...", "And a long time ago, people just like us found the Greenlands. They found them first, but soon they sailed across the sea and found other places.", "There's the Badlands - the exact opposite of here, in a manner of speaking...", "There's the Cloudlands, which aren't so much populated by humans any more as by their native species... but that's another story...", "And there's the Edgelands, which I'm told are rather nice this time of year.", "And of course, there's the wall. Which surrounds the whole world, and, as we know from all the expedition attempts, doesn't have any beginning or end.", "In order to avoid long sea voyages to get across the world, portals were set up quite a while ago connecting each of the lands. We have one, but we must repair pauline bridge to reach it again.", "King's group seem to have their act together - we can see them in the distance now, building their side of the bridge towards us.", "Let's hope things continue to go well on that front.", "Anyway, that's the world. Now you know as much as I do. And I've only left the Greenlands once."], this.jeffRetalk1, this);
        }
        else if(selection == 3) {
            this.ui.newMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, "Slanderous remarks like that will not win you friends in the civic industries, Martin.", 0, this.jeffRetalk1, this);
        }
    },
    
    jeffQuests: function() {
        this.ui.newOptionsBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["  The tower sounds interesting.", "  Tell me about the Temple.", "     The suicide mission to the mines sounds like fun.", "  I'll take the bridge case.", " Never mind..."], [!this.hasQuest("The Tower "), 1, 1, 1, 1], this.jeffQuestsSelect, this);
    },
    
    jeffQuestsSelect: function(selection) {
        if(selection == 0) {
            this.aquireQuest("The Tower ", "Jeff wants me to go to the forest and raid the tower there for... something that will be useful to me. His words, not mine.");
            
            this.aquireItem("Tower Key", "Jeff gave me this. It opens a passage to the tower. I still don't get why I can't use the front door...", true);
            
            if(this.hasQuest("Welcome To The Other World")) {
                this.completeQuest("Welcome To The Other World");
            }
        }
        else if(selection == 4) {
            this.ui.newMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, "Pansy.", 0, this.jeffRetalk1, this);
        }
        else {
            this.ui.sequenceMessageBox(this.objects[0].x + 12, this.objects[0].y - 20, ["Aha. No, that's not in the game yet.", "Be a good alpha tester and select the tower quest."], this.jeffQuests, this);
        }
    },
    
    dbJumpGet: function() {
        this.thePlayer.enabled = false;
        this.thePlayer.interacting = false;
        
        this.tWorld.musicData.fadeOut(2000);
        
        this.ui.sequenceMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, ["Well, that took a while.", "I suppose this is my reward? Let's see...", "..."], this.gameCut, this);
    },
    
    gameCut: function() {
        this.camera.unfollow();
        
        this.tWorld.unloadArea();
        this.allow_respawn = false;
        
        this.ui.sequenceMessageBox(this.game.camera.position.x, this.game.camera.position.y, ["We hope you enjoyed this mess Tech Demo.", "If you want to see more, take a look at the main page of our site, memorymelt.net. We'll have news there soon.", "Thanks for playing!"], null, null);
    },
    
    // ----------------------------------------------
    
    moyleQuestCheck: function() {
        // prevent the player from progressing without M's satchel
        if(this.progress == 0) {
            this.progress = -1;
            this.thePlayer.enabled = false;
            this.thePlayer.interacting = false;
            this.ui.sequenceMessageBox(this.objects[2].x + 12, this.objects[2].y - 20, ["...I have to move all of these?", "Damn..."], this.messagesOver, this);
        }
        
        if(this.progress < 3) {
            this.tWorld.loadArea("WindMillsBlocked");
            
            // fix the windmills.
            for(var i = 0; i < this.objects.length; i++) {
                this.objects[i].bringToTop();
            }
            
            //this.tWorld.layer5.bringToTop();
        }
    },
    
    moyleSatchelCheck: function() {
        if(this.progress < 1) {
            this.thePlayer.enabled = false;
            this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "There it is.", 0, this.messagesOver, this);
        } else {
            // remove satchel from map
            this.tWorld.manager.removeTile(55, 34, this.tWorld.layer3);
        }
    },
    
    moyleFinishCheck: function() {
        if(this.respawned)
            return;
        
        if(this.progress < 2) {
            this.moreDialog();
        }
        else if(this.progress < 3) {
            this.moyleQuestFinish();
        }
    },
    
    hubEnterCheck: function() {
        //if(this.progress < 5) {
        //    this.tWorld.loadArea("HUB2");
        //}
        
        // nvm
    },
    
    townHallCheck: function() {
        if(this.progress < 5) {
            // let's talk
            this.introducingJeff();
        }
    },
    
    talkToJeff: function() {
        if(this.progress < 5) {
            this.progress = 5;
            this.thePlayer.enabled = false;
            this.thePlayer.interacting = false;
            
            this.jeffQuest();
        }
        else if(this.progress == 5) {
            this.jeffRetalk();
        }
    },
    
    enterTower: function() {
        if(!this.hasItem(" Tower Key")) {
            this.thePlayer.enabled = false;
            this.thePlayer.interacting = false;
            
            this.ui.newMessageBox(this.thePlayer.x + 12, this.thePlayer.y - 20, "I need a key...", 0, this.messagesOver, this);
        } else {
            this.screenFadeSurface.alpha = 1;
            this.clearObjects();
            
            this.tWorld.loadArea("tower1");
            BasicGame.savedLevel = "tower1";
            
            this.thePlayer.position.x = 4 * 32;
            this.thePlayer.position.y = (77 * 32) - 18;

            // load objects from tWorld map
            this.loadMapObjects();

            this.screenFadeSurface.bringToTop();
            this.bringDarkMaskToTop();                       
        }
    }
};
