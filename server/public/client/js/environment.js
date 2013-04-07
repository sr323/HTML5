//@author - samuel richards - candidate number - 77513
/*
the environment JavaScript file contains 2 classes. The plank class, and the
environment class. The plank class represents each individual plank on a window, 
while the environment class represents all 3 windows and uses the plank class to
 represent planks on the window.
*/
//@param _id - the id of the plank to be assigned on creation
//@param _x - the starting x location of the plank
//@param _y - the starting y location of the plank 
var plank = function(_id, _x, _y){
	//initialises variables
	var id = _id,
	x = _x,
	y = _y,
	health = 5,
	//gets the x value of thr plank
	//return the x variable
	getX = function(){
		return x;
	},
	//gets the y value of the plank
	//return the y variable
	getY = function(){
		return y;
	},
	//sets the y value of the object
	//@param sy - the new y variables value
	setY = function(sy){
		y = sy;
	},
	//sets the x value of the object
	//@param sx - the new x variables value
	setX = function(sx){
		x = sx;
	},
	//gets the health of the object
	//@return the health variable storing the current health of the object
	getHealth = function(){
		return health;
	},
	//sets the health variable of the object
	//@param sH - the new health variables value passed
	setHealth = function(sH){
		health = sH;
	},
	//take damage reduced the current health by the amount passed in
	//@param tD - the amount to take off the health
	takeDamage = function(tD){
		health -= tD;
	},
	//returns true if the plank is alive, and false is it isnt(the health is 0 or below)
	//@return true or false depending on the planks health
	isBroken = function(){
		return health <= 0;
	},
	//gets the id of the plank
	//@return the id of the plank
	getId = function(){
		return id;
	};
	//returns all appropriate variables and functions, used by other classes.
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

/*
The environment class uses the plank class to put 2 planks on each window,
it has methods to test if the planks are broken or alive. If the planks
on a window are broken zombies can run straight in.
@param _plankImage the plank image to be drawn in its location
*/
var environment = function(_plankImage){
	//initialise variables
	var plankImage = _plankImage;
	var planks = [];
	//for loops through placing 2 planks at each window, one above, one below.
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
	//sets the planks in there appropriate x location.
	planks[2].setX(377);
	planks[3].setX(377);
	planks[4].setX(608);
	planks[5].setX(608);
	//gets the planks array list
	//@return planks - the array list of planks
	var getPlanks = function(){
		return planks;
	};

	//function is used when the house is attacked, it is given a window number
	//and the damage of the attack, and damages the appropriate plank the amount.
	//if the top plank is broken, the second plank should be damaged.
	//@param _window the window number to attack, 1, 2 or 3.
	//@param damage the amount to damage the window by
	var attackHouse = function(_window, damage){
		window.repairTimer = 0;
		//switch case to break the appropriate window.
		//Should always break the top plank first, then the bottom plank
		switch(_window){
			case 1:
			  	if(!planks[0].isBroken()){
			  		//plank take damage minuses a set amount from the planks health
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

	//function checks given a specific window if the window has both planks
	//broken, this is used by zombies to check if they can enter the house
	//at this location.
	//@param _window the window number
	//@return true if the windows planks are both broken, false otherwise
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

	//function checks if one or more of the planks break at a specific window.
	//@param _window the number of the window that will be evaluated
	//@return true if a single or more plank is broken on the window, false otherwise.
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

	//function given a specific window number fixes one of the planks on the window.
	//this is triggered by user input. The top plank will always be fixed before the bottom plank.
	//@param the window number where a plank will be fixed
	var repair = function(_window){
		//switch case between window numbers
		switch(_window){
			case 1:
				//if the first plank is broken, fix it, otherwise check and fix the second
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

	//Draws all the planks on the appropriate windows
	//@param context - the canvas the planks will be drawn on
	var draw = function(context){
		for(var i = 0; i < 6; i++){
			if(!planks[i].isBroken()){//if the plank is broken, don't draw it.
				context.drawImage(plankImage, //Image
				0, 0, /*Source image x and y*/
				320,80, /*Source image width and height*/
				planks[i].getX(), planks[i].getY(), /* Destination canvas x and y */
				70,20); /*Destination width and height*/
			}
		}
	};
	//returns all appropriate functions for external class use.
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