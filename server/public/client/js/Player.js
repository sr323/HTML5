/*
*@author samuel richards
*@candidate number: 77513
*
* Description: the player class of the game, this game is controlled by the user.
*/
//@_param _zombieSprite - is actually the human sprite image
var Player = function(_zombieSprite){


	//Sprite variables.
	var zombieSprite = _zombieSprite, currentSprite = 0, spriteChange = 0;
	//Player variables.
	var x = 400, y = 300, moveSpeed = 3, moved = false, direction = 6, dead = false, justMoved = false, deathAnimFinished =  false, damage = 1;
	//Combat stats
	var pierce = false;

	var sound = false;

	var health = 20; 
	//takes damage from health
	//@param deeps - the damage to take
	var takeDamage = function(deeps){
		if(health > 0){
			health -= deeps;
		}
		//if health == 0 kill the player
		if(getDead()){
			dead = true;
			if(!sound){
				window.deathsound.play();
				sound = true;
				console.log("play sound");
			}
		}

		window.addDamageText();
	};
	//gets the health
	//@return health return health
	var getHealth = function(){
		return health;
	};
	//sets the health
	//@param heal - the heal amount
	var setHealth = function(heal){
		console.log(heal);
		if(health < 20){
			health = heal;
		}
		if(health > 20){
			health = 20;
		}
	};
	//resets health to 10
	var resetHealth = function(){
		health = 10;
	};
	//returns true if dead aka health = 0
	//@return health = 0 true else false
	var getDead = function(){
		return health == 0;
	};
	//sets pierce of player bullets
	//@param s - the new pierce value
	var setPierce = function(s){
		pierce = s;
	};
	//gets the pierce of player bullets
	//@rturn pierce te pierce value
	var getPierce = function(){
		return pierce;
	};

	//Bounding box
	var boxWidth = 30;
	var boxHeight = 60;
	//returns the x value of the box
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	//returns the y value of the box
	var boxY = function(){
		return getY() - (boxHeight/2);
	};

	//Pre-rendering canvas used for optimisation
	var render_canvas = document.createElement('canvas');
	render_canvas.width = 4608;
	render_canvas.height = 1024;
	var render_context = render_canvas.getContext('2d');

	render_context.drawImage(zombieSprite,0,0, render_canvas.width, render_canvas.height);


	/*Getters and setters.*/
	//returns current x
	var getX = function(){
		return x;
	};
	//returns current y
	var getY = function(){
		return y;
	};
	//sets the x value
	var setX = function(_x){
		x = _x;
	};
	//sets the y value
	var setY = function(_y){
		y = _y;
	};
	//returns movement speed
	var getmoveSpeed = function(){
		return moveSpeed;
	};
	//sets moved variable used to draw standing or running sprite
	var setMoved = function(_moved){
		moved = _moved;
	};
	//sets move speed
	var setmoveSpeed = function(speed){
		moveSpeed = speed;
	};
	//gets the direction the player is facing
	var getDir = function(){
		return direction;
	};
	//sets the direction of the player
	var setDir = function(_dir){
		direction = _dir;
	};
	//sets the damage of the player
	var setDamage = function(f){
		damage = f;
	};
	//gets the damage of the player
	var getDamage = function(){
		return damage;
	};
	//sprite iterate will keep the correct sprite being displayed
	var spriteIterate = function(){
		if(!dead && moved){
			walk();
		}
		else if(!dead){
			stand();
		}
		else{
			die();
		}
	};
		//if standing draw standing sprite
	var stand = function(){
		//first 4 columns - standing still.
		if(currentSprite < 3){
			currentSprite++;
		}
		else{
			currentSprite = 0;
		}
	};
		//if walking draw walking sprites
	var walk = function(){
		//columns 5-12 - walking.
		if(currentSprite < 11 && currentSprite > 4){
			currentSprite++;
		}
		else{
			currentSprite = 5;
		}
	};
	//if attacking draw attacking sprites
	var attack = function(){
		//columns 13-22 - attacking.
	};
	//if dead draw dead sprites
	var die = function(){
		if(!deathAnimFinished){
			//Death shouldn't loop.
			if(currentSprite < 27 && currentSprite > 22){
				currentSprite++;
				if(currentSprite == 27){
					deathAnimFinished = true;
				}
			}
			else{
				currentSprite = 23;
			}
		}
	};
	//draw method to draw the player
	//@param context - the canvas to draw onto
	var draw = function(context){
		context.drawImage(render_canvas, //Image
			currentSprite * 128, direction * 128, /*Source image x and y*/
			128,128, /*Source image width and height*/
			x -96, y-96, /* Destination canvas x and y */
			192,192); /*Destination width and height*/
		moved = false;
	};

	//draw the bounding box
	//@param context - the canvas to draw onto
	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	//returns all variables and functions for external use
	return{
		getX:getX,
		getY:getY,
		setX:setX,
		setY:setY,
		setMoved:setMoved,
		getmoveSpeed:getmoveSpeed,
		setmoveSpeed:setmoveSpeed,
		getDir:getDir,
		setDir:setDir,
		draw:draw,
		spriteIterate:spriteIterate,
		drawBoundingBox:drawBoundingBox,
		boxX:boxX,
		boxY:boxY,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		takeDamage:takeDamage,
		getHealth:getHealth,
		setHealth:setHealth,
		resetHealth:resetHealth,
		getDead:getDead,
		getDamage:getDamage,
		setDamage:setDamage, 
		setPierce:setPierce,
		getPierce:getPierce
	}
};