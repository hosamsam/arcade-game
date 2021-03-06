/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */
import {Resources} from './resources';
import {Player, Enemy, BUG_HEIGHT, PLAYER_IMG_WIDTH, CANVAS_WIDTH, CANVAS_HEIGHT, BUG_WIDTH} from "./app";
import {Level} from "./level";


export  const canvas = document.getElementById('my-canvas'),
    dialog = document.getElementsByTagName('dialog');

export  class Engine {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    constructor() {
        this.player = new Player();
        this.allEnemies = [];
        this.lastTime = 0;
        this.canvas = document.getElementById('my-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gamelavel = localStorage.getItem('player:level')
        this.requestFrame = true;
        /* Go ahead and load all of the images we know we're going to need to
          * draw our game level. Then set init as the callback method, so that when
          * all of these images are properly loaded our game will start.
        */

    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
     init(playerSpirit = localStorage.getItem('player:spirit'), level = this.gamelavel) {
        // player = new Player();
        // console.log(playerSpirit, level);
         this.reset();
         console.log(this.allEnemies);
         this.player = new Player(playerSpirit);
         this.allEnemies = Array.from({length: 6}, (iter, i)=>new Enemy(i));
         this.lastTime = Date.now();
         console.log(this.allEnemies);

         this.main.call(this)


    }

    main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        /*let now = Date.now(),
            dt = (now - this.lastTime) / 1000.0;
        */
        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        this.update();
        this.render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        // this.lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        this.requestFrame&&window.requestAnimationFrame(this.main.bind(this));
    }


    showCanvas() {
        let gameinit = document.getElementById('init-game');
        gameinit.children[0].classList.add('to-bottom');
        document.getElementById('arcade-game').style.display = 'flex';
        setTimeout(() => {
            gameinit.children[0].classList.remove('to-bottom');
            gameinit.style.display = 'none';
        }, 250);
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
     update() {
        this.updateEntities();
        this.checkCollisions();
        this.checkPlayerWon()
    }

    checkCollisions() {
        this.allEnemies.forEach( (enemy)=> {
            if (enemy.x < this.player.x + this.player.width &&
                enemy.x + enemy.width > this.player.x &&
                enemy.y < this.player.y + this.player.height &&
                enemy.height + enemy.y > this.player.y) {
                // collision detected!
                this.gameEnd(false);
                console.warn('you lose');
                this.requestFrame = false;
            }
             if (enemy.x +BUG_WIDTH >= this.player.x &&
                 enemy.x + BUG_WIDTH <= this.player.x + PLAYER_IMG_WIDTH &&
                 enemy.y + BUG_HEIGHT - 30 >= this.player.y + 60 &&
                 enemy.y + BUG_HEIGHT - 30 < this.player.y + BUG_HEIGHT) {

            }
        });

    }

    checkPlayerWon() {
         if (this.player.y <= 0) {
            this.gameEnd(true)
         }
    }
    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
     updateEntities() {
        this.allEnemies.forEach( (enemy, i)=> {
            enemy.update();
            if (enemy.x >= CANVAS_WIDTH + PLAYER_IMG_WIDTH) {

                this.allEnemies.splice(i, 1, new Enemy(i))
            }
        });
        this.player.update();
    }

     gameEnd(res) {
        let dialog = document.getElementById('status-dialog');
        dialog.show();
        dialog.classList.add('dialog-scale');
        dialog.children[0].innerHTML = res ? '<h1 class="congrate">Congratulations</h1><span class="congrate">You passed the Road Safely</span> ' : '<h1>Opps!</h1><span>a BUG! crached you!</span> ';
        dialog.children[1].addEventListener('click', () => {
            this.reset(true);
            this.main();
            dialog.classList.remove('dialog-scale');
            // dialog.close('Hey there');
            // console.log(dialog.returnValue)
        });

    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
     render(gameLevel = 1) {

        const level = new Level(gameLevel);

        // Before drawing, clear existing canvas
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // render the right images of the level
        level.createLevel(this.ctx, Resources);

        this.renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
     renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        this.allEnemies.forEach(function (enemy) {
            enemy.render();
        });

        this.player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
     reset(withreinit = false) {
        // noop
         this.allEnemies = null;

         if (withreinit) {
            this.requestFrame = true;
             this.allEnemies = Array.from({length: 6}, (iter, i)=>new Enemy(i));
             this.player = new Player(localStorage.getItem('player:spirit'));
         }

    }


}
