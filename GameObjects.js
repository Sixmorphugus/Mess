// Contents
// - [FO] Stuff
// - [GO] Game Objects (kept in array in game manager)
// - [UO] Utility Objects

// [FO] FUNCTIONS JAVASCRIPT SHOULD HAVE BUT DOESN'T (DO I HAVE TO DO EVERYTHING AROUND HERE?)
String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

String.prototype.removeCharacter = function (index) {
    if (index < this.length-1)
        return this.substring(0, index) + this.substring(index+1, this.length);
    else
        return this.substring(0, this.length-1);
};

// [GO] GAME OBJECTS

// BasicObject - wrap the phaser sprite so that we can protect ourselves from reference errors
Basic = function (game, spawnX, spawnY, spritesheet) {
    //  We call the Phaser.Sprite passing in the game reference
    Phaser.Sprite.call(this, game, spawnX, spawnY, spritesheet);
    game.add.existing(this);
    
    this.spinSpeed = randomIntFromInterval(5, 9) / 1000;
    
    this.isPersistent = false;
    this.spin = true;
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

Basic.prototype = Object.create(Phaser.Sprite.prototype);
Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
    if(this.spin) {
        this.rotation += this.spinSpeed;
    }
};

// Actor - animated sprite that moves with arcade physics in response to WASD input/arrow keys.
Actor = function (game, spawnX, spawnY, spritesheet) {
    //  We call the Phaser.Sprite passing in the game reference
    Phaser.Sprite.call(this, game, spawnX, spawnY, spritesheet);
    game.add.existing(this);

    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.inputRef = game.input;

    // Player movement constants:
    this.PMAX_SPEED = 200; // pixels/second
    this.PACCELERATION = 150000; // pixels/second/second
    this.PDRAG = 6000; // pixels/second
    this.PGRAVITY = 1600; // pixels/second/second
    this.PJUMP_SPEED = -550; // pixels/second (negative y is up)
    this.jumpTimes = 0; // jumps

    // Make player collide with world boundaries so he doesn't leave the stage
    //this.body.collideWorldBounds = true;

    // Set player minimum and maximum movement speed
    this.body.maxVelocity.setTo(this.PMAX_SPEED, this.PMAX_SPEED * 3); // x, y

    // Add drag to the player that slows them down when they are not accelerating
    this.body.drag.setTo(this.PDRAG, 0); // x, y

    // Since we're jumping we need gravity
    this.body.gravity.y = this.PGRAVITY;

    // visual animation
    this.animations.add("idleR", [0, 1, 2], 2, true);
    this.animations.add("idleL", [6, 7, 8], 2, true);
    this.animations.add("walkR", [12, 13, 14, 15, 16, 17], 11, true);
    this.animations.add("walkL", [23, 22, 21, 20, 19, 18], 11, true);
    this.animations.add("jumpR", [5], 2, false);
    this.animations.add("jumpL", [11], 2, false);

    this.facingDirection = 1;
    this.walking = false;
    this.doJump = false;
    this.examine = false;
    
    this.justLanded = false;
    this.jumpLevel = 0;

    this.enabled = true;
    this.controllable = false;
    
    this.customSprite = "";
    this.lastCustomSprite = "";
    this.usingCustomSprite = false;
    this.customSpriteData = null;
    this.animateCustomSprite = false;
    
    if(!game.device.desktop) {
        this.touchMoveAllowed = true;
    } else {
        this.touchMoveAllowed = false;
    }
    
    //this.touchMoveAllowed = true;
    
    this.isPersistent = false;
    
    // Setup SFX
    this.jump = game.add.audio('playerJump');
    this.land = game.add.audio('playerLand');
    this.step = game.add.audio('playerStep');
    
    this.interactIcon = game.add.sprite(0, 0, 'canInteract');
    this.interactIcon.alpha = 0;
    this.showInteractIcon = false;
    
    this.moveIcon = game.add.sprite(0, 0, 'canMove');
    this.moveIcon.alpha = 0;
    this.showMoveIcon = false;
    
    this.jumpIcon = game.add.sprite(0, 0, 'canJump');
    this.jumpIcon.alpha = 0;
    this.showJumpIcon = false;
    
    // setup touch
    game.input.onDown.add(this.touchMove, this);
    game.input.onUp.add(this.touchMoveStop, this);
    game.input.onTap.add(this.touchJump, this);
    
    this.debugMode = false;
    
    this.poseCallback = null;
    this.poseCallbackContext = null;
    this.poseStartTime = 0;
    this.poseTime = 0;
    this.poseActive = false;
    
    this.fallSpeed = 0;
}

Actor.prototype = Object.create(Phaser.Sprite.prototype);
Actor.prototype.constructor = Actor;

Actor.prototype.update = function() {
    if(this.poseActive) {
        if(this.game.time.elapsedSince(this.poseStartTime) >= this.poseTime) {
            this.poseEnd();
        }
    }
    
    this.interactIcon.position.set(this.position.x, this.position.y - 32);
    this.moveIcon.position.set(this.position.x - 16, this.position.y - 32);
    this.jumpIcon.position.set(this.position.x, this.position.y - 32);
    
    // interact icon
    if(this.showInteractIcon && this.enabled && this.interactIcon.alpha < 0.9) {
        this.interactIcon.alpha += 0.1;
    }
    else if(this.interactIcon.alpha > 0) {
        this.interactIcon.alpha -= 0.1;
    }
    
    if(this.interactIcon.alpha < 0) {
        this.interactIcon.alpha = 0;
    }
    
    // move icon (same code, different icon)
    if(this.showMoveIcon && this.enabled && this.moveIcon.alpha < 0.9) {
        this.moveIcon.alpha += 0.05;;
    }
    else if(this.moveIcon.alpha > 0) {
        this.moveIcon.alpha -= 0.01;
    }
    
    if(this.moveIcon.alpha < 0) {
        this.moveIcon.alpha = 0;
    }
    
    if(this.walking) {
        this.showMoveIcon = false;
    }
    
    // jump icon
    if(this.showJumpIcon && this.enabled && this.jumpIcon.alpha < 0.9) {
        this.jumpIcon.alpha += 0.05;;
    }
    else if(this.jumpIcon.alpha > 0) {
        this.jumpIcon.alpha -= 0.01;
    }
    
    if(this.jumpIcon.alpha < 0) {
        this.jumpIcon.alpha = 0;
    }
    
    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.body.blocked.down;
    
    if(!onTheGround) {
        this.justLanded = true;
    } else {
        this.jumpTimes = 0;
    }

    // Movement
    if(this.enabled && this.controllable && !this.touchMoveAllowed) {
        this.examine = false;
        this.interacting = false;
        
        if (this.inputRef.keyboard.isDown(Phaser.Keyboard.A) || this.inputRef.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.facingDirection = 0;
            this.walking = 1;
        } else if (this.inputRef.keyboard.isDown(Phaser.Keyboard.D) || this.inputRef.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.facingDirection = 1;
            this.walking = true;
        } else {
            this.walking = false;
        }

        if(this.inputRef.keyboard.downDuration(Phaser.Keyboard.S, 1) || this.inputRef.keyboard.downDuration(Phaser.Keyboard.DOWN, 1)) {
            this.examine = true;
        }
            
        // Set the jumpTimes to 1 for when the player is a N00B.
        if ((this.inputRef.keyboard.downDuration(Phaser.Keyboard.W, 1) || this.inputRef.keyboard.downDuration(Phaser.Keyboard.UP, 1)) && (this.jumpTimes < this.jumpLevel || this.debugMode))  {
            this.doJump = true;
        }
        
        if(this.inputRef.keyboard.downDuration(Phaser.Keyboard.O, 10) && this.inputRef.keyboard.downDuration(Phaser.Keyboard.P, 10)) {
            this.debugMode = !this.debugMode;
            
            this.debugModeCheck();
        }
    }
    
    if(this.controllable && !this.enabled) {
        // make sure player controlled actors stop when disabled
        this.body.acceleration.x = 0;
        
        this.walking = false;
        this.examine = false;
    }
    
    if(this.doJump) {
        this.showJumpIcon = false;
        this.doJump = false;
        
        this.jumpTimes++;
        
        if(BasicGame.playSFX) {
            this.jump.play('', 0, BasicGame.sfxVol);
        }
        
        this.body.velocity.y = this.PJUMP_SPEED;
    }

    // Sort animation out
    if(onTheGround) {
        if(this.justLanded == true) {
            //console.log("just landed, speed " + this.fallSpeed);
            if(this.enabled && this.fallSpeed >= 600 && BasicGame.playSFX) {
                this.land.play('', 0, BasicGame.sfxVol);
            }
            
            this.justLanded = false;
        }
        
        this.fallSpeed = 0;
        
        if(this.walking) {
            if(!this.step.isPlaying && BasicGame.playSFX) {
                this.step.play('', 0, BasicGame.sfxVol);
            }
            
            if(this.facingDirection) {
                // walk right
                this.animations.play("walkR")
                this.body.acceleration.x = this.PACCELERATION;
            } else {
                // walk left
                this.animations.play("walkL")
                this.body.acceleration.x = -this.PACCELERATION;
            }
        } else {
            this.body.acceleration.x = 0;

            if(this.step.isPlaying) {
                this.step.stop();
            }

            if(this.facingDirection) {
                // idle right
                this.animations.play("idleR")
            } else {
                // idle left
                this.animations.play("idleL")
            }
        }
    } else {
        this.fallSpeed = this.body.velocity.y;
            
        if(this.step.isPlaying) {
            this.step.stop();
        }

        if(this.facingDirection) {
            // jump/fall right
            this.animations.play("jumpR")
        } else {
            // jump/fall left
            this.animations.play("jumpL")
        }
        
        if(this.walking) {
            if(this.facingDirection) {
                this.body.acceleration.x = this.PACCELERATION / 2;
            } else {
                this.body.acceleration.x = -this.PACCELERATION / 2;
            }
        } else {
            this.body.acceleration.x = 0;
        }
    }
    
    // Custom Sprite
    if(!this.usingCustomSprite) {
        if(this.customSprite != "") {
            this.usingCustomSprite = true;
            this.customSpriteData = this.game.add.sprite(this.position.x, this.position.y, this.customSprite);
            this.alpha = 0;
        }
    } else {
        this.customSpriteData.position.set(this.position.x, this.position.y);
        
        if(this.customSprite != this.lastCustomSprite) {
            this.customSpriteData.destroy();
            this.usingCustomSprite = false;
        }
        
        this.lastCustomSprite = this.customSprite;
        
        if(this.customSprite == "") {
            this.usingCustomSprite == false;
            this.alpha = 1;
            this.customSpriteData.destroy();
        }
    }

};

Actor.prototype.pose = function(pose, time, callback, callbackContext) {
    this.poseActive = true;
    
    this.customSprite = pose;
    this.poseCallback = callback;
    this.poseCallbackContext = callbackContext;
    
    this.poseStartTime = this.game.time.time;
    this.poseTime = time;
}

Actor.prototype.poseEnd = function() {
    this.poseActive = false;
    
    this.customSprite = "";
    
    if(this.poseCallback != null) {
        this.poseCallback.call(this.poseCallbackContext);
    }
}

Actor.prototype.debugModeCheck = function() {
    if(this.debugMode) {
        this.body.maxVelocity.setTo(this.PMAX_SPEED * 3, this.PMAX_SPEED * 5); // x, y
    } else {
        this.body.maxVelocity.setTo(this.PMAX_SPEED, this.PMAX_SPEED * 5); // x, y
    }
}

Actor.prototype.touchMove = function(peram) {
    if(!this.touchMoveAllowed || !this.controllable) {
        return;
    }
    
    this.walking = true;
    
    var touchPos = peram.positionDown;
    if(touchPos.x < (this.game.canvas.width / 2) - 200) {
        this.facingDirection = 0;
    } else if(touchPos.x > (this.game.canvas.width / 2) + 200) {
        this.facingDirection = 1;
    } else {
        this.examine = true;
    }
};

Actor.prototype.touchJump = function(peram) {
    if(!this.touchMoveAllowed || !this.controllable) {
        return;
    }
    
    if(touchPos.x > (this.game.canvas.width / 2) - 200 && touchPos.x < (this.game.canvas.width / 2) + 200 && this.jumpTimes < this.jumpLevel && this.enabled) {
        this.doJump = true;
    }
};


Actor.prototype.touchMoveStop = function(peram) {
    if(!this.touchMoveAllowed || !this.controllable) {
        return;
    }
    
    this.walking = false;
    this.examine = false;
};

// [UO] UTILITIES TO MAKE THINGS EASIER

// World Object - special object that holds the world and all its layers, as well as storing collision data for objects such as actors to use
MessWorld = function (game) {
    this.game = game;
    
    this.manager = null;
    this.data = null;
    this.musicData = null;
    
    this.music = "";
    this.name = "";
    
    this.loadedKey = "";
    
    this.backgroundGroup = new Phaser.Group(game);
    
    this.colLayer = null;
    
    this.bgImage = null;
    
    this.lvlText = null;
    
    this.layer1 = null;
    this.layer2 = null;
    this.layer3 = null;
    this.layer4 = null;
    
    this.loaded = false;
}

MessWorld.prototype.constructor = MessWorld;

MessWorld.prototype.setDebug = function(dbg) {
    this.layer4.debug = dbg;
}

MessWorld.prototype.loadArea = function(name) {
    console.log("[MESS] loading map " + name);
    
    if(this.manager != null) {
        this.unloadArea();
    }
    
    if(this.name == null) {
        this.musicData.destroy();
        
        this.musicData = null;
        this.music = "";
        
        this.name = "";
        
        return;
    }
    
    this.loaded = true;
    
    // load tilemap
    this.manager = this.game.add.tilemap(name);
    this.data = this.manager.properties;
    
    // load tileset
    this.manager.addTilesetImage("WorldTiles");
    
    // load background image
    
    if(this.data.bgImage != null) {
        this.bgImage = this.game.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, this.data.bgImage);
        this.bgImage.fixedToCamera = true;
   
        this.backgroundGroup.add(this.bgImage);
    }
    
    
    // load layers - don't bother with the paralax layer on phones
    if (BasicGame.parallaxEnabled) {
        this.layer1 = this.manager.createLayer("backgroundParalax");
    }
    
    this.layer2 = this.manager.createLayer("backgroundFixed");
    this.layer3 = this.manager.createLayer("noCol");
    this.layer4 = this.manager.createLayer("col");
    this.layer5 = this.manager.createLayer("foregroundFixed");
    
    if (BasicGame.parallaxEnabled) {
        this.backgroundGroup.add(this.layer1);
    }
    
    this.backgroundGroup.add(this.layer2);
    this.backgroundGroup.add(this.layer3);
    
    this.layer4.resizeWorld();
    
    if (BasicGame.parallaxEnabled) { // don't bother with paralax on phones as it lags them to death
        if(this.data.xParalaxShift != null) {
            this.layer1.scrollFactorX = this.data.xParalaxShift;
        }
        
        if(this.data.yParalaxShift != null) {
            this.layer1.scrollFactorY = this.data.yParalaxShift;
        }
    }
    
    // setup COL layer
    this.manager.setCollisionBetween(0, 720, true, this.layer4);
    this.colLayer = this.layer4;
    
    if(BasicGame.displayColliders)
        this.layer4.debug = true;
    
    // load map data
    this.game.stage.backgroundColor = this.data.bgcol;
    
    if(this.name != this.data.areaName) {
        this.name = this.data.areaName;
        this.lastNameUpdate = this.game.time.time;
    }
    
    // music!
    if(this.music != this.data.music) {
        this.music = this.data.music;
        
        if(this.musicData != null) {
            this.musicData.destroy();
            this.musicData = null;
        }
        
        if(this.music != "") {
            this.musicData = this.game.add.audio(this.music);
            
            if(BasicGame.playMusic)
                this.musicData.play('', 0, BasicGame.musicVol, true);
        }
    }
    
    this.loadedKey = name;
};

MessWorld.prototype.unloadArea = function() {
    if (BasicGame.parallaxEnabled) {
        this.layer1.destroy(); // no paralax layer on phones
    }
    
    this.layer2.destroy();
    this.layer3.destroy();
    this.layer4.destroy();
    this.layer5.destroy();
    
    this.manager.destroy();
    this.manager = null;
    
    if(this.bgImage != null) {
        this.bgImage.destroy();
        this.bgImage = null;
    }
    
    this.loaded = false;
    this.loadedKey = "";
};

MessWorld.prototype.getInteractData = function(posX, posY) {
    for(var i = 0; i < this.data.interactableTiles.length; i++) {
        var tile = this.data.interactableTiles[i];
        
        if(tile.posX == posX && tile.posY == posY) {
            // found
            return tile;
        }
    }
    
    // found nothing! fuck!
    return null;
}

MessWorld.prototype.doCollisionCheck = function(colObj) {
    if(this.manager == null) {
        return;
    }

    this.game.physics.arcade.collide(colObj, this.colLayer);
}

// Message box
MsgBox = function (game, spawnX, spawnY, mWidth, type, var0, var1, callback, callbackObj) {
    spawnX = Math.floor(spawnX);
    spawnY = Math.floor(spawnY);
    
    this.timePlaced = game.time.time;
    this.destroyAfter = 0;
    
    this.advanceSound = game.add.audio("speach");
    this.selectSound = game.add.audio("select");
    
    this.origin = new Phaser.Point(spawnX, spawnY);
    
    if(this.origin.x < (mWidth / 2) + 10) {
        this.origin.x = (mWidth / 2) + 10;
    }
    
    this.game = game;
    
    this.rect = this.game.add.sprite(spawnX, spawnY, "ui" + BasicGame.uiTheme);
    this.rect.alpha = 0;
    //this.rect.tint = 0x111111;
    
    this.boarders = [];
    this.boarders.push(this.game.add.sprite(spawnX, spawnY, "whiteout"));
    this.boarders.push(this.game.add.sprite(spawnX, spawnY, "whiteout"));
    this.boarders.push(this.game.add.sprite(spawnX, spawnY, "whiteout"));
    this.boarders.push(this.game.add.sprite(spawnX, spawnY, "whiteout"));
    
    this.boarders[0].alpha = 0;
    this.boarders[1].alpha = 0;
    this.boarders[2].alpha = 0;
    this.boarders[3].alpha = 0;
    
    this.rect.width = 0;
    this.rect.height = 0;
    
    this.rect.alpha = 0;
    
    this.boxType = type;
    this.boxPerams1 = var0;
    this.boxPerams2 = var1;
    
    this.result = -1;
    
    this.deleteMe = false;
    
    this.referenceText = [];
    this.visibleText = [];
    
    this.maxWidth = mWidth;
    
    this.callback = callback;
    this.callbackObj = callbackObj;
    
    this.selectedOp = 0;
    this.opChange = false;
    this.opDown = true;
    
    this.calculateAppearence();
}

MsgBox.prototype.constructor = MsgBox;

MsgBox.prototype.skipFade = function() {
    this.rect.alpha = 0.9;
    
    this.boarders[0].alpha = 0.9;
    this.boarders[1].alpha = 0.9;
    this.boarders[2].alpha = 0.9;
    this.boarders[3].alpha = 0.9;
}

MsgBox.prototype.prepareDelete = function() {
    this.deleteMe = true; // tell the uiManager to get rid of us in the next update tick
    
    // remove shared
    this.rect.destroy();
    
    //this.advanceSound.destroy();
    
    this.boarders[0].destroy();
    this.boarders[1].destroy();
    this.boarders[2].destroy();
    this.boarders[3].destroy();
    
    if(this.continuer != null) {
        this.continuer.destroy();
    }
    
    // remove any text lines
    for(var i = 0; i < this.referenceText.length; i++) {
        this.referenceText[i].destroy();
        this.visibleText[i].destroy();
    }
    
    // call callbacks
    if(this.callback != null) {
        if(this.result != -1) {
            this.callback.call(this.callbackObj, this.result);
        }
        else {
            this.callback.call(this.callbackObj);
        }
    }
}

MsgBox.prototype.calculateTextLines = function() {
    var string = this.boxPerams1;
    var assumedLetterWidth = 12;
    var lettersToFillBox = Math.floor(this.maxWidth / assumedLetterWidth);
    
    var lCount = 0;
    
    for(var i = 0; i < string.length; i++) {
        lCount += 1;
        
        if(lCount > lettersToFillBox) {
            insertNewLineAt = i;
            
            while(string[insertNewLineAt] != " ") {
                insertNewLineAt -= 1;
            }
            
            string = string.replaceAt(insertNewLineAt, "#");
            
            lCount = 0;
        }
    }
    
    var linesToCreate = string.split("#");
    
    for(var i = 0; i < linesToCreate.length; i++) {
        this.referenceText.push(this.game.add.bitmapText(this.rect.x + 4, this.rect.y + 4 + (i * 22), "goldfishWhite", linesToCreate[i], 18));
        this.visibleText.push(this.game.add.bitmapText(this.rect.x + 4, this.rect.y + 4 + (i * 22), "goldfishWhite", "", 18));
        
        this.referenceText[i].updateTransform();
        this.visibleText[i].updateTransform();
        
        this.visibleText[i].stage = 0;
        this.referenceText[i].alpha = 0;
    }
}

MsgBox.prototype.calculateOptionLines = function() {
    var linesToCreate = this.boxPerams1;
    
    for(var i = 0; i < linesToCreate.length; i++) {
        this.referenceText.push(this.game.add.bitmapText(this.rect.x + 4, this.rect.y + 4 + (i * 22), "goldfishWhite", linesToCreate[i], 18));
        this.visibleText.push(this.game.add.bitmapText(this.rect.x + 4, this.rect.y + 4 + (i * 22), "goldfishWhite", "", 18));
        
        this.referenceText[i].updateTransform();
        this.visibleText[i].updateTransform();
        
        this.visibleText[i].stage = 0;
        this.referenceText[i].alpha = 0;
        
        // check if disabled
        if(this.boxPerams2[i] == -1) { // menu art
            this.visibleText[i].alpha = 0.1;
            this.referenceText[i].noSelect = true;
        }
        
        if(this.boxPerams2[i] == 0) { // disabled option
            this.visibleText[i].alpha = 0.5;
            this.referenceText[i].noSelect = true;
        }
    }
}

MsgBox.prototype.calculateAppearence = function() {
    if(this.boxType == 0) { // text box
        this.calculateTextLines();
        
        // calculate the size that the box will be with the text inside.
        var width = this.maxWidth; //this.textLines[0].textWidth + 6;
        var height = (this.referenceText.length * 22) + 4;
        
        this.rect.width = width;
        this.rect.height = height;
        
        // calculate the position of the top left
        var boxX = this.origin.x - (Math.floor(width/2));
        var boxY = this.origin.y - (height);
        
        this.rect.position.set(boxX, boxY);
        
        // add boarders
        this.boarders[0].position.set(boxX, boxY-2);
        this.boarders[0].width = width;
        this.boarders[0].height = 2;
        
        this.boarders[1].position.set(boxX, boxY + height);
        this.boarders[1].width = width;
        this.boarders[1].height = 2;
        
        this.boarders[2].position.set(boxX-2, boxY);
        this.boarders[2].width = 2;
        this.boarders[2].height = height;
        
        this.boarders[3].position.set(boxX + width, boxY);
        this.boarders[3].width = 2;
        this.boarders[3].height = height;
        
        // move all text into the new position
        for(var i = 0; i < this.referenceText.length; i++) {
            this.referenceText[i].position.set(boxX + 3, boxY + 3 + (i * 22));
            this.visibleText[i].position.set(boxX + 3, boxY + 3 + (i * 22));
        }
        
        if(this.boxPerams2 == 0) { // "press to continue" message box
            // place the continuer
            this.continuer = this.game.add.sprite(boxX, boxY, "speachCont");
            
            this.continuer.alpha = 0;
            
            this.continuer.animations.add("flash", [0, 1], 2, true);
            this.continuer.animations.play("flash");
            
            this.continuer.position.set((boxX + width) - 30, (boxY + height) - 5);
        }
        else if(this.boxPerams2 > 0) { // forever message box (must be removed manually)
            // schedule the destruction of this box.
            this.destroyAfter = this.boxPerams2;
        }
        
        // boxes with negative times stay forever and must be removed manually
    }
    else if(this.boxType == 1) {
        // do an options box
        this.calculateOptionLines();
        
        // calculate the size that the box will be with the text inside.
        var width = this.maxWidth; //this.textLines[0].textWidth + 6;
        var height = (this.referenceText.length * 32) + 4;
        
        this.rect.width = width;
        this.rect.height = height;
        
        // calculate the position of the top left
        var boxX = this.origin.x - (Math.floor(width/2));
        var boxY = this.origin.y - (height);
        
        this.rect.position.set(boxX, boxY);
        
        // add boarders
        this.boarders[0].position.set(boxX, boxY-2);
        this.boarders[0].width = width;
        this.boarders[0].height = 2;
        
        this.boarders[1].position.set(boxX, boxY + height);
        this.boarders[1].width = width;
        this.boarders[1].height = 2;
        
        this.boarders[2].position.set(boxX-2, boxY);
        this.boarders[2].width = 2;
        this.boarders[2].height = height;
        
        this.boarders[3].position.set(boxX + width, boxY);
        this.boarders[3].width = 2;
        this.boarders[3].height = height;
        
        // move all text into the new position
        for(var i = 0; i < this.referenceText.length; i++) {
            // center texts
            var xPos = (boxX + (width / 2)) - ((this.referenceText[i].text.length * 12) / 2) + 2;
            xPos = Math.floor(xPos);
            
            this.referenceText[i].position.set(xPos, boxY + 6 + (i * 32));
            this.visibleText[i].position.set(xPos, boxY + 6 + (i * 32));
        }
        
        // place the continuer - except NOW IT'S A SELECTOR OMFG MLG M8 WTFBBQ
        this.continuer = this.game.add.sprite(boxX, boxY, "speachSel");

        this.continuer.animations.add("flash", [0, 1], 2, true);
        this.continuer.animations.play("flash");
    }
}

MsgBox.prototype.inputUpdate = function() {
    if(this.deleteMe) {
        return;
    }
    
    if(this.boxType == 0) { // text box
        if(this.continuer == null) {
            return;
        }
        
        if(this.continuer.alpha == 1 && this.game.input.keyboard.downDuration(Phaser.Keyboard.ENTER, 1)) {
            // remove message
            this.prepareDelete();
            return;
        } else if(this.game.input.keyboard.downDuration(Phaser.Keyboard.ENTER, 1)) {
            // autocomplete message
            for(var i = 0; i < this.referenceText.length; i++) {
                while(this.visibleText[i].stage < this.referenceText[i].text.length) {
                    this.visibleText[i].stage += 1;
                    this.visibleText[i].text = this.referenceText[i].text.slice(0, this.visibleText[i].stage);
                }
            }
        }
    }
    else if(this.boxType == 1) {        
        if(this.game.input.keyboard.downDuration(Phaser.Keyboard.UP, 1) || this.game.input.keyboard.downDuration(Phaser.Keyboard.W, 1)) {
            this.opChange = true;
            this.opDown = false;
            
            if(BasicGame.playSFX)
                this.advanceSound.play('', 0, BasicGame.sfxVol);
        }
        else if(this.game.input.keyboard.downDuration(Phaser.Keyboard.DOWN, 1) || this.game.input.keyboard.downDuration(Phaser.Keyboard.S, 1)) {
            this.opChange = true;
            this.opDown = true;
            
            if(BasicGame.playSFX)
                this.advanceSound.play('', 0, BasicGame.sfxVol);
        }
        
        if(this.game.input.keyboard.downDuration(Phaser.Keyboard.ENTER, 1)) {
            //if(BasicGame.playSFX)
                //this.selectSound.play('', 0, BasicGame.sfxVol);
            
            this.result = this.selectedOp;
            this.prepareDelete();
        }
    }
}

MsgBox.prototype.update = function() {
    // handle fade in
    
    if(this.rect.alpha < 0.8) {
        this.rect.alpha += 0.1;
        
        this.boarders[0].alpha += 0.1;
        this.boarders[1].alpha += 0.1;
        this.boarders[2].alpha += 0.1;
        this.boarders[3].alpha += 0.1;
    }
    
    if(this.deleteMe) {
        return;
    }
    
    // delete now?
    if(this.destroyAfter != 0) {
        if(this.game.time.elapsedSince(this.timePlaced) > this.destroyAfter) {
            this.prepareDelete();
        }
    }
    
    if(this.boxType == 0) { // msg box
        // scroll the text in according to referenceText
        for(var i = 0; i < this.referenceText.length; i++) {
            if(this.visibleText[i].stage < this.referenceText[i].text.length) {
                for(var j = 0; j < BasicGame.dialogSpeed && this.visibleText[i].stage < this.referenceText[i].text.length; j++) {
                    this.visibleText[i].stage += 1;
                    this.visibleText[i].text = this.referenceText[i].text.slice(0, this.visibleText[i].stage);
                }
                
                if(!this.advanceSound.isPlaying)
                    if(BasicGame.playSFX)
                        this.advanceSound.play('', 0, BasicGame.sfxVol);
                
                return;
            }
        }
        
        if(this.continuer != null) {
            this.continuer.alpha = 1;
        }
    } else if(this.boxType == 1) {
        // all text appears immediately
        for(var i = 0; i < this.referenceText.length; i++) {
            if(this.visibleText[i].stage < this.referenceText[i].text.length) {
                this.visibleText[i].stage = this.referenceText[i].text.length;
                this.visibleText[i].text = this.referenceText[i].text.slice(0, this.visibleText[i].stage);
            }
        }
        
        // make sure the continuer selects a valid option
        while(this.referenceText[this.selectedOp].noSelect || this.opChange) {
            this.opChange = false;
            
            if(this.opDown) {
                this.selectedOp += 1;
            }
            else {
                this.selectedOp -= 1;
            }
            
            if(this.selectedOp > this.referenceText.length-1) {
                this.selectedOp = 0;
            }
            if(this.selectedOp < 0) {
                this.selectedOp = this.referenceText.length-1;
            }
        }
        
        
        // move continuer to selection
        this.continuer.position.set(this.rect.position.x - 8, this.referenceText[this.selectedOp].position.y);
    }
}

// UI Object - manages message boxes with unique lines of text + option selection
uiObject = function(game) {
    this.game = game;
    
    this.activeDialogs = [];
    
    this.sequenceData = [];
    this.sequenceStringCache = "";
    this.sequenceLocation = new Phaser.Point();
    this.sequenceCallback = null;
    this.sequenceCallbackObj = null;
}

uiObject.prototype.constructor = uiObject;

uiObject.prototype.update = function() {
    // update active dialog
    if(this.activeDialogs.length > 0) {
        this.getActiveBox().inputUpdate(); // only the topmost dialog can take input
    }
    
    // make sure all the boxes do their normal thing
    for(var i = 0; i < this.activeDialogs.length; i++) {
        // if a dialog is done doing stuff, destroy it
        if(this.activeDialogs[i].deleteMe) {
            this.activeDialogs.splice(i, 1);
            continue;
        }
        
        this.activeDialogs[i].update();
    }
    
    // sequences
    if(this.sequenceData.length > 0) {
        var advanceToNext = false;
        
        if(this.activeDialogs.length > 0) { // crowbar in an sanity check to prevent the otherwise inevitable crash
            var dlg = this.getActiveBox();
            
            if(dlg.boxPerams1 != this.sequenceStringCache) {
                advanceToNext = true; // this box is irrelevant to us, we can continue our sequence
            }
        } else {
            // no dialogs are open but several are waiting to open. Open them!
            advanceToNext = true;
        }
        
        if(advanceToNext) {
            this.sequenceStringCache = this.sequenceData.pop(); // pop next msg off the array;
            
            if(this.sequenceFirst) {
                this.newMessageBox(this.sequenceLocation.x, this.sequenceLocation.y, this.sequenceStringCache, 0);
                this.sequenceFirst = false;
            }
            else if(this.sequenceData.length == 0) { // finish the sequence by calling the sequence callbacks
                box = this.newMessageBox(this.sequenceLocation.x, this.sequenceLocation.y, this.sequenceStringCache, 0, this.sequenceCallback, this.sequenceCallbackObj);
                
                box.skipFade();
            } else { // otherwise, just display the message
                box = this.newMessageBox(this.sequenceLocation.x, this.sequenceLocation.y, this.sequenceStringCache, 0);
                
                box.skipFade();
            }
        }
    }
}

uiObject.prototype.closeActiveBox = function() {
    this.activeDialogs[this.activeDialogs.length-1].prepareDelete();
}

uiObject.prototype.getActiveBox = function() {
    return this.activeDialogs[this.activeDialogs.length-1];
}

uiObject.prototype.newMessageBox = function(spawnX, spawnY, message, timeToVanish, callback, callbackObject) {
    boxLength = (message.length * 12) + 6;
    
    if(boxLength > 550) {
        boxLength = 550;
    }
    
    // timeToVanish can be set to 0 to make an advancable dialog, or -1 to make a static one.
    var box = new MsgBox(this.game, spawnX, spawnY, boxLength, 0, message, timeToVanish, callback, callbackObject);
    this.activeDialogs.push(box);
    
    return box;
}
  
uiObject.prototype.newOptionsBox = function(spawnX, spawnY, optionsArray, optionTypesArray, callback, callbackObject, selectedOp) {
    // which option is longest
    curLongestStringSize = 0;
    
    for(var i = 0; i < optionsArray.length; i++) {
        if(optionsArray[i].length > curLongestStringSize) {
            curLongestStringSize = optionsArray[i].length;
        }
    }
    
    boxLength = (curLongestStringSize * 12) + 6;
    
    var box = new MsgBox(this.game, spawnX, spawnY, boxLength, 1, optionsArray, optionTypesArray, callback, callbackObject);
    this.activeDialogs.push(box);
    
    if(selectedOp != null) {
        box.selectedOp = selectedOp;
        box.update();
    }
    
    return box;
}

uiObject.prototype.sequenceMessageBox = function(spawnX, spawnY, messagesArray, callback, callbackObject) {
    this.sequenceData = messagesArray.reverse();
    this.sequenceStringCache = "";
    this.sequenceLocation.x = spawnX;
    this.sequenceLocation.y = spawnY;
    this.sequenceCallback = callback;
    this.sequenceCallbackObj = callbackObject;
    this.sequenceFirst = true;
}

// Data object - handles saving game, if supported.
DataObject = function(game, thePlayer, tWorld) {
    this.game = game;
    this.thePlayer = thePlayer;
    this.tWorld = tWorld;
    
    this.canSave = true;
    
    if (!window.localStorage) {
        this.canSave = false;
    }
}

DataObject.prototype.constructor = DataObject;

// BattleActor - represents character in a battle
BattleActor = function(game, uiName, sprite, readyTime, maxHealth, maxMP, col) {
    this.game = game;
    this.spriteName = sprite;
    
    this.uiName = uiName;
    
    this.readyTime = readyTime;
    this.maxHealth = maxHealth;
    this.maxMP = maxMP;
    
    this.health = maxHealth;
    this.MP = maxMP;
    
    this.atkMultiplier = maxHealth / 5;
    
    this.color = col;
    
    this.level = 1;
    this.exp = 0;
    this.expReq = 10;
}

BattleActor.prototype.constructor = BattleActor;

