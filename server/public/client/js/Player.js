var Player = function(_zombieSprite){/*Zombies will have parameters passed in.*/

	//Things to add.. bullet speed manipulation. bullet piercin.

	//Sprite variables.
	var zombieSprite = _zombieSprite, currentSprite = 0, spriteChange = 0;
	//Player variables.
	var x = 400, y = 300, moveSpeed = 3, moved = false, direction = 6, dead = false, justMoved = false, deathAnimFinished =  false, damage = 1;
	//Combat stats
	var pierce = false;

	var sound = false;

	var health = 20; 
	var takeDamage = function(deeps){
		if(health > 0){
			health -= deeps;
		}
		if(getDead()){
			dead = true;
			if(!sound){
				window.deathsound.play();
				sound = true;
				console.log("play sound");
			}
		}

		window.addDamageText();

		//Should have a flashing red hit marker here.
		//console.log("Taken " + deeps + " damage."); 
	};
	var getHealth = function(){
		return health;
	};
	var setHealth = function(heal){
		console.log(heal);
		if(health < 20){
			health = heal;
		}
		if(health > 20){
			health = 20;
		}
	};
	var resetHealth = function(){
		health = 10;
	};
	var getDead = function(){
		return health == 0;
	};

	var setPierce = function(s){
		pierce = s;
	};

	var getPierce = function(){
		return pierce;
	};

	/*Should put the update for the player in the actual player class.. -.-*/

	//Bounding box
	var boxWidth = 30;
	var boxHeight = 60;
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	var boxY = function(){
		return getY() - (boxHeight/2);
	};

	//Pre-rendering canvas
	var render_canvas = document.createElement('canvas');
	render_canvas.width = 4608;
	render_canvas.height = 1024;
	var render_context = render_canvas.getContext('2d');

	render_context.drawImage(zombieSprite,0,0, render_canvas.width, render_canvas.height);

	//Append the canvas onto the gameCanvasDiv element on the HTML page to check the image is correct.
	//gameCanvasDiv.appendChild(render_canvas);

	/*Getters and setters.*/

	var getX = function(){
		return x;
	};

	var getY = function(){
		return y;
	};

	var setX = function(_x){
		x = _x;
	};

	var setY = function(_y){
		y = _y;
	};

	var getmoveSpeed = function(){
		return moveSpeed;
	};

	var setMoved = function(_moved){
		moved = _moved;
	};

	var setmoveSpeed = function(speed){
		moveSpeed = speed;
	};

	var getDir = function(){
		return direction;
	};

	var setDir = function(_dir){
		direction = _dir;
	};

	var setDamage = function(f){
		damage = f;
	};

	var getDamage = function(){
		return damage;
	};

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

		/*ZOMBIE SPRITE STATS
		  After handlers has been created then animation should begin.*/

		/*Zombie sprite dimensions:
		4608 wide. 36 sprites across.  128px for each.
		1024 high. 8 sprite rows down. 128px for each.

		row 0 - facing west.
		row 1 - facing north west.
		row 2 - facing north.
		row 3 - facing north east.
		row 4 - facing east.
		row 5 - facing south east.
		row 6 - facing south.
		row 7 - facing south west
		*/
	};

	var stand = function(){
		//first 4 columns - standing still.
		if(currentSprite < 3){
			currentSprite++;
		}
		else{
			currentSprite = 0;
		}
	};

	var walk = function(){
		//columns 5-12 - walking.
		if(currentSprite < 11 && currentSprite > 4){
			currentSprite++;
		}
		else{
			currentSprite = 5;
		}
	};

	var attack = function(){
		//columns 13-22 - attacking.
	};

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

	var draw = function(context){
		//Maybe have to -64 from x and y, to keep the image on it's exact x and y.
		//and not drawing from it, this would fuck collision detection.
		context.drawImage(render_canvas, //Image
			currentSprite * 128, direction * 128, /*Source image x and y*/
			128,128, /*Source image width and height*/
			x -96, y-96, /* Destination canvas x and y */
			192,192); /*Destination width and height*/
		moved = false;
	};


	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	//Must remember to return all possible functions here.
	//Otherwise they can't be seen by other classes.
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