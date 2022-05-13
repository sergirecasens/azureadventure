//********************************
// Name: Sergi Recasens Alsina
// Date: 06/06/2021

// DESCRIPTION:

// Little platformer game made with Phaser.
// The goal is to collect all the coins with the best score possible (before time runs out!).

// Gain score:
// 		- damaging enemies
//		- collecting coins
//		- healing 
//		- getting time bonus when completing the game.

// Loose score:
//		- an enemy hits you


// CONTROLS:

// Left/Right arrows: 	Walk
// Up arrow:			Jump
// Z key:				Attack
// X key (+walking):	Dash
// C key:				Buy health


// CHAINED ATTACKS:

// You can make a chain up to x3 consecutive attacks!
// Just press [Z] while swinging the sword to make a chained attack ( or spam [Z], that works too :P )
// The 3rd swing is always a critical hit!


// BUY HEALTH:

// When pressing [C] you will buy some health in exchange of a coin.
// There aren't any penalties in doing so!

//********************************

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 640,
	parent: 'joc',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },
	antialias: false,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

class Enemy {
	constructor(enemy_type, x, y, move_frames = 100, health = -1, attack = -1, speed = -1, current_move_frame = 0, direction = 1)
	{
		this.type = enemy_type;
		this.phaser = that.physics.add.sprite(x, y, enemy_type).setScale(2);
		this.phaser.setBounce(0.2);
		this.phaser.setCollideWorldBounds(true);
		this.state = Enemy.State.MOVE;
		this.direction = direction;
		this.total_move_frames = move_frames;
		this.current_move_frame = current_move_frame;
		this.current_attack_cooldown_frame = 0;
		
		//Default values
		if(health == -1)
		{
			if(enemy_type == Enemy.Type.SLIME)
			{
				this.health = Enemy.HEALTH_SLIME;
				this.attack = Enemy.ATTACK_SLIME;
				this.speed = Enemy.SPEED_SLIME;
			}
			else
			{
				this.health = Enemy.HEALTH_SNAKE;
				this.attack = Enemy.ATTACK_SNAKE;
				this.speed = Enemy.SPEED_SNAKE;
			}
		}
		
		//Custom values
		else
		{
			this.health = health;
			this.attack = attack;
			this.speed = speed;
		}
	}
	
	static TOTAL_ATTACK_COOLDOWN_FRAMES = 100;
	static ATTACK_FRAME = 19;
	
	static DIE_FRAME = 38;
	
	static ATTACK_SLIME = 12;
	static HEALTH_SLIME = 40;
	static SPEED_SLIME = 40;
	
	static ATTACK_SNAKE = 24;
	static HEALTH_SNAKE = 70;
	static SPEED_SNAKE = 60;
	
	static Type = {
		SLIME: 'enemy_slime',
		SNAKE: 'enemy_snake'
	}
	
	static State = {
		MOVE: 'move',
		ATTACK: 'attack',
		HURT: 'hurt',
		DIE: 'die'
	}
	
	get animation_move()
	{
		return (this.type + '_' + Enemy.State.MOVE)
	}
	
	get animation_attack()
	{
		return (this.type + '_' + Enemy.State.ATTACK)
	}
	
	get animation_hurt()
	{
		return (this.type + '_' + Enemy.State.HURT)
	}
	
	get animation_die()
	{
		return (this.type + '_' + Enemy.State.DIE)
	}
	
	animation_complete(animation, frame)
	{
		// STOP ATTACKING
		if(animation.key == this.animation_attack && frame.frame.name == 21)
		{
			this.state = Enemy.State.MOVE;
			this.phaser.setVelocityX(this.speed * this.direction);
		}
		
		// STOP HURTING
		if(animation.key == this.animation_hurt)
		{
			this.state = Enemy.State.MOVE
		}
		
		// STOP DYING (= dead)
		if(animation.key == this.animation_die)
		{
			var the_enemy = this;
			enemies = enemies.filter(function(enemy){ 
				return enemy != the_enemy; 
			});
			this.phaser.destroy();
		}
	}
	
