/*
*@author samuel richards
*@candidate number: 77513
*
* Description: A remote class for the zombie objects. A remote class is a class which is used just for storing information on the server
about objects in the game, this allows for all clients to recieve information, but only the information they need. For example
the class doesn't include a draw method, as this is all client side.
 
The zombie class stores information about a specific zombie and is updated constantely by the host, the information is used when 
passing information to clients.
*/

/**************************************************
** GAME ZOMBIE CLASS
**************************************************/
//The Zombie variable is a function which is used like a Java class.
//@param _id - the id of the zombie
//@param startX - the starting x location of the zombie
//@param startY - te starting y location of the zombie
//@param _window - the window which the zombie will attack
//@param _timer - the timer which is counted too before the zombie reacts to the world
var Zombie = function(_id,startX, startY, _window, _timer) {
	//initialises variables
	var x = startX,
		y = startY,
		id = _id,
		qwindow = _window,
		timer = _timer,
		dead = false,
		health = 10,
		inside = false,
		currentTime = 0,
		addedScore = false;

	// Getters and setters for use by external classes.
	//gets the x variable
	//@return the x variable
	var getX = function() {
		return this.x;
	};
	//gets the y variable 
	//@return the y variable
	var getY = function() {
		return this.y;
	};
	//sets the x variable a new value
	//@param newX - the new value which x will become
	var setX = function(newX) {
		this.x = newX;
	};
	//sets the y variable a new value
	//@param newY - the new value which y will become
	var setY = function(newY) {
		this.y = newY;
	};
	//gets the dead variable for use by an external class
	//@return the dead variable  which is true or false
	var getDead = function(){
		return this.dead;
	};
	//sets the dead variable with a new value
	//@param s - the new value for the variable
	var setDead = function(s){
		this.dead = s;
	};
	//gets the window variable for use by an external class
	//@return the window which the zombie is running to
	var getWindow = function(){
		return this.qwindow;
	};
	//gets the timer of the zombie
	//@return the timer variable
	var getTimer = function(){
		return this.timer;
	};
	//gets the id of the zombie
	//@return the id variable
	var getid = function(){
		return this.id;
	};
	//gets the current health value of the zombie object
	//@return the health of the zombie
	var getHealth = function(){
		return this.health;
	};
	//sets the health of the zombie
	//@param f - the new value for the health variable
	var setHealth = function(f){
		this.health = f;
	};

	//gets the current time variable which counts towards
	//@return the current time variable
	var getCurrentTime =  function(){
		return this.currentTime;
	};
	//sets the current time value
	//@param g - the new value of the current time variable
	var setCurrentTime = function(g){
		this.currentTime = g;
	};
	//gets the inside variable
	//@return the inside variable
	var getInside = function(){
		return this.inside;
	};
	//sets the inside value
	//@param g - the new value for the inside variable
	var setInside =  function(g){
		this.inside = g;
	};

	
	//@returns all of the variables and functions for external use by other classes.
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getid: getid,
		getWindow:getWindow,
		getTimer:getTimer,
		getDead:getDead,
		setDead:setDead,
		getHealth:getHealth,
		setHealth:setHealth,
		getCurrentTime:getCurrentTime,
		setCurrentTime:setCurrentTime,
		getInside:getInside,
		setInside:setInside,
		x:x,
		y:y,
		id:id,
		_window:qwindow,
		timer:timer,
		dead:dead,
		health:health,
		inside:inside,
		currentTime:currentTime
	} 
};

// Export the Zombie class so you can use it in
// other files by using require("Zombie").Zombie
exports.Zombie = Zombie;