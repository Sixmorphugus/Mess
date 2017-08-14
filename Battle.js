BasicGame.Battle = function (game) {
    this.startSound = null;
    this.battleStartedAt = 0;
    this.showingBattleIntro = true;
    
    this.defenders = [];
    this.defendersSpr = [];
    this.defendersInd = [];
    
    this.attackers = [];
    this.attackersSpr = [];
    this.attackersInd = [];
    
    this.timeLine = null;
    this.background = null;
    
    this.ui = null;
    
    this.shiverTime = 0;
    
    this.curDefender = 0;
    
    this.timeMoves = true;
    
    this.painSounds = []
};

BasicGame.Battle.prototype = {
    init: function () {
        this.inventory = BasicGame.BattleInventory.slice();
        this.inventorySelectable = BasicGame.BattleInventorySelectable.slice();
        
        this.startSound = null;
        this.battleStartedAt = 0;
        this.showingBattleIntro = true;

        this.defenders = [];
        this.defendersSpr = [];
        this.defendersInd = [];

        this.attackers = [];
        this.attackersSpr = [];
        this.attackersInd = [];

        this.timeLine = null;
        this.background = null;

        this.ui = null;

        this.shiverTime = 0;

        this.curDefender = 0;

        this.timeMoves = true;
        
        this.deathSound = this.game.add.audio("death");
        
        this.painSounds = []
        
        this.painSounds.push(this.add.sound("hit1"));
        this.painSounds.push(this.add.sound("hit2"));
        this.painSounds.push(this.add.sound("hit3"));
        
        this.game.stage.backgroundColor = "#000000"
        
        var emsg = "...";
        var erand = randomIntFromInterval(0, 5);
        
        if(erand < 3) {
            emsg = "Maintenence in progress...";
        }
        else if(erand == 3) {
            emsg = "SQUARE GO LIKE";
        }
        else if(erand == 4) {
            emsg = "Attack button simulator 2015";
        }
        else if(erand == 5) {
            emsg = "There's not BROOM in this world for the both of us! (i'm so sorry)";
        }
        
        this.preloadText = this.add.bitmapText(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), 'goldfishWhite', emsg, 18);
        
        this.preloadText.updateTransform();
        this.preloadText.position.x = Math.floor(window.innerWidth / 2) - Math.floor(this.preloadText.textWidth / 2);
        
        this.startSound = this.add.sound("enterBattle");
        
        if(BasicGame.playSFX) {
            this.startSound.play('', 0, BasicGame.sfxVol, false);
        }
        
        this.music = this.add.sound(BasicGame.currentBattleMusic);
        
        this.battleStartedAt = this.game.time.time;
        this.showingBattleIntro = true;
        
        this.attackers = BasicGame.currentBattleAttackers.slice()
        this.defenders = JSON.parse(JSON.stringify(BasicGame.currentBattleFriendlies));
        
        this.ui = new uiObject(this.game);
        
        if(BasicGame.playMusic) {
            this.music.play('', 0, BasicGame.musicVol, true);
        }
    },
    
    update: function () {
        // resize code
        this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
        
        this.ui.update();
        
        if(this.showingBattleIntro) {
            if(this.game.time.elapsedSince(this.battleStartedAt) > BasicGame.currentBattleStartDelay) {
                // VISUAL SETUP
                this.showingBattleIntro = false;

                this.game.stage.backgroundColor = BasicGame.currentBattleColor;
                
                this.preloadText.destroy();
                
                this.background = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, BasicGame.currentBattleBackground);
                this.background.autoScroll(-10, 0);
                
                this.timeLine = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height - 64, "battleTimeline");
                this.timeLine.anchor.set(0.5, 0.5);
                
                for(var i = 0; i < this.defenders.length; i++) {
                    // setup sprite
                    var basePosition = new Phaser.Point((this.game.canvas.width / 2) - 400 + (i*40), (this.game.canvas.height / 2) + (100*i) - (50*this.defenders.length));
                    
                    var defSpr = this.game.add.sprite(basePosition.x, basePosition.y, this.defenders[i].spriteName);
                    defSpr.anchor.set(0.5, 0);
                    defSpr.animations.add("attack", [1, 0], 4, false);
                    
                    this.defendersSpr.push(defSpr);
                    
                    // setup timeline gui
                    var turnI = this.game.add.sprite(this.timeLine.position.x - 500, this.timeLine.position.y, "turnInd");
                    turnI.anchor.set(0.5, 1);
                    turnI.tint = this.defenders[i].color;
                    
                    this.defendersInd.push(turnI);
                }
                
                for(var i = 0; i < this.attackers.length; i++) {
                    // setup sprite
                    var basePosition = new Phaser.Point((this.game.canvas.width / 2) + 400 - (i*40), (this.game.canvas.height / 2) + (100*i) - (50*this.attackers.length));
                    if(this.attackers[i].spriteName == "chawley") {
                        basePosition = new Phaser.Point(this.game.canvas.width, this.game.canvas.height - 600);
                    }
                    
                    var atkSpr = this.game.add.sprite(basePosition.x, basePosition.y, this.attackers[i].spriteName);
                    atkSpr.animations.add("attack", [1, 0], 4, false);
                    
                    this.attackersSpr.push(atkSpr);
                    
                    this.attackersSpr[i].scale.x = -1;
                    
                    // setup timeline gui
                    var turnI = this.game.add.sprite(this.timeLine.position.x - 500, this.timeLine.position.y, "turnIndE");
                    turnI.anchor.set(0.5, 0);
                    turnI.tint = this.attackers[i].color;
                    
                    this.attackersInd.push(turnI);
                }
                
                this.timeLine.bringToTop();
            }
        } else {
            this.shiverTime += 1;
            
            // get dem shivers goin
            if(this.shiverTime == 20) {
                this.shiverTime = 0;
                
                for(var i = 0; i < this.defenders.length; i++) {
                    if(this.defenders[i].health <= 0)
                        continue;
                    
                    var basePosition = new Phaser.Point((this.game.canvas.width / 2) - 400 + (i*40), (this.game.canvas.height / 2) + (100*i) - (50*this.defenders.length));

                    basePosition.x += randomIntFromInterval(-4, 4);
                    basePosition.y += randomIntFromInterval(-4, 4);

                    this.defendersSpr[i].position = basePosition;
                    this.defendersSpr[i].tint = 0xffffff;
                    this.defendersInd[i].tint = this.defenders[i].color;
                    this.defendersInd[i].bringToTop();
                }
                
                for(var i = 0; i < this.attackers.length; i++) {
                    if(this.attackers[i].health <= 0)
                        continue;
                    
                    var basePosition = new Phaser.Point((this.game.canvas.width / 2) + 400 - (i*40), (this.game.canvas.height / 2) + (100*i) - (50*this.attackers.length));
                    if(this.attackers[i].spriteName == "chawley") {
                        basePosition = new Phaser.Point(this.game.canvas.width, this.game.canvas.height - 600);
                    }
                    
                    basePosition.x += randomIntFromInterval(-4, 4);
                    basePosition.y += randomIntFromInterval(-4, 4);

                    this.attackersSpr[i].position = basePosition;
                    this.attackersSpr[i].tint = 0xffffff;
                    this.attackersInd[i].tint = this.attackers[i].color;
                    this.attackersInd[i].bringToTop();
                }
            }
            
            // move everyone along the timeline
            if(this.timeMoves) {
                for(var i = 0; i < this.defenders.length; i++) {
                    this.defendersInd[i].position.x += this.defenders[i].readyTime;

                    if(this.defendersInd[i].position.x >= this.timeLine.position.x + 500) {
                        // wait and show attack menu
                        this.defendersInd[i].position.x = this.timeLine.position.x - 500;
                        
                        if(this.defenders[i].health > 0) {
                            this.showAttackMenu(i);
                        }
                    }
                }

                for(var i = 0; i < this.attackers.length; i++) {
                    this.attackersInd[i].position.x += this.attackers[i].readyTime;

                    if(this.attackersInd[i].position.x >= this.timeLine.position.x + 500) {
                        // attack
                        if(this.attackers[i].health > 0) {
                            this.doEnemyAttack(i, randomIntFromInterval(0, this.defenders.length - 1));
                        }

                        // reset
                        this.attackersInd[i].position.x = this.timeLine.position.x - 500;
                    }
                }
                // is anyone dead
                var deadDefenders = 0;
                for(var i = 0; i < this.defenders.length; i++) {
                    if(this.defenders[i].health <= 0) {
                        this.defenders[i].health = 0;
                        this.defendersSpr[i].tint = 0x000000;
                        this.defendersInd[i].alpha = 0;
                        deadDefenders += 1;
                    }
                }

                if(deadDefenders == this.defenders.length) {
                    // player fails and respawns
                    this.timeMoves = false;
                    this.showFailScreen();
                }

                var deadAttackers = 0;
                for(var i = 0; i < this.attackers.length; i++) {
                    if(this.attackers[i].health <= 0) {
                        this.attackers[i].health = 0;
                        this.attackersSpr[i].tint = 0x000000;
                        this.attackersInd[i].alpha = 0;
                        deadAttackers += 1;
                    }
                }

                if(deadAttackers == this.attackers.length) {
                    // win battle!!!1
                    this.timeMoves = false;
                    this.showWinScreen();
                }
            }
        }
    },
    
    playHitSound: function() {
        if(!BasicGame.playSFX)
            return;
        
        var sndToPlay = randomIntFromInterval(0, this.painSounds.length - 1);
        
        this.painSounds[sndToPlay].play('', 0, BasicGame.sfxVol, false);
    },
    
    showAttackMenu: function(defender) {
        this.timeMoves = false;
        
        this.curDefender = defender;
        
        var pos = this.defendersSpr[defender].position;
        this.ui.newOptionsBox(pos.x, pos.y, ["  " + this.defenders[defender].uiName + " (Lv: " + this.defenders[defender].level + ")", "HP: " + this.defenders[defender].health + "/" + this.defenders[defender].maxHealth, "MP: " + this.defenders[defender].MP + "/" + this.defenders[defender].maxMP, "---", " Attack!", "     Abilities...", "  Items...", "Wait"], [0, 0, 0, -1, 1, 1, 1, 1], this.attackMenuSelect, this, 3);
    },
    
    showAttackMenuAgain: function() {
        this.showAttackMenu(this.curDefender);
    },
    
    attackMenuSelect: function(selection) {
        var pos = this.defendersSpr[this.curDefender].position;
        
        if(selection == 4) {
            // attack!
            this.doAttackTargeting();
        }
        else if(selection == 5) {
            // no abilities in this version of the game, I'm afraid...
            this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), "Abilities are not available in this version of the game.", 0, this.showAttackMenuAgain, this);
        }
        else if(selection == 6) {
            // use inventory item
            this.doItem();
        }
        else if(selection == 7) {
            // do nothing...
            var r = randomIntFromInterval(0, 3);
            
            if(r == 0) {
                this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " is waiting this one out.", 4000, null, null);
            }
            else if(r == 1) {
                this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " wastes a turn.", 4000, null, null);
            }
            else if(r == 2) {
                this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " waits to grow a pair.", 4000, null, null);
            }
            else if(r == 3) {
                this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), "They're not gonna defeat themselves, " + this.defenders[this.curDefender].uiName + ".", 4000, null, null);
            }
            
            this.timeMoves = true;
        }
    },
    
    doItem: function() {
        var usableItems = 0;
        
        for(var i = 0; i < this.inventorySelectable.length; i++) {
            if(this.inventorySelectable[i]) {
                usableItems += 1;
            }
        }
        
        if(usableItems == 0) {
            this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " tried to use those items he doesn't have!", 4000, null, null);
            this.timeMoves = true;
            
            return;
        }
        
        var itemList = this.inventory.concat(["---", "Back"]);
        var itemListS = this.inventorySelectable.concat([-1, 1]);
        
        this.ui.newOptionsBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), itemList,  itemListS, this.doItemSelect, this);
    },
    
    doItemSelect: function(selection) {
        if(selection > this.inventory.length) {
            this.showAttackMenuAgain();
            return;
        }
        
        var itemName = this.inventory[selection];
        
        if(itemName.search("Rice Pudding") != -1) {
            if(this.defenders[this.curDefender].health != this.defenders[this.curDefender].maxHealth) {
                this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " used a Rice Pudding to heal up!", 4000, null, null);
            } else {
                this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " wasted good Rice Pudding.", 4000, null, null);
            }
            
            this.defenders[this.curDefender].health = this.defenders[this.curDefender].maxHealth;
            this.inventorySelectable[selection] = false;
        }
        else if(itemName.search("Windex") != -1) {
            this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " used Windex, even though abilities aren't in the game yet!", 4000, null, null);
            
            this.inventorySelectable[selection] = false;
        }
        else if(itemName.search("Aerosol") != -1) {
            this.doAerosolThrow();
            
            this.inventorySelectable[selection] = false;
        }
        else {
            this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " failed to find a use for" + itemName + " in a fight.", 4000, null, null);
        }
        
        this.timeMoves = true;
    },
    
    doAttackTargeting: function() {
        // just one attacker? Skip this menu.
        if(this.attackers.length == 1) {
            this.doFriendlyAttack(0);
            return;
        }
        
        var attackerNameList = [];
        var attackList = [];
        
        for(var i = 0; i < this.attackers.length; i++) {
            attackerNameList.push(this.attackers[i].uiName);
            attackList.push(this.attackers[i].health > 0);
        }
        
        this.ui.newOptionsBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), attackerNameList, attackList, this.doFriendlyAttack, this);
    },
    
    doFriendlyAttack: function(attacker) {
        this.timeMoves = true;
        this.playHitSound();
        
        this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " attacks " + this.attackers[attacker].uiName + "!", 4000, null, null);
        
        var attackPower = randomIntFromInterval(this.defenders[this.curDefender].atkMultiplier / 5, this.defenders[this.curDefender].atkMultiplier);
        
        this.attackers[attacker].health -= attackPower;
        this.attackersSpr[attacker].tint = 0xff0000;
        this.attackersInd[attacker].tint = 0xff0000;
        
        this.defendersSpr[this.curDefender].animations.play("attack");
        
        this.shiverTime = 0;
        
        if(BasicGame.mlg) {
            this.attackers[attacker].health = 0;
            
            // give the friendly exp
            this.defenders[this.curDefender].exp += this.attackers[attacker].maxHealth / 10;
        }
        
        if(this.attackers[attacker].health <= 0) {
            this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 200), this.attackers[attacker].uiName + " is down!", 4000, null, null);
            
            if(BasicGame.playSFX)
                this.deathSound.play('', 0, BasicGame.sfxVol, false);
            
            // give the friendly exp
            this.defenders[this.curDefender].exp += this.attackers[attacker].maxHealth / 10;
        }
        
        
    },
    
    doAerosolThrow: function() {
        this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.defenders[this.curDefender].uiName + " threw Aerosol!", 4000, null, null);
        
        for(var i = 0; i < this.attackers.length; i++) {
            this.attackers[i].health -= 80; // big damage to everyone
            this.attackersSpr[i].tint = 0xff0000;
            this.attackersInd[i].tint = 0xff0000;
            
            if(this.attackers[i].health < 0) {
                // give the friendly exp
                this.defenders[this.curDefender].exp += this.attackers[i].maxHealth / 10;
            }
        }
        
        this.playHitSound();
    },
    
    doEnemyAttack: function(attacker, defender) {
        this.playHitSound();
        
        this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 238), this.attackers[attacker].uiName + " attacks " + this.defenders[defender].uiName + "!", 4000, null, null);
        
        var attackPower = randomIntFromInterval(this.attackers[attacker].atkMultiplier / 5, this.attackers[attacker].atkMultiplier);
        
        this.defenders[defender].health -= attackPower;
        this.defendersSpr[defender].tint = 0xff0000;
        this.defendersInd[defender].tint = 0xff0000;
        
        this.attackersSpr[attacker].animations.play("attack");
        
        this.shiverTime = 0;
        
        if(this.defenders[defender].health <= 0) {
            this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) - 200), this.defenders[defender].uiName + " is down!", 4000, null, null);
            
            if(BasicGame.playSFX)
                this.deathSound.play('', 0, BasicGame.sfxVol, false);
        }
    },
    
    levelUpCheck: function() {
        for(var i = 0; i < this.defenders.length; i++) {
            if(this.defenders[i].exp >= this.defenders[i].expReq) {
                this.defenders[i].exp -= this.defenders[i].expReq;
                this.defenders[i].expReq *= 1.2;
                this.defenders[i].level += 1;
                
                this.defenders[i].expReq = Math.floor(this.defenders[i].expReq);
                
                this.showLevelUp(i);
                
                return;
            }
        }
        
        this.endBattle();
    },
    
    showLevelUp: function(defender) {
        this.curDefender = defender;
        
        var healthUp = this.defenders[defender].maxHealth+50;
        var atkUp = this.defenders[defender].atkMultiplier+20;
        var readyUp = this.defenders[defender].readyTime+0.5;
        
        var pos = this.defendersSpr[defender].position;
        this.ui.newOptionsBox(pos.x, pos.y, ["   " + this.defenders[defender].uiName + " levels up!", "He gains what?", "---", " Health: " + this.defenders[defender].maxHealth + "->" + healthUp, " Attack Power: " + this.defenders[defender].atkMultiplier + "->" + atkUp, " Speed: " + this.defenders[defender].readyTime + "->" + readyUp], [0, 0, -1, 1, 1], this.doLevelUp, this, 3);
    },
    
    doLevelUp: function(upSel) {
        if(upSel == 3) {
            this.defenders[this.curDefender].maxHealth += 50;
            this.defenders[this.curDefender].health += 50;
        }
        else if(upSel == 4) {
            this.defenders[this.curDefender].atkMultiplier += 20;
        }
        else if(upSel == 5) {
            this.defenders[this.curDefender].readyTime += 0.5;
        }
        
        this.levelUpCheck();
    },
    
    showWinScreen: function() {
        this.music.stop();
        this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), "All adversaries are down. You win.", 0, this.levelUpCheck, this);
    },
    
    showFailScreen: function() {
        this.background.destroy();
        
        for(var i = 0; i < this.defenders.length; i++) {
            this.defendersSpr[i].destroy();
            this.defendersInd[i].destroy();
        }
        
        for(var i = 0; i < this.attackers.length; i++) {
            this.attackersSpr[i].destroy();
            this.attackersInd[i].destroy();
        }
        
        this.music.stop();
        this.ui.newMessageBox(window.innerWidth / 2, Math.floor((window.innerHeight / 2) + 138), "Everyone on your side is down. You lose.", 0, this.endBattle2, this);
    },
                              
    endBattle: function() {
        BasicGame.BattleInventorySelectable = this.inventorySelectable.slice();
        BasicGame.currentBattleFriendlies = JSON.parse(JSON.stringify(this.defenders));
        this.game.state.start("Game", true, false, true);
    },
    
    endBattle2: function() {
        BasicGame.BattleInventorySelectable = this.inventorySelectable.slice();
        BasicGame.currentBattleFriendlies = JSON.parse(JSON.stringify(this.defenders));
        this.game.state.start("Game", true, false, true, true);
    },

};