	update()
	{
		//MOVE STATE
		if(this.state == Enemy.State.MOVE)
		{
			//Walk and flip
			this.phaser.anims.play(this.animation_move, true);
			this.current_move_frame += 1
			if(this.current_move_frame >= this.total_move_frames)
			{
				this.direction = -this.direction;
				this.phaser.setVelocityX(this.speed * this.direction);
				this.phaser.flipX = (this.direction < 0);
				this.current_move_frame = 0;
			}
			
			// Check if it can attack
			if(Phaser.Math.Distance.Between(adventurer.phaser.x, adventurer.phaser.y, this.phaser.x, this.phaser.y) < 30 && adventurer.state != Player.State.DIE)
			{
				this.state = Enemy.State.ATTACK;
				this.phaser.anims.play(this.animation_attack, true);
				
				// To fix a weird error that sometimes crashes the game
				if(this.phaser.scene != undefined)
				{
					this.phaser.setVelocityX(0);
				}
			}
		}
		
		//ATTACK STATE
		else if(this.state == Enemy.State.ATTACK)
		{
			//To harm the player it must be close and enemy must be in ATTACK_FRAME
			if(Phaser.Math.Distance.Between(adventurer.phaser.x, adventurer.phaser.y, this.phaser.x, this.phaser.y) < 30 && this.phaser.frame.name == Enemy.ATTACK_FRAME)
			{
				adventurer.change_health(-this.attack);
			}
			;//comprova si ha arribat al frame per atacar
		}
		
		//HURT STATE
		else if(this.state == Enemy.State.HURT)
		{
			this.phaser.anims.play(this.animation_hurt, true);
		}
		
		//DIE STATE
		else if(this.state == Enemy.State.DIE)
		{
			this.phaser.anims.play(this.animation_die, true);
		}
	}
	
	change_health(value, is_critic = false)
	{
		if(value < 0 && this.state != Enemy.State.DIE)
		{
			// Recalculate value (evoiding negative enemy health)
			if((this.health + value) < 0)
			{
				value = value - (this.health + value);
			}
			
			// Hurt text
			var color = WHITE;
			if(is_critic)
			{
				color = YELLOW;
			}
			text_damages.push(new TextDamage(this.phaser.x, this.phaser.y, Math.abs(value), color));
		}
		
		this.health += value;
		
		// Any state (except die) -> Hurt
		if(this.state != Enemy.State.DIE)
		{
			this.state = Enemy.State.HURT;
		}
		
		// Any state -> Die
		if(this.health == 0 || this.health < 0)
		{
			this.state = Enemy.State.DIE;
		}
	}
}


class Player {
	constructor(x, y, health = Player.MAX_HEALTH)
	{
		this.phaser = that.physics.add.sprite(x, y, 'adventurer').setScale(2);
		this.phaser.body.setSize(16, 20);
		this.phaser.body.setOffset(6, 11);
		this.phaser.setCollideWorldBounds(true);
		this.state = Player.State.WALK;
		this.speed = Player.NORMAL_SPEED;
		this.direction = 1;
		this.phaser.anims.play(this.animation_walk, true);
		this.chain_attack = false;
		this.can_dash = true;
		this.dash_timer = 0;
		this.health = health;
		this.invulnerable_frames = 0;
		this.attack = Player.ATTACK;
		this.has_attacked_this_state = false;
	}
	
	static ATTACK = 10;
	static CRITIC_MULTIPLIER = 1.5;
	
	static ATTACK_RANGE = 30;
	
	static ATTACK_1_FRAME = 28;
	static ATTACK_2_FRAME = 40;
	static ATTACK_3_FRAME = 54;
	
	static TOTAl_INVULNERABLE_FRAMES = 60;
	static NORMAL_SPEED = 150;
	static DASH_SPEED = 350;
	static DASH_DURATION = 20;
	static DASH_COOLDOWN = 50;
	
	static MAX_HEALTH = 100;
	
	static State = {
		IDLE: 'idle',
		WALK: 'walk',
		JUMP: 'jump',
		ATTACK_1: 'attack_1',
		ATTACK_2: 'attack_2',
		ATTACK_3: 'attack_3',
		SAVE_SWORD: 'save_sword',
		HURT: 'hurt',
		DIE: 'die'
	}
	
	get invulnerable()
	{
		return this.invulnerable_frames > 0;
	}
	
	get animation_idle()
	{
		return Player.State.IDLE;
	}
	
	get animation_walk()
	{
		return Player.State.WALK;
	}
	
	get animation_jump()
	{
		return Player.State.JUMP;
	}
	
	get animation_attack_1()
	{
		return Player.State.ATTACK_1;
	}
	
	get animation_attack_2()
	{
		return Player.State.ATTACK_2;
	}
	
	get animation_attack_3()
	{
		return Player.State.ATTACK_3;
	}
	
	get animation_save_sword()
	{
		return Player.State.SAVE_SWORD;
	}
	
	get animation_hurt()
	{
		return Player.State.HURT;
	}
	
	get animation_die()
	{
		return Player.State.DIE;
	}
	
	animation_complete(animation, frame)
	{
		// STOP ATTACK_1
		if(animation.key == this.animation_attack_1)
		{
			if(this.chain_attack)
			{
				this.state = Player.State.ATTACK_2;
				this.chain_attack = false;
				this.has_attacked_this_state = false;
			}
			else
			{
				this.state = Player.State.SAVE_SWORD;
			}
		}
		
		// STOP ATTACK_2
		else if(animation.key == this.animation_attack_2)
		{
			if(this.chain_attack)
			{
				this.state = Player.State.ATTACK_3;
				this.chain_attack = false;
				this.has_attacked_this_state = false;
			}
			else
			{
				this.state = Player.State.SAVE_SWORD;
			}
		}
		
		// STOP ATTACK_3
		else if(animation.key == this.animation_attack_3)
		{
			this.state = Player.State.SAVE_SWORD;
			this.chain_attack = false;
			this.has_attacked_this_state = false;
		}
		
		//STOP SAVE_SWORD
		else if(animation.key == this.animation_save_sword)
		{
			this.state = Player.State.IDLE;
		}
		
		//STOP HURT
		else if(animation.key == this.animation_hurt)
		{
			this.state = Player.State.IDLE;
		}
	}
	
	update()
	{
		//MOVEMENT
		//Only takes care of the player movement
		
		if(this.state != Player.State.DIE)
		{
			//Dash
			if(Phaser.Input.Keyboard.JustDown(key_dash) && this.can_dash)
			{
				this.speed = Player.DASH_SPEED;
				this.can_dash = false;
				this.dash_timer += 1;
			}
			
			//Dashing or waiting cooldown
			if(this.dash_timer > 0)
			{
				this.dash_timer += 1;
				if(this.dash_timer == Player.DASH_DURATION)
				{
					this.speed = Player.NORMAL_SPEED;
				}
				else if(this.dash_timer == Player.DASH_COOLDOWN)
				{
					this.can_dash = true;
					this.dash_timer = 0;
				}
			}
			
			//Left
			if(cursors.left.isDown)
			{
				this.phaser.setVelocityX(-this.speed);
				this.phaser.flipX = true;
			}
			//Right
			else if(cursors.right.isDown)
			{
				this.phaser.setVelocityX(this.speed);
				this.phaser.flipX = false;
			}
			//Idle
			else
			{
				this.phaser.setVelocityX(0);	
			}
			//Jump
			if(cursors.up.isDown && this.phaser.body.onFloor())
			{
				this.phaser.setVelocityY(-400);
			}
			
		}
		
		//ANIMATIONS AND CHANGE STATE
		//Always display the correct animation 
		
		//Idle
		if(this.state == Player.State.IDLE)
		{
			this.phaser.anims.play(this.animation_idle, true);
			
			// -> Walk
			if(cursors.left.isDown || cursors.right.isDown)
			{
				this.state = Player.State.WALK;
			}
			
			// -> Jump
			if(cursors.up.isDown)
			{
				this.state = Player.State.JUMP;
			}
			
			// -> Attack_1
			if(Phaser.Input.Keyboard.JustDown(key_attack))
			{
				this.state = Player.State.ATTACK_1;
				this.chain_attack = false;
				this.has_attacked_this_state = false;
			}
		}
		
		//Walk
		else if(this.state == Player.State.WALK)
		{
			this.phaser.anims.play(this.animation_walk, true);
			
			// -> Idle
			if(!cursors.left.isDown && !cursors.right.isDown){
				this.state = Player.State.IDLE;
			}
			
			// -> Jump
			if(cursors.up.isDown)
			{
				this.state = Player.State.JUMP;
			}
			
			// -> Attack_1
			if(Phaser.Input.Keyboard.JustDown(key_attack))
			{
				this.state = Player.State.ATTACK_1;
				this.chain_attack = false;
				this.has_attacked_this_state = false;
			}
			
		}
		
		//Jump
		else if(this.state == Player.State.JUMP)
		{
			this.phaser.anims.play(this.animation_jump, true);
			
			if(cursors.left.isDown)
			{
				this.phaser.flipX = true;
			}
			else if(cursors.right.isDown)
			{
				this.phaser.flipX = false;
			}
			
			if(this.phaser.body.onFloor())
			{
				// -> Idle
				if(cursors.left.isDown || cursors.right.isDown)
				{
					this.state = Player.State.WALK;
				}
				
				// -> Walk
				else
				{
					this.state = Player.State.IDLE;
				}
			}
			
			// -> Attack_1
			if(Phaser.Input.Keyboard.JustDown(key_attack))
			{
				this.state = Player.State.ATTACK_1;
				this.chain_attack = false;
				this.has_attacked_this_state = false;
			}
		}
		
		//Attack_1
		else if(this.state == Player.State.ATTACK_1)
		{
			this.phaser.anims.play(this.animation_attack_1, true);
			
			if(Phaser.Input.Keyboard.JustDown(key_attack))
			{
				this.chain_attack = true;
			}
			
			//Hurt enemy if it's in attack range (and hasn't already attacked in this state)
			if(this.phaser.frame.name == Player.ATTACK_1_FRAME && !this.has_attacked_this_state)
			{
				var the_player = this;
				var att = this.attack;
				enemies.forEach(function(enemy, index, array)
				{
					if(Phaser.Math.Distance.Between(adventurer.phaser.x, adventurer.phaser.y, enemy.phaser.x, enemy.phaser.y) < Player.ATTACK_RANGE)
					{
						enemy.change_health(-the_player.attack);
						the_player.has_attacked_this_state = true;
						add_score(att);
					}
				});
			}
		}
		
		//Attack_2
		else if(this.state == Player.State.ATTACK_2)
		{
			this.phaser.anims.play(this.animation_attack_2, true);
			
			if(Phaser.Input.Keyboard.JustDown(key_attack))
			{
				this.chain_attack = true;
			}
			
			//Hurt enemy if it's in attack range (and hasn't already attacked in this state)
			if(this.phaser.frame.name == Player.ATTACK_2_FRAME && !this.has_attacked_this_state)
			{
				var the_player = this;
				var att = this.attack;
				enemies.forEach(function(enemy, index, array)
				{
					if(Phaser.Math.Distance.Between(adventurer.phaser.x, adventurer.phaser.y, enemy.phaser.x, enemy.phaser.y) < Player.ATTACK_RANGE)
					{
						enemy.change_health(-the_player.attack);
						the_player.has_attacked_this_state = true;
						add_score(att);
					}
				});
			}
		}
		
		//Attack_3
		else if(this.state == Player.State.ATTACK_3)
		{
			this.phaser.anims.play(this.animation_attack_3, true);
			
			//Hurt enemy if it's in attack range (and hasn't already attacked in this state)
			if(this.phaser.frame.name == Player.ATTACK_3_FRAME && !this.has_attacked_this_state)
			{
				var the_player = this;
				var att = this.attack;
				enemies.forEach(function(enemy, index, array)
				{
					if(Phaser.Math.Distance.Between(adventurer.phaser.x, adventurer.phaser.y, enemy.phaser.x, enemy.phaser.y) < Player.ATTACK_RANGE)
					{
						enemy.change_health(-the_player.attack * Player.CRITIC_MULTIPLIER, true);
						the_player.has_attacked_this_state = true;
						add_score(att * Player.CRITIC_MULTIPLIER);
					}
				});
			}
		}
		
		//Save sword
		else if(this.state == Player.State.SAVE_SWORD)
		{
			this.phaser.anims.play(this.animation_save_sword, true);
		}
		
		//Hurt
		else if(this.state == Player.State.HURT)
		{
			this.phaser.anims.play(this.animation_hurt, true);
			
			// -> Jump
			if(cursors.up.isDown)
			{
				this.state = Player.State.JUMP;
			}
			
			// -> Attack_1
			if(Phaser.Input.Keyboard.JustDown(key_attack))
			{
				this.state = Player.State.ATTACK_1;
				this.chain_attack = false;
				this.has_attacked_this_state = false;
			}
		}
		
		//Die
		else if(this.state == Player.State.DIE)
		{
			;
		}
		
		//Any state (except dead) -> Dash (= Walk)
		if(Phaser.Input.Keyboard.JustDown(key_dash) && this.state != Player.State.DIE)
		{
			this.state = Player.State.WALK;
		}
		
		
		//INVULNERABLE
		//Decrement invulnerable frames if player is invulnerable
		
		if(this.invulnerable)
		{
			this.invulnerable_frames -= 1;
			this.phaser.tint = 0xff0000;
		}
		else{
			this.phaser.tint = 0xffffff;
		}
	}
	
	change_health(value)
	{
		// Hurt player if it isn't invulnerable
		if(value < 0 && !this.invulnerable)
		{
			// Recalculate value (evoiding negative enemy health)
			if((this.health + value) < 0)
			{
				value = value - (this.health + value);
			}
			
			// Make invulnerable
			this.invulnerable_frames = Player.TOTAl_INVULNERABLE_FRAMES;
				
			// Change state (Walk or Idle -> Hurt) 
			if(this.state == Player.State.WALK || this.state == Player.State.IDLE)
			{
				this.state = Player.State.HURT;
			}
			
			// Change state (Any state -> Die) 
			if(this.health == 0)
			{
				game_over(GAME_OVER_DIE);
			}
			
			// Health
			this.health += value;
			
			// Score
			add_score(value);
			
			// Floating Text
			text_damages.push(new TextDamage(this.phaser.x, this.phaser.y, Math.abs(value), RED));
			
			// Health Text
			text_health.text = this.health;	
		}
		
		// Heal player
		else if(value > 0)
		{
			// Recalculate value (evoiding negative player health)
			if(this.health + value > 100)
			{
				value = value - (this.health + value - 100);
			}
			
			// Health
			this.health += value;
			
			// Score
			add_score(value);
			
			// Floating Text
			text_damages.push(new TextDamage(this.phaser.x, this.phaser.y, Math.abs(value), GREEN));
			
			// Health Text
			text_health.text = this.health;	
		}
	}
}

class TextDamage
{
	constructor(x, y, text, color = 0xffffff)
	{
		this.phaser = that.add.bitmapText(x, y, 'mc_font', text, 16);
		this.frames_left = TextDamage.TOTAL_FRAMES;
		this.phaser.tint = color;
	}
	
	static TOTAL_FRAMES = 110;
	
	update()
	{
		this.frames_left -= 1;
		this.phaser.y -= 0.7;
		
		if(this.frames_left <= 0)
		{
			var the_text = this;
			text_damages = text_damages.filter(function(text){ 
				return text != the_text; 
			});
			
			this.phaser.destroy();
		}
	}
}

const WHITE = 0xffffff;
const RED = 0xff0000;
const GREEN = 0x00ff00;
const BLUE = 0x0000ff;
const YELLOW = 0xffff00;
const BLACK = 0x000000;
const DARK_GREY = 0x444444;

const GAME_OVER_DIE = 'GOD'
const GAME_OVER_TIME = 'GOT'
const GAME_OVER_WIN = 'GOW'
const GAME_OVER_RELOAD = 'GOR'

var adventurer; // The player
var enemies = [];

var text_damages = []; // Little numbers that shows the damage points (or others)

var key_attack; //Which key is used to attack
var key_dash; //Which key is used to dash
var key_health; //Which key is used to buy health

var coins_group;
var coins_count = 0; // The number of coins the player has

var timer_second;
var time_left; // The time remaining to beat the game

var text_health;
var text_coins;
var text_time;
var text_score;

var cursors;
var score = 0;
var gameOver = false;
let partida = null;
var game = null;
var that = null;

var map;
var platforms_layer;
var decoration_layer;


function game_over(result)
{
	adventurer.phaser.anims.play(adventurer.animation_die, true);
	
	// Picks the text to display depending on the game over cause
	var text = 'Secret message!';
	if(result === GAME_OVER_DIE)
	{
		text = 'You died!';
	}
	else if(result === GAME_OVER_TIME)
	{
		text = 'Time is over!';
	}
	else if(result === GAME_OVER_WIN)
	{
		text = 'You collected all the coins!';
	}
	else if(result === GAME_OVER_RELOAD)
	{
		text = 'This game is already over';
	}
	
	// Adds a base image
	var rect = that.add.image(400, 270, 'rectangle').setScale(2.6);
	rect.alpha = 0.8;
	
	// Game over text
	that.add.bitmapText(160, 200, 'mc_font', 'GAME OVER', 80, 2).tint = BLACK;
	that.add.bitmapText(160, 280, 'mc_font', text, 40, 2).tint = BLACK;
	that.add.bitmapText(160, 330, 'mc_font', 'Score: ' + score + ' + ' + time_left + ' = ' + (score + time_left), 30, 2).tint = DARK_GREY;
	
	// Stop the timer
	timer_second.remove();
					
	gameOver = true;
}



function startGame(p){
	
	partida = p;
	var game = new Phaser.Game(config);
}

function preload ()
{
    this.load.image('sky', '../assets/sky.png');
    //this.load.image('ground', '../assets/platform.png');
    //this.load.image('star', '../assets/star.png');
    //this.load.image('bomb', '../assets/bomb.png');
    //this.load.spritesheet('dude', '../assets/dude.png', { frameWidth: 32, frameHeight: 48 });
	this.load.spritesheet('adventurer', '../assets/adventurer.png', { frameWidth: 32, frameHeight: 32 });
	this.load.spritesheet('enemy_slime', '../assets/enemy_slime.png', { frameWidth: 32, frameHeight: 32 });
	this.load.spritesheet('enemy_snake', '../assets/enemy_snake.png', { frameWidth: 32, frameHeight: 32 });
	
	this.load.spritesheet('coin', '../assets/coin.png', { frameWidth: 16, frameHeight: 16 });
	
	this.load.image('stats', '../assets/stats.png');
	this.load.image('rectangle', '../assets/rectangle.png');
	
	this.load.bitmapFont('mc_font', '../assets/minecraft_font.png', '../assets/minecraft_font.xml');
	
	this.load.tilemapTiledJSON('map', '../assets/tilemap_phaser.txt');
	this.load.spritesheet('tiles', '../assets/generic-platformer-tiles.png', {frameWidth: 32, frameHeight: 32});
}

function create ()
{
	//To access 'this' anywhere
	that = this;
	
	
	// ***********************************
	// LOAD LEVEL
	// ***********************************
	
	this.add.image(400, 300, 'sky').setScale(1.2);
	
	map = this.make.tilemap({key: 'map'});
	var tiles = map.addTilesetImage('generic-platformer-tiles', 'tiles');
	platforms_layer = map.createStaticLayer('Platforms', tiles, 0, 0);
	platforms_layer.setCollisionByExclusion([-1]);
	decoration_layer = map.createStaticLayer('Decoration', tiles, 0, 0);
	
	
	// ***********************************
	// ANIMATIONS
	// ***********************************
	
	// ADVENTURER ANIMATIONS
	
	// Idle animation
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 12 }),
        frameRate: 10,
        repeat: -1
    });
	
	// Walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 13, end: 20 }),
        frameRate: 10,
        repeat: -1
    });
	
	// Jump animation
    this.anims.create({
        key: 'jump',
        frames: [ { key: 'adventurer', frame: 68 } ],
        frameRate: 20
    });
	
	// Attack_1 animation
    this.anims.create({
        key: 'attack_1',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 26, end: 30 }),
        frameRate: 10
    });
	
	// Attack_2 animation
    this.anims.create({
        key: 'attack_2',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 39, end: 43 }),
        frameRate: 10
    });

	// Attack_3 animation
    this.anims.create({
        key: 'attack_3',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 52, end: 57 }),
        frameRate: 10
    });
	
	// "Save" sword animation
    this.anims.create({
        key: 'save_sword',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 32, end: 35 }),
        frameRate: 10
    });
	
	// Hurt animation
    this.anims.create({
        key: 'hurt',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 78, end: 81 }),
        frameRate: 10
    });
	
	// Die animation
    this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNumbers('adventurer', { start: 91, end: 97 }),
        frameRate: 10
    });
	
	
	// COIN ANIMATION
	this.anims.create({
		key: 'coin',
		frames: this.anims.generateFrameNumbers('coin', {start: 0, end: 7}),
		frameRate: 10,
		repeat: -1
	});

	
	// SLIME ANIMATIONS
	
	// Move animation
	this.anims.create({
		key: 'enemy_slime_move',
		frames: this.anims.generateFrameNumbers('enemy_slime', {start: 0, end: 3}),
		frameRate: 10,
		repeat: -1
	});

	// Attack animation
	this.anims.create({
		key: 'enemy_slime_attack',
		frames: this.anims.generateFrameNumbers('enemy_slime', {start: 16, end: 21}),
		frameRate: 10
	});
	
	// Hurt animation
	this.anims.create({
		key: 'enemy_slime_hurt',
		frames: this.anims.generateFrameNumbers('enemy_slime', {start: 24, end: 27}),
		frameRate: 10
	});
	
	// Die animation
	this.anims.create({
		key: 'enemy_slime_die',
		frames: this.anims.generateFrameNumbers('enemy_slime', {start: 32, end: 39}),
		frameRate: 10
	});
	
	
	// SNAKE ANIMATIONS
	
	// Move animation
	this.anims.create({
		key: 'enemy_snake_move',
		frames: this.anims.generateFrameNumbers('enemy_snake', {start: 0, end: 3}),
		frameRate: 10,
		repeat: -1
	});

	// Attack animation
	this.anims.create({
		key: 'enemy_snake_attack',
		frames: this.anims.generateFrameNumbers('enemy_snake', {start: 16, end: 21}),
		frameRate: 10
	});
	
	// Hurt animation
	this.anims.create({
		key: 'enemy_snake_hurt',
		frames: this.anims.generateFrameNumbers('enemy_snake', {start: 24, end: 27}),
		frameRate: 10
	});
	
	// Die animation
	this.anims.create({
		key: 'enemy_snake_die',
		frames: this.anims.generateFrameNumbers('enemy_snake', {start: 32, end: 39}),
		frameRate: 10
	});
	
	
	// ***********************************
	// SETUP PLAYER, COINS, ENEMIES, ETC
	// ***********************************
	
	coins_group = this.physics.add.group();
	
	// LOAD FROM PARTIDA
	if(partida != undefined)
	{
		// Player
		adventurer = new Player(partida.playerX, partida.playerY, partida.health);
		
		// Coins
		for(let j=0; j<partida.coins.length; j++){
			let c = partida.coins[j];
			let coin = coins_group.create(c.x, c.y, 'coin');
			coin.setScale(1.5);
			coin.anims.play('coin', true);
		}
		
		coins_count = partida.coins_collected;
		
		// Enemies
		for(let j=0; j<partida.enemies.length; j++){
			let e = partida.enemies[j];
			enemies.push(new Enemy(e.type, e.x, e.y, e.move_f, e.health, e.attack, e.speed, e.current_move_f, e.dir));
		}
		
		// Time
		time_left = partida.time;
		
		// Score
		score = partida.score;
		
		// Game over
		gameOver = partida.game_over;
	}
	
	// CREATE NEW
	else
	{
		// Player
		adventurer = new Player(165, 322);
		
		// Coins
		let all_coins = [];
		all_coins.push(coins_group.create(330, 226, 'coin'));
		all_coins.push(coins_group.create(64, 130, 'coin'));
		all_coins.push(coins_group.create(702, 258, 'coin'));
		all_coins.push(coins_group.create(539, 578, 'coin'));
		all_coins.push(coins_group.create(510, 354, 'coin'));
		all_coins.push(coins_group.create(184, 578, 'coin'));
		all_coins.push(coins_group.create(74, 578, 'coin'));
		
		for(let j=0; j<all_coins.length; j++){
			all_coins[j].setScale(1.5);
			all_coins[j].anims.play('coin', true);
		}
		
		coins_count = 0;
		
		// Enemies
		enemies.push(new Enemy(Enemy.Type.SLIME, 240, 322, 100));
		enemies.push(new Enemy(Enemy.Type.SNAKE, 435, 450, 60));
		enemies.push(new Enemy(Enemy.Type.SLIME, 695, 514, 30));
		enemies.push(new Enemy(Enemy.Type.SNAKE, 550, 578, 80));
		enemies.push(new Enemy(Enemy.Type.SLIME, 275, 514, 50));
		enemies.push(new Enemy(Enemy.Type.SLIME, 77, 482, 70));
		enemies.push(new Enemy(Enemy.Type.SNAKE, 548, 130, 90));
		enemies.push(new Enemy(Enemy.Type.SNAKE, 400, 130, 120));
		
		// Time
		time_left = 100;
	}
	
	
	// COLLISIONS, OVERLAPS AND OTHERS
	this.physics.add.collider(coins_group, platforms_layer);
	this.physics.add.collider(adventurer.phaser, platforms_layer);
	this.physics.add.overlap(adventurer.phaser, coins_group, collect_coin, null, this);
	
	adventurer.phaser.on('animationcomplete', function(anim, frame){
		adventurer.animation_complete(anim, frame); // When an animation is completed call this function
	});
	
	enemies.forEach(function(enemy, index, array){
		that.physics.add.collider(enemy.phaser, platforms_layer);
		
		enemy.phaser.on('animationcomplete', function(anim, frame){ 
			enemy.animation_complete(anim, frame); // When an animation is completed call this function
		});
		enemy.phaser.setVelocityX(enemy.speed);
	});
	

    // ****************************************
	// SETUP STATS (HEALTH, COINS, TIME, SCORE)
	// ****************************************

	// Add base images
	this.add.image(740, 47, 'stats').setScale(1.6);
	this.add.image(552, 30, 'rectangle').setScale(0.5);

	// Add texts

	text_health = this.add.bitmapText(730, 15, 'mc_font', adventurer.health, 20);
	text_health.tint = BLACK;
	
	text_coins = this.add.bitmapText(730, 39, 'mc_font', coins_count, 20);
	text_coins.tint = BLACK;
	
	text_time = this.add.bitmapText(730, 63, 'mc_font', time_left, 20);
	text_time.tint = BLACK;
	
	text_score = this.add.bitmapText(510, 24, 'mc_font', score, 20);
	text_score.tint = BLACK;
	
	
	// ***********************************
	// INPUT EVENTS
	// ***********************************
	
	cursors = this.input.keyboard.createCursorKeys();
	
	key_attack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
	key_dash = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
	key_health = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    

	// ***********************************
	// SETUP TIME FUNCTION
	// ***********************************
	
	timer_second = this.time.addEvent({
		delay: 1000,
		callback: update_per_second,
		callbackScope: this,
		loop: true
	});
	
	// CHECK IF THE GAME IS ALREADY OVER
	if(gameOver)
	{
		game_over(GAME_OVER_RELOAD);
	}
}

// Called once per second
function update_per_second()
{
	time_left -= 1;
	text_time.text = time_left;
	
	if(time_left <= 0)
	{
		game_over(GAME_OVER_TIME);
	}
}

function update ()
{
	if(gameOver)
	{
		adventurer.state = Player.State.DIE;
		adventurer.phaser.setVelocityX(0);
	}
	else
	{
		// MANAGE BUY HEALTH
		if(Phaser.Input.Keyboard.JustDown(key_health))
		{
			if(coins_count > 0)
			{
				coins_count -= 1;
				text_coins.text = coins_count;
				
				adventurer.change_health(10);
			}
		}
	}

	// MANAGE PLAYER
	adventurer.update();
	
	// MANAGE ENEMIES
	enemies.forEach(function(enemy, index, array){
		enemy.update();
	});
	
	//MANAGE "FLOATING" TEXTS
	text_damages.forEach(function(text, index, array){
		text.update();
	});
}

function add_score(value)
{
	score += value;
    text_score.text = score;
}

function collect_coin(player, coin)
{
    //  Add and update the score
    add_score(100);
	text_damages.push(new TextDamage(coin.x, coin.y, '100'));
	coins_count += 1;
	text_coins.text = coins_count;
	
	coin.destroy();
	
	// Check if player has all coins
	if(coins_group.getLength() == 0)
	{
		game_over(GAME_OVER_WIN);
	}
}

function saveInfo() {
	let saveobj = {
		game_over: gameOver,
		playerX: adventurer.phaser.x,
		playerY: adventurer.phaser.y,
		health: adventurer.health,
		score: score,
		time: time_left,
		coins_collected: coins_count
	};
	
	saveobj.coins = [];
	saveobj.enemies = [];
	
	coins_group.children.iterate(function (child) {
		saveobj.coins.push({
			x: child.x,
			y: child.y,
		});
	});
	
	
	enemies.forEach(function(enemy, index, array){
		saveobj.enemies.push({
			x: enemy.phaser.x,
			y: enemy.phaser.y,
			type: enemy.type,
			health: enemy.health,
			attack: enemy.attack,
			speed: enemy.speed,
			move_f: enemy.total_move_frames,
			current_move_f: enemy.current_move_frame,
			dir: enemy.direction
		});
	});
	
	return saveobj;
}