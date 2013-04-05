/**************************************************
** GAME ZOMBIE CLASS
**************************************************/
var Zombie = function(_id,startX, startY, _window, _timer) {

	//Should also include drops here.
	//Other things to include: health.

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

	// Getters and setters
	var getX = function() {
		return this.x;
	};

	var getY = function() {
		return this.y;
	};

	var setX = function(newX) {
		this.x = newX;
	};

	var setY = function(newY) {
		this.y = newY;
	};

	var getDead = function(){
		return this.dead;
	};

	var setDead = function(s){
		this.dead = s;
	};

	var getWindow = function(){
		return this.qwindow;
	};

	var getTimer = function(){
		return this.timer;
	};

	var getid = function(){
		return this.id;
	};

	var getHealth = function(){
		return this.ealth;
	};

	var setHealth = function(f){
		this.health = f;
	};

	var getCurrentTime =  function(){
		return this.currentTime;
	};

	var setCurrentTime = function(g){
		this.currentTime = g;
	};

	var getInside = function(){
		return this.inside;
	};

	var setInside =  function(g){
		this.inside = g;
	};

	
	// Define which variables and methods can be accessed
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