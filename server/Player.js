/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startDir) {
	var x = startX,
		y = startY,
		dir = startDir,
		id,
		dead = false,
		host = false;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};
	
	var getDir = function(){
		return dir;
	};

	var gethost = function(){
		return host;
	};

	var sethost = function(d){
		host = d;
	};

	var getDead = function(){
		return dead;
	};

	var setDead = function(b){
		dead = b;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};
	
	var setDir = function(newDir){
		dir = newDir;
	}
	
	// Define which variables and methods can be accessed
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