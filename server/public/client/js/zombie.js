/*
*@author samuel richards
*@candidate number: 77513
*
* Description: the zombie class of the game
*/
//@param _id - id of the zombie
//@param _x - starting x location
//@param _y - starting y location
//@param _window - window to run to
//@param _image - image to draw
//@param _environment - the house environment
//@param _timer - the timer before acting to the world
var zombie = function(_id,_x, _y, __window, _image, _environment,_timer){
	//Starting stats
	var inside = false, x = _x, y = _y, _window = __window, direction = 6, destination = 0, boxDiam = 192, environment = _environment, id = _id;
	//Combat stats
	var health = 10, damage = 1, speed = 1, attacking = false, finishedAttack = false, deathAnimFinished = false, deathType = (Math.floor(Math.random() * 500) + 1);
	//Random drop - 1 to 4 is a random pick up, 0 is nothing.
	var drop = new randomDrop().drop;
	var droppedPickup = false;
	var timer = _timer;
	var currentTime = 0;
	var scoreAdd = false;

	//Bounding Box
	var boxWidth = 40;
	var boxHeight = 60;
	//returns the x value of the box
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	//returns the y value of the box
	var boxY = function(){
		return getY() - (boxHeight/2);
	};

	//Sprite stats
	var currentSprite = 0, image = _image;
	//uses the window and translates 1,2 or 3 to an actual x co-ordinate
	var destinationAssign = function(){
		if(_window == 1){
			destination = Math.floor((Math.random() * 22) + 130);
		}
		else if(_window == 2){
			destination = Math.floor((Math.random() * 22) + 404);
		}
		else if(_window == 3){
			destination = Math.floor((Math.random() * 22) + 635);
		}
		else{
			console.log("ERROR WITH _window RANDOM ON ZOMBIE CLASS");
		}
	};
	//returns x location
	var getX = function(){
		return x;
	};
	//returns y location
	var getY = function(){
		return y;
	};
	//sets the x variable
	//@param sx - the new x value
	var setX = function(sx){
		x = sx;
	};
	//sets the y variable
	//@param sy - the new y value
	var setY = function(sy){
		y = sy;
	};
	//returns true if the zombie is in the house or false
	var getInside = function(){
		return inside;
	};
	//sets the health of the zombie
	//@param sH - the health to be set
	var setHealth = function(sH){
		health = sH;
	};
	//returns the current health of the zombie
	var getHealth = function(){
		return health;
	};
	//damages the zombies health
	//@param deeps - the amount to damage the zombie
	var takeDamage = function(deeps){
		health = health - deeps;
	};
	//returns the score add which is used to add score when the zombie dies
	var getScoreAdd = function(){
		return scoreAdd;
	};
	//set score add to false after it is added
	//@param f scoreAdds' new value
	var setScoreAdd = function(f){
		scoreAdd = f;
	}
	//triggers the event to inform the zombie which window location to run to
	destinationAssign();

	//insure the correct sprite is being drawn
	var spriteIterate = function(){
		if(health > 0){
			if(!attacking){
				walk();
			}
			else{
				attack();
			}
		}
		else{
			deathAnim();
		}
	};
	//keeps drawing the zombie in the attacking form
	var attack = function(){
		if(currentSprite < 21 && currentSprite > 12){
			currentSprite++;
			if (currentSprite == 21) {attacking = false;finishedAttack = true;};
		//	console.log(currentSprite);
		}
		else{
			currentSprite = 13;
		}
	};
	//keeps drawing the zombie in the walking form
	var walk = function(){
		//columns 5-12 - walking.
		if(currentSprite < 11 && currentSprite > 3){
			currentSprite++;
		}
		else{
			currentSprite = 4;
		}
	};
	//drawing the zombie in the death form
	var deathAnim = function(){
		if(deathType < 100){ //headshot sprite
			if(!deathAnimFinished){
				if(currentSprite < 35 && currentSprite > 27){
					currentSprite++;
					if(currentSprite == 35){
						deathAnimFinished = true;//death animation sprite shouldnt loop
					}
				}
				else{
					currentSprite = 28;
				}
			}
		}
		else{
			if(!deathAnimFinished){//non-headshot sprite draw
				if(currentSprite < 27 && currentSprite > 22){
					currentSprite++;
					if(currentSprite == 27){
						deathAnimFinished = true;//death animation sprite shouldnt loop
					}
				}
				else{
					currentSprite = 23;
				}
			}
		}
	};
	//draws the zombie onto the world
	//@param context - the canvas to draw the zombie onto
	var draw = function(context){
		context.drawImage(image, //Image
		currentSprite * 128, direction * 128, /*Source image x and y*/
		128,128, /*Source image width and height*/
		x -96, y-96, /* Destination canvas x and y */
		boxDiam,boxDiam); /*Destination width and height*/
	};

	//The update method is the method which is called 60 times a second and keeps the zombie moving
	//@param player - the player to check for collision detection
	//@param collisionDetection - the method to collision detect
	var update = function(player, collisionDetection){
		if(currentTime < timer){//should only move every n updates, otherwise would be too quick
			currentTime++;
		}
		else{
			if(health > 0){//if not dead
				if(inside){ //and if inside run to the player location
					//this finds the player, runs to him and changes zombie direction
					var movedXMinus = false;
					var movedXPlus = false;
					var movedYMinus = false;
					var movedYPlus = false;

					if(player.getX() < getX()){
						movedXMinus = true;
					}
					else if(player.getX() > getX()){
						movedXPlus = true;
					}
					if(player.getY() < getY()){
						movedYPlus = true;
					}
					else if(player.getY() > getY()){
						movedYMinus = true;
					}

					if(movedYMinus && movedXMinus){
						direction = 7;

					}
					else if(movedYMinus && movedXPlus){
						direction = 5;
						//console.log("South east");
					}
					else if(movedYPlus && movedXPlus){
						direction = 3;
						//console.log("North east");
					}
					else if(movedYPlus && movedXMinus){
						direction = 1;
						//console.log("North west");
					}
					else if(movedYPlus){
						//console.log("North");
						direction = 2;
					}
					else if(movedYMinus){
					//	console.log("South");
						direction = 6;
					}
					else if(movedXPlus){
						//console.log("East");
						direction = 4;
					}
					else if(movedXMinus){
						//console.log("West");
						direction = 0;
					}
					//checks collision detection, if the zombie and the player collide, attack the player
					if(collisionDetection(player,this)){
						if(finishedAttack){
							finishedAttack = false;//if the sprite to attack has ended
							player.takeDamage(damage); //attack the player and he takes damage
						}
						else{
							attacking = true;
						}
					}
					else if(!attacking){//if not attacking then move location
						if(movedXMinus){
							setX(x - speed);
						}
						else if(movedXPlus){
							setX(x + speed);
						}
						if(movedYPlus){
							setY(y - speed);
						}
						else if(movedYMinus){
							setY(y + speed);
						}

					}
				}
				else{
					headToWindow();//if not inside, head to the window to break through
				}
			}
			else if(!droppedPickup){
				if(drop != 0){
					window.dropRandom(drop, x, y, inside);
					droppedPickup = true;
				}
			}
		}

	};

	//if the zombie isn't inside, it heads to the window location and breaks through
	var headToWindow = function(){
		/*
		Should check that they are at the destination, and try smashing the corresponding window.
		*/
		var destY = 50;
		//if the zombie is at the window location
		if(getY() == destY && getX() == destination){
			if(environment.isBroken(_window)){//check if the window is broken
				inside = true;//if it is run inside
			}
			else{//else attack the window
				if(finishedAttack){
					finishedAttack = false;
					environment.attackHouse(_window,damage);
				}
				else{
					attacking = true;
				}
			}
		}
		else{//if not at the location then move to the location
			if(getY() < destY){
				setY(getY() + speed);
			}
			if(getX() < destination){
				setX(getX() + speed);
			}
			else if(getX() > destination){
				setX(getX() - speed);
			}
		}
	};
	//draw the bounding box of the element
	//@param context - the canvas to draw onto
	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	//return all the variables and functions for use externally
	return{
		draw:draw,
		getInside:getInside,
		health:health,
		getX:getX,
		getY:getY,
		setX:setX,
		setY:setY,
		update:update,
		spriteIterate:spriteIterate,
		drawBoundingBox:drawBoundingBox,
		boxX:boxX,
		boxY:boxY,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		setHealth:setHealth,
		getHealth:getHealth,
		takeDamage:takeDamage,
		getScoreAdd:getScoreAdd,
		setScoreAdd:setScoreAdd
	}
};
//random drop is a simple method which just returns a random number to represent a pick-up drop type
var randomDrop = function(){	
	//random number to check if the zombie drops a random pick-up
	var dropType = (Math.floor(Math.random() * 6) + 1);
	var drop = 0;
	if(dropType < 6){	//if the number is lower than 6 then assign a random pick-up number
		drop = (Math.floor(Math.random() * 5) + 1);	//random drop is between 1 - 5
	}
	//returns the drop number for external use
	return{
		drop:drop
	}
};