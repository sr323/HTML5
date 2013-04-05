var zombie = function(_id,_x, _y, __window,_timer){
	//Starting stats
	var inside = false, x = _x, y = _y, _window = __window, direction = 6, destination = 0, boxDiam = 192, environment = window.housePlanks, id = _id;
	//Combat stats
	var health = 10, damage = 1, speed = 1, attacking = false, finishedAttack = false, deathAnimFinished = false, deathType = (Math.floor(Math.random() * 500) + 1);
	//Random drop - 1 to 4 is a random pick up, 0 is nothing.
	var drop = new randomDrop().drop;
	var droppedPickup = false;
	var timer = _timer;
	var currentTime = 0;

	var scoreAdd = false;

	//console.log(drop);
	//Bounding Box
	var boxWidth = 40;
	var boxHeight = 60;
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	var boxY = function(){
		return getY() - (boxHeight/2);
	};

	//Sprite stats
	var currentSprite = 0, image = window.loadedImages._zombieSprite;

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

	var getX = function(){
		return x;
	};

	var getid = function(){
		return id;
	};

	var getY = function(){
		return y;
	};

	var setX = function(sx){
		x = sx;
	};

	var setY = function(sy){
		y = sy;
	};

	var getInside = function(){
		return inside;
	};

	var setHealth = function(sH){
		health = sH;
	};

	var getHealth = function(){
		return health;
	};

	var takeDamage = function(deeps){
		health = health - deeps;
	};

	var getScoreAdd = function(){
		return scoreAdd;
	};

	var setScoreAdd = function(f){
		scoreAdd = f;
	};

	var getWindow =  function(){
		return _window;
	};

	var getTimer = function(){
		return timer;
	};

	var getCurrentTime = function(){
		return currentTime;
	};

	var setCurrentTime = function(s){
		currentTime = s;
	};

	var setInside = function(s){
		inside = s;
	};

	var setDrop = function(f){
		drop = f;
	}

	destinationAssign();

	//Draw - update - attack
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

	var walk = function(){
		//columns 5-12 - walking.
		if(currentSprite < 11 && currentSprite > 3){
			currentSprite++;
		}
		else{
			currentSprite = 4;
		}
	};

	var deathAnim = function(){
		if(deathType < 100){
			if(!deathAnimFinished){
				//Death shouldn't loop.
				//36 wide.
				if(currentSprite < 35 && currentSprite > 27){
					currentSprite++;
					if(currentSprite == 35){
						deathAnimFinished = true;
					}
				}
				else{
					currentSprite = 28;
				}
			}
		}
		else{
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
		}
	};

	var draw = function(context){
		context.drawImage(image, //Image
		currentSprite * 128, direction * 128, /*Source image x and y*/
		128,128, /*Source image width and height*/
		x -96, y-96, /* Destination canvas x and y */
		boxDiam,boxDiam); /*Destination width and height*/
	};

	var update = function(_player, collisionDetection){
		//Simple update call
		if(currentTime < timer){
			currentTime++;
		}
		else{
			//Should check for collision detection.
			if(health > 0){
				if(inside){

					var movedXMinus = false;
					var movedXPlus = false;
					var movedYMinus = false;
					var movedYPlus = false;

					//x + means facing right
					//Where y + means facing south
					//host getting a 195 error.

					if(_player.getX() < getX()){
						movedXMinus = true;
					}
					else if(_player.getX() > getX()){
						movedXPlus = true;
					}
					if(_player.getY() < getY()){
						movedYPlus = true;
					}
					else if(_player.getY() > getY()){
						movedYMinus = true;
					}

					//Check/set direction before attacking.
					if(movedYMinus && movedXMinus){
						direction = 7;
						//console.log("South west");
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

					if(collisionDetection(_player,this)){
						if(finishedAttack){
							finishedAttack = false;
							try{_player.takeDamage(damage);}
							catch(e){}//console.log(e);console.log("tried to attack a player without take damage as the player being attacked is a remote player");}
						}
						else{
							attacking = true;
						}
					}
					else if(!attacking){
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
					headToWindow();
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

	var headToWindow = function(){
		/*
		Should check that they are at the destination, and try smashing the corresponding window.
		*/
		var destY = 50;

		if(getY() == destY && getX() == destination){
			if(environment.isBroken(_window)){
				inside = true;
			}
			else{
				if(finishedAttack){
					finishedAttack = false;
					environment.attackHouse(_window,damage);
				}
				else{
					attacking = true;
				}
			}
		}
		else{
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

	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	return{
		draw:draw,
		getInside:getInside,
		setInside:setInside,
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
		setScoreAdd:setScoreAdd,
		getid:getid,
		getHealth:getHealth,
		getWindow:getWindow,
		getTimer:getTimer,
		getCurrentTime:getCurrentTime,
		setCurrentTime:setCurrentTime,
		setDrop:setDrop
	}
};

var randomDrop = function(){	
	//Numebr between 1 and 4.
	//The Math.random() * n - the n is the multiplyer that drops the random drops.
	var dropType = (Math.floor(Math.random() * 6) + 1);
	var drop = 0;
	if(dropType < 6){
		drop = (Math.floor(Math.random() * 5) + 1);
	}

	return{
		drop:drop
	}
};