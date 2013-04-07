/*
*@author samuel richards
*@candidate number: 77513
*
* Description: A remote class for the players. A remote class is a class which is used just for storing information on the server
about objects in the game, this allows for all clients to recieve information, but only the information they need. For example
the class doesn't include a draw method, as this is all client side.

the player class creates an instance of all playing users, and is used to keep information about the different players, to distribute 
information.
*/

/**************************************************
** GAME PLAYER CLASS
**************************************************/
//The Player variable is a function which is used as a class.
//@param startX - the x location of the player on connect
//@param startY - the y location of the player on connect
//@param startDir - the starting direction of the player on connect
var Player = function(startX, startY, startDir) {
	//initialise variables
	var x = startX,
		y = startY,
		dir = startDir,
		id,
		dead = false,
		host = false;

	// Getters and setters all for use by the main game JavaScript server file
	//@return returns the x value
	var getX = function() {
		return x;
	};
	//gets the y value
	//@return returns the y value
	var getY = function() {
		return y;
	};
	//gets the dir variable
	//@return returns the direction value
	var getDir = function(){
		return dir;
	};
	//gets the host variable
	//@return returns the host value 
	var gethost = function(){
		return host;
	};
	//Sets the host variable - true or false
	//@param d - the new host value to be set
	var sethost = function(d){
		host = d;
	};
	//gets the dead variable of the class
	//@returns - dead which is true or false.
	var getDead = function(){
		return dead;
	};
	//Sets the dead variable 
	//@param b - the information to be set
	var setDead = function(b){
		dead = b;
	};
	//Sets the x variable to a new value
	//@param newX - the new information that x will become
	var setX = function(newX) {
		x = newX;
	};
	//Sets the y variable to a new value
	//@param newY - the new value which y will become
	var setY = function(newY) {
		y = newY;
	};
	//sets the direction  variable of the class
	//@param newDir - the new direction value
	var setDir = function(newDir){
		dir = newDir;
	}
	
	//Returns the values and functions which are for use by external files
	return {
		getX: getX,
		getY: getY,
		getDir: getDir,
		setX: setX,
		setY: setY,
		setDir: setDir,
		id: id,
		getDead:getDead,
		setDead:setDead,
		host:host
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;