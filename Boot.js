var BasicGame = {};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

    init: function () {
        
        this.fail = false;
        
        // this line exists for my own sanity when debugging
        //this.game.sound.mute = true;

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 2;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
        }
        else
        {
            // YOU CAN'T PLAY MESS ON A MOBILE YOU NINNY
            this.fail = true;
        }

    },

    preload: function () {

        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        this.load.image('mmLogo', 'images/LogoWhite.png');
        this.load.image('mmNope', 'images/mobileNope.png');
        
        this.load.image('preloaderBackground', 'images/title.png');
        this.load.image('preloaderBar', 'images/preloadr_bar.png');
        this.load.image('preloaderBarBack', 'images/preloadr_barback.png');
        this.load.bitmapFont('goldfish', 'fonts/font.png', 'fonts/font.fnt');
        this.load.bitmapFont('goldfishWhite', 'fonts/font2.png', 'fonts/font2.fnt');

    },

    create: function () {
        this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
        this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
        
        if(!this.fail) {
            this.bootLogo = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, "mmLogo");
            this.bootLogo.anchor.set(0.5, 0.5);
            this.bootLogo.alpha = 0;

            this.logoIn = true;
        } else {
            this.bootLogo = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, "mmNope");
            
            this.bootLogo.anchor.set(0.5, 0.5);
        }
    },
    
    update: function() {
        if(this.fail) {
            return;
        }
        if(this.logoIn) {
            if(this.bootLogo.alpha < 1) {
                this.bootLogo.alpha += 0.005;
            } else {
                this.logoIn = false;
            }
        }
        else {
            if(this.bootLogo.alpha > 0.1) {
                this.bootLogo.alpha -= 0.005;
            } else {
                this.game.state.start('Preloader');
            }
        }
        
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) { 
            this.game.state.start('Preloader');
        }
    }

};
