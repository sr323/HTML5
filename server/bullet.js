/*
*@author samuel richards
*@candidate number: 77513
*
* Description: A remote class for the bullet objects. A remote class is a class which is used just for storing information on the server
about objects in the game, this allows for all clients to recieve information, but only the information they need. For example
the class doesn't include a draw method, as this is all client side.

this class is initiated when a client fires a bullet, and has to pass in all relevant information for the bullet ro act appropriates, 
for example head in the right direction from a certain point.
*/

//Bullet function is used as a Java class.
/*
@param _x the x co-ordinate the bullet starts from
@param _y the y co-ordinate the bullet starts from
@param _xDir the x direction the bullet will travel towards
@param _yDir the y direction the bullet will travel towards 
@param _pierce the pierce value, true or false, a pick up for users
@param _damage the damage of the bullet when it hits an object
@param _id the id of the bullet
@param _bulletsize the size of the bullet - the size changes on client pick ups
@return returns all of the variables and function for use by the main game JavaScript file
*/
var bullet = function(_x,_y, _xDir, _yDir, _pierce, _damage, _id, _bulletSize){
	//initialisation of variables
	var x = _x, y = _y, speed = 1, xDir = _xDir, yDir = _yDir, pierce = _pierce, damage = _damage, TTL = 400;
	var id = _id;
	var bulletSize = _bulletSize;

	//Bounding box
	var boxWidth = bulletSize;
	var boxHeight = bulletSize;
	//@return returns the x location of the bounding box
	var boxX = function(){
		return x - (boxWidth/2);
	};
	//@return returns the y location of the bounding box
	var boxY = function(){
		return y - (boxHeight/2);
	};
	//the Time To Live bullet variable
	//@return the TTL integer variable
	var getTTL = function(){
		return this.TTL < 1;
	};
	//gets the x variable of the current bullet
	//@return returns the x variable
	var getX = function(){
		return this.x;
	};
	//@return returns the y variable of the y variable
	var getY = function(){
		return this.y;
	};
	//Sets the value of the x variable
	//@param s the new x value
	var setX = function(s){
		x = s;
	};
	//Sets the y value
	//@param f - the new y variable
	var setY = function(f){
		y = f;
	};

	//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	//Update is called 60 times a second while the game is active, each call keeps the bullet moving in an appropriate direction
	var update = function(){
		this.x = this.x + (xDir * (speed / 75));
		this.y = this.y + (yDir * (speed / 75));
		this.TTL--;
	};

	//Returns all appropriate values and functions for use by the main game server
	return{
		update:update,
		boxX:boxX,
		x:x,
		y:y,
		boxY:boxY,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		getTTL:getTTL,
		id:id,
		getX:getX,
		getY:getY,
		setX:setX,
		setY:setY,
		TTL:TTL,
		bulletSize:bulletSize,
		pierce:pierce
	}

};

//Exports the bullet - so the main game loop can create instances of this function
exports.Bullet = bullet;