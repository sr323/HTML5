var plank = function(_id, _x, _y){
	var id = _id,
	x = _x,
	y = _y,
	health = 5,
	//width = 90,
	//height = 20,
	//left - 182 to 192
	//Middle - 615 to 625
	//Right - 980 to 990
	// y = 85 or 45

	getX = function(){
		return x;
	},
	getY = function(){
		return y;
	},
	setY = function(sy){
		y = sy;
	},
	setX = function(sx){
		x = sx;
	},
	getHealth = function(){
		return health;
	},
	setHealth = function(sH){
		health = sH;
	},
	takeDamage = function(tD){
		health -= tD;
	},
	isBroken = function(){
		return health <= 0;
	},
	getId = function(){
		return id;
	};

	return{
		getX:getX,
		getY:getY,
		setX:setX,
		setY:setY,
		getHealth:getHealth,
		setHealth:setHealth,
		getId:getId,
		isBroken:isBroken,
		takeDamage:takeDamage
	};

};

var environment = function(_plankImage){
	var plankImage = _plankImage;
	var planks = [];
	for(var i = 0; i < 6; i++){
		var modY;
		if(i % 2 == 0){
			modY = 39;
		}
		else{
			modY = 67;
		}
		planks.push(new plank(i, 108, modY));
	};
	planks[2].setX(377);
	planks[3].setX(377);
	planks[4].setX(608);
	planks[5].setX(608);

	var getPlanks = function(){
		return planks;
	};

	var attackHouse = function(_window, damage){
		window.repairTimer = 0;
		switch(_window){
			case 1:
			  	if(!planks[0].isBroken()){
			  		planks[0].takeDamage(damage);
			  	}
			  	else if(!planks[1].isBroken()){
			  		planks[1].takeDamage(damage);
			  	}
			  break;
			case 2:
			  if(!planks[2].isBroken()){
			  		planks[2].takeDamage(damage);
			  	}
			  	else if(!planks[3].isBroken()){
			  		planks[3].takeDamage(damage);
			  	}
			  break;
			default:
			  if(!planks[4].isBroken()){
			  		planks[4].takeDamage(damage);
			  	}
			  	else if(!planks[5].isBroken()){
			  		planks[5].takeDamage(damage);
			  	}
			  break;
		}

	};

	var isBroken = function(_window){
		switch(_window){
			case 1:
			  	return (planks[0].isBroken() && planks[1].isBroken());
			  break;
			case 2:
			  	return (planks[2].isBroken() && planks[3].isBroken());
			  break;
			default:
			  	return (planks[4].isBroken() && planks[5].isBroken()); 
			  break;
		}
	};

	var anyBroken = function(_window){
		switch(_window){
			case 1:
			  	return (planks[0].isBroken() || planks[1].isBroken());
			  break;
			case 2:
			  	return (planks[2].isBroken() || planks[3].isBroken());
			  break;
			default:
			  	return (planks[4].isBroken() || planks[5].isBroken()); 
			  break;
		}
	};

	var repair = function(_window){
		switch(_window){
			case 1:
			  	if(planks[0].isBroken()){
			  		planks[0].setHealth(5);
			  	}
			  	else if(planks[1].isBroken()){
					planks[1].setHealth(5);
			  	}
			  break;
			case 2:
			  	if(planks[2].isBroken()){
			  		planks[2].setHealth(5);
			  	}
			  	else if(planks[3].isBroken()){
			  		planks[3].setHealth(5);
			  	}
			  break;
			default:
			  	if(planks[4].isBroken()){
			  		planks[4].setHealth(5);
			  	} 
			  	else if(planks[5].isBroken()){
			  		planks[5].setHealth(5);
			  	} 
			  break;
		}
	};

	var draw = function(context){
		for(var i = 0; i < 6; i++){
			if(!planks[i].isBroken()){
				context.drawImage(plankImage, //Image
				0, 0, /*Source image x and y*/
				320,80, /*Source image width and height*/
				planks[i].getX(), planks[i].getY(), /* Destination canvas x and y */
				70,20); /*Destination width and height*/
			}
		}
	};

	return{
		planks:planks,
		getPlanks:getPlanks,
		attackHouse:attackHouse,
		draw:draw,
		isBroken:isBroken,
		anyBroken:anyBroken,
		repair:repair
	};
};