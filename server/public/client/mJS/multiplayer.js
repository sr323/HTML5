/*
This JavaScript file handles the majority of the multiplayer. This is because the multiplayer game is built entirely from the 
single player game, so when the single player game code reaches a point where multiplayer needs to be involved, the code calls
a multiplayer method from this file. For example when the player fires a bullet, the single player code calls this files 
mFireBullet method, which sends the bullet information for the server in a string message, where the server will act appropriately.

This class will initialise the connection to the server and will the socket.emit method to send a message to a server.

The code will also listen to messages from the server using the socket.on method.
*/

var localPlayer,	//local player.
	remotePlayers,	//Remote players
	socket;			//Socket connection

var x, y, dir, id, moved = false, host = false;
//initialises the variables on start.
window.mInit = function(){
	//creates a local player equal to the player object
	localPlayer = window.player;
	//stores information about the player to pass onto the server
	x = localPlayer.getX();
	y = localPlayer.getY();
	dir = localPlayer.getDir();
	
	//The server which this client will try to connect with.
	socket = io.connect("http://37.235.54.208", {port: 8000, transports: ["websocket"]});
	
	//Remote client array here. Holds information about all other players.
	remotePlayers = [];
	
	//Sets events to be handled
	setEventHandlers();
	//calls the method to keep the server updated with local player information
	updateUserLocation();
};

//Event handlers listen to the socket broadcasts, and react to the information.
//uses socket.on method with 2 parameters, the first parameter is the messages passed by the server, and the second parameter
//is the callback function, which will be triggered.
var setEventHandlers = function(){
	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
	
	//When a new player joins, they recieve information based on the current game.
	socket.on("new player information", newPlayerInformation);

	//a remote player has died
	socket.on("death", onPlayerDeath);

	//A remote player has stopped moving
	socket.on("not moved", onNonMove);

	//server updates recieved
	socket.on("updates",updatings);

	//server has informed the client about new bullets
	socket.on("new bullet", newBullet);

	//Remove a bullet from the game. This is called by the server for the TTL(time to live) running out,
	// or it has collided with an enemy.
	socket.on("remove bullet", removeBullet);

	//Informs the client it is now hosting the game
	socket.on("hosting", hostingFunction);

	//A new zombie is being passed by the server.
	socket.on("new zombie", newZombie);

	//Server has emitted that it's time to level up.
	socket.on("levelling", levelUp);

	//A zombie has died
	socket.on("zombie dead", zombieDead);

	//A plank has been broken, on another client.
	socket.on("break plank", breakPlank);

	//A plank has been fixed by another player.
	socket.on("fix plank", fixPlank);

	//Everyone has died, resets the game.
	socket.on("end game", endGame);
};

//updatings is called every time the server sends this client an update
//@param data - the data passed from the server, includes bullet information, score and the level of the game
var updatings = function(data){
	//from the data the bullets array in string form is recieved.
	//we use JSON.parse to parse the array back into array form to use
	var bulletParse = JSON.parse(data.bullets);

	//Updates the bullets location, which is the exact same as the servers bullet location.
	for(var i = 0; i < bulletParse.length; i++){
		//finds the bullet in array
		var bulletInQuestion = bulletById(bulletParse[i].id);
		//if the bullet isnt found
		if(!bulletInQuestion){
			console.log("couldn't find bullet " + bulletInQuestion.id);
			return;
		}
		//updates bullet information
		bulletInQuestion.setX(bulletParse[i].x);
		bulletInQuestion.setY(bulletParse[i].y);
	};
	//updates game data
	score = data.score;
	level = data.level;
};

//when the server informs the client to level up, this method is called.
function levelUp(){
	console.log("been told to level up!");
	//removes all current zombies from the current game
	for(var i  = 0; i < enemies.length; i++){
		enemies[i].setHealth(0);
	};
	levelStarted =  false;
	//play the update audio sound 
	if(level!= 0){window.levelupsound.play();};
	console.log(level);
	//reset the enemies array
	setTimeout(1500, (function(){enemies.length = 0})());
};

//the server has informed this client a new zombie has been created.
//@param data - the data about the new zombie object
function newZombie(data){
	//push the new zombie onto the enemies array
	enemies.push(new zombie(data.id, data.x, data.y, data._window, data.timer));
	//update the hud
	enemiesAlive = enemies.length;
};

//the server has informed this client that it is now hosting.
//@param data - the data from the server
function hostingFunction(data){
	//host boolean is set to true
	host = true;
	console.log("I am now hosting the game");
	//and starts emitting host updates to the server
	hostEmit();
};

//The update user location function, checks if the location of the local player has moved,
//and if it has, it broadcasts the new location to the server to update it's information.
var updateUserLocation = function(){
	//if the player is dead, tell the server
	if(localPlayer.getDead()){
		socket.emit("death", {});
		console.log("emitting death");
	}
	else{//if not dead, update the server with appropriate changes
		var newX = localPlayer.getX(), newY = localPlayer.getY(), newDir = localPlayer.getDir();
		if(newX != x || newY != y || newDir != dir){//if moved
			//Something has changed, new information should be sent to user.
			x = newX, y = newY, dir = newDir;
			//Emit, sends information to the server.
			socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), dir:localPlayer.getDir()});
			moved = true;
		}
		else{//if hasnt moved
			if(moved){
				moved = false;
				socket.emit("not moved", {});//tell the server it the player has stopped moving
			}
		}
		
		//Recursive call to constantely update the user location.
		//The divide amount shows how many times this function is called each second(1000 millieseconds)
		//higher the number, the more responsive it is.
		setTimeout(updateUserLocation, 1000/30);
	}
};

//On socket connection
function onSocketConnected() {
	console.log("Connected to socket server");
	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), dir: localPlayer.getDir()});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// new player has connected
//@param data - the data about the new player
function onNewPlayer(data) {
	// Initialise the new player
	var newPlayer = new remotePlayer(data.x, data.y, data.dir);
	newPlayer.id = data.id;//sets the player id

	newPlayer.setDead(data.dead);
	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
//@param data - the data sent from the server about the player to move
function onMovePlayer(data) {
	//find the player in the array
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setDir(data.dir);
	movePlayer.setMoved(true);
};

// Remove player
//@param data - the data sent from the server about the player to move
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	//if the player removed is the host, request to be the new host
	if(data.host){
		socket.emit("request host");
	}
	else{
		console.log("removed player was not a host"); //FOR DEBUGGING ONLY	
	}

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

//a player has died
//@param data - the data sent from the server about the player to move
function onPlayerDeath(data){
	//find the player by id in the players array
	var deadPlayer = playerById(data.id);
	//Player not found
	if(!deadPlayer){
		console.log("A player was claimed dead, but wasn't found");
		return;
	};
	//set the players dead variable to true
	console.log("On player death - " + data.id);
	deadPlayer.setDead(true);
};

//A player hasn't moved
//@param data - the data sent from the server about the player to move
function onNonMove(data){
	//find the player in the players array
	var noneMovePlayer = playerById(data.id);
	//player not found
	if(!noneMovePlayer){
		console.log("A player was claimed non moving, but wasn't found");
		return;
	};
	//set specfic information
	noneMovePlayer.setMoved(false);
};

//All information for a new player which is this player that has just connected.
//@param data - the data sent from the server about the player to move
function newPlayerInformation(data){
	//sets the information given by the data from the server
	window.level = data.level;
	window.score = data.score;

	//Current information about zombies and bullets is also passed across.
	//information includes current bullets and zombies in play.

	//New player informed about all current zombies in play.
	var zombParse = JSON.parse(data.zombies);
	//for all zombies in the game, create a new zombie on the clients game.
	for(var i = 0; i < zombParse.length; i++){
		console.log("On connect a zombie is already in play - " + zombParse[i].id);
		var temp = zombParse[i];
		//create a new local zombie
		var zombTemp = new zombie(temp.id, temp.x, temp.y, temp._window, temp.timer);
		//sets new zombie information
		zombTemp.setInside(temp.inside);
		zombTemp.setDrop(0);
		zombTemp.setHealth(temp.health);
		zombTemp.setCurrentTime(temp.currentTime);

		if(temp.health > 0){
			enemiesAlive++;
		}
		//push the new zombie onto the enemies array
		enemies.push(zombTemp);
	};

	//New player must be informed about all the current bullets in play.
	var bulletParse = JSON.parse(data.bullets);
	//all bullets currently in play
	for(var i = 0; i < bulletParse.length; i++){
		//create a new bullet with the information given
		var temp = bulletParse[i];
		//add a new local bullet with the bullets information
		window.bullets.push(new Bullet(temp.id, temp.x, temp.y, temp.bulletSize, temp.pierce));
	};
	
	//The current environment information has to be passed to new players
	var houseParse = JSON.parse(data.house);
	//for all planks in the world
	for(var i = 0; i < houseParse.length; i++){
		//for each plank, from 0 to 5, set it's information.
		//the information is broken or fixed.
		var temp = houseParse[i];
		//first window
		if(temp.windowNo == 1){
			//first plank on the window
			if(!temp.plank1){
				housePlanks.getPlanks()[0].setHealth(0);
			}
			//second plank on the window
			if(!temp.plank2){
				housePlanks.getPlanks()[1].setHealth(0);
			}
		}
		//second window
		else if(temp.windowNo == 2){
			if(!temp.plank1){
				housePlanks.getPlanks()[2].setHealth(0);
			}
			if(!temp.plank2){
				housePlanks.getPlanks()[3].setHealth(0);
			}
		}
		//third window
		else if(temp.windowNo == 3){
			if(!temp.plank1){
				housePlanks.getPlanks()[4].setHealth(0);
			}
			if(!temp.plank2){
				housePlanks.getPlanks()[5].setHealth(0);
			}
		}
		else{
			console.log("Error, more than 4 windows passed");
		}
	};
};

//when a new bullet is created it is passed to the server, then passed to all players 
//then is created on all players local game 
//@param data - the data sent from the server about the player to move
function newBullet(data){
	//creates a new bullet
	window.bullets.push(new Bullet(data.id, data.x, data.y, data.bulletSize, data.pierce));
	//play the fire bullet sound
	bulletshotsound.play();
};

//When a bullet is removed from the servers game
//@param data - the data sent from the server about the player to move
function removeBullet(data){
	//finds the bullet in the array
	var removedBullet = bulletById(data.id);
	if(!removedBullet){//if the bullet isnt found
		console.log("bullet was requested to be removed, but couldn't be found");
		return;
	};
	//remove the bullet from the game
	bullets.splice(bullets.indexOf(removedBullet),1);
};

/**************************************************
** Game finder functions and multiplayer game methods
**************************************************/
// Find player by ID
//@param id - the id of the player to find
//@return the player with the id specified, if not found returns false
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	//if player not found, return false
	return false;
};

//find bullet by id
//@param id - the id of the bullet to find
//@return the bullet with the id specified, if not found returns false
function bulletById(id){
	var i = 0;
	var notFound = true;
	while(notFound && i < window.bullets.length){
		if(bullets[i].id == id){
			return bullets[i];
		};

		i++;
	};
	//if bullet not found, return false
	return false;
};

//find zombie by id
//@param id - the id of the zombie to find
//@return the zombie with the id specified, if not found returns false
function zombieById(id){
	var i = 0;
	var notFound = true;
	while(notFound && i < window.enemies.length){
		if(enemies[i].getid() == id){
			return enemies[i];
		};

		i++;
	};
	//returns false if the zombie isn't found 
	return false;
};

/*
* Functions to inform server about user interaction.
*/
//the multiplayer fire bullet function
//when a player fires a bullet, it informs the server about the new bullet
/*
@param _x - the x starting location of the bullet
@param _y - the y starting location of the bullet
@param _mouseX - the x direction the bullet will head towards
@param _mouseY - the y direction the bullet will head towards
@param _pierce - the pierce value of the players bullets
@param _damage - the damage of the bullet
@param _bulletsize - the size of the bullet
*/
window.mFireBullet = function(_x, _y, _mouseX, _mouseY, _pierce, _damage, _bulletSize){
	//emits the message to the server to create a new bullet
	socket.emit("new bullet", {x: _x, y: _y, xDir: _mouseX, yDir: _mouseY, pierce: _pierce, damage:_damage, bulletSize: _bulletSize});
};

//When a collision has been detected, the bullet is removed, and tells the server to remove the bullet
//@param id - the id of the bullet to remove
window.bulletGameRemoval = function(id){
	//find the bullet in the bullets array
	var b = bulletById(id);
	//if the bullet is not found return nothing
	if(!b){
		console.log("Bullet not found");
		return;
	};
	//if the bullet is found, remove it
	bullets.splice(bullets.indexOf(b),1);
	//and tell the server to remove it
	socket.emit("remove bullet", {id:id});

};

//server has informed the client to kill a zombie
//@param data - the id of the zombie to kill
function zombieDead(data){
	//find the zombie in the enemies array
	var z = zombieById(data.id);
	console.log("A zombie has been claimed dead " + data.id);
	//if the zombie is not found, return nothing
	if(!z){
		console.log("Zombie doesn't exist, but was claimed dead.." + data.id);
		return;
	};
	//set the zombies health to 0
	z.setHealth(0);
};

//When a zombie dies, this emits it to the server.
//@param id - the id of the zombie which has ied
function emitZombieDeath(id){
	//emits the zombie message and id to the server
	socket.emit("zombie death", {id:id});
};

//When a plank is broken, this emits the information to the server.
//@param plank - the plank to break
function emitPlankBreak(plank){
	//emits the plank to the server and to break it
	socket.emit("break window", {plank: plank});
};

//when a plank is repaired, this emits the information to the server.
//@param plank - the plank to fix
function emitPlankRepair(plank){
	//emits the plank to the server and to fix it
	socket.emit("fix plank", {plank:plank})
};

//Server has sent a message to break a plank
//@param data - the data from the server, for which plank to break
function breakPlank(data){
	//the number of the plank
	var dataNo = data.plank;
	//set the planks health to 0
	housePlanks.getPlanks()[dataNo].setHealth(0);
};

//Recieved a message to fix a plank from the server.
//Fixes the plank specified.
//@param data - the data from the server - includes the plank number to fix.
function fixPlank(data){
	//the plank number to fix
	var dataNo = data.plank;
	//gets the environment and fixes the appropriate plank
	housePlanks.getPlanks()[dataNo].setHealth(5);
};

//Host emit is a recursive method which keeps sending updates to the server.
function hostEmit(){
	//setTimeout keeps recursively calling hostEmit 2 times a second.
	setTimeout(hostEmit, 1000 / 2);
	//if their are no enemies, no need to broadcast updates.
	if(enemies.length != 0){
		//an array to store all the updated zombies
		var emitArray = new Array();
		//loops through the enemies array and extracts all relevant information
		for(var i = 0; i < enemies.length; i++){
			var zomb = enemies[i];
			//remote zombie objects are used as they only store required information
			emitArray.push(new remoteZombie(zomb.getid(), zomb.getX(), zomb.getY(),
			 zomb.getInside(), zomb.getHealth(), zomb.getCurrentTime()));
		}
		//turn the emitArray into a string and send it to the server
		socket.emit("host update", {zombies: JSON.stringify(emitArray)});
	}
};

//the end game function is triggered by the server message of "end game" where the function
//then plays the end game sound, and resets the appropriate variables, makes all players come back to life,
function endGame(){
	//plays the end game audio
	window.window.deathsound.play();
	//sets timeout of 2.5 seconds so the game doesnt reset straight away
	setTimeout((function(){
		window.reset();//resets game variables
		console.log("Resetting the game");
		localPlayer.resetHealth();	//resets players health
		//makes all players alive
		for(var i = 0; i < remotePlayers.length; i++){
			remotePlayers[i].setDead(false);
		};	
		//calls to update user information until death of the player
		updateUserLocation();

	}),2500);
};


/********************************************
**	Remote classes
*********************************************/

// Remote zombie class - just stores all the appropriate information needed for the client to update the server
/*
@param _id - the id of the zombie
@param _x - the current x location of the zombie
@param _y - the y location of the zombie
@param _inside - boolean if the zombie is in the house or not
@param _health -  the health of the zombie
@param _currentTime - the current time before the zombie reacts to the world of the zombie
*/
var remoteZombie = function(_id, _x, _y, _inside, _health, _currentTime){
	//initialises variables
	var id = _id, x = _x, y = _y, inside = _inside, health = _health, currentTime = _currentTime;
	//returns the variables for use by external class
	return{
		id:id, x:x, y:y, inside:inside, health:health, currentTime:currentTime
	};
};

//remote player class
//just stores the required information needed for the client to update and draw the other players to simulate all playing on one game
//@param _x - the x location of the player
//@param _y - the y location of the player
//@param _dir - the direction of the player
var remotePlayer = function(_x,_y,_dir){
	//initialise variables
	var x = _x, y = _y, dir = _dir, id, dead = false, moved = false, currentSprite = 0, deathAnimFinished =  false,
	//gets the x variable
	//@return the x value
	getX = function(){
		return x;
	},
	//gets the y variable
	//@return the y value
	getY = function(){
		return y;
	},
	//gets the current direction
	//@return dir the direction of the player value
	getDir = function(){
		return dir;
	},
	//sets the x value with a new value
	//@param p the new x value
	setX = function(p){
		x = p;
	},
	//sets the y value with a new value
	//@param i - the new y value
	setY = function(o){
		y = o;
	},
	//sets the direction of the remote player
	//@param m the new dir value
	setDir = function(m){
		dir = m;
	},
	//set the moved value used to draw the appropriate sprite
	//@param n - the moved variables new value
	setMoved = function(n){
		moved = n;
	},
	//gets the moved variable
	//@return the moved value
	getMoved = function(o){
		return moved;
	},
	//gets the current sprite information
	//@return the current Sprite value
	getCurrentSprite = function(){
		return currentSprite;
	},
	//iterate the remote players sprite information to keep the sprites updating and moving
	//and calls the appropriate method to change the sprite information
	spriteIterate = function(){
		//if the remote player isnt dead and moving
		if(!dead && moved){
			walk();
		}//if the player is not dead
		else if(!dead){
			stand();
		}
		else{//else the player is dead
			die();
		}
	},
	//sets the dead variable
	//@param deathBool - the new value for the dead variable
	setDead = function(deathBool){
		//changes dead
		dead = deathBool;
		if(dead){//if dead the deathAnimation has to be reset 
			deathAnimFinished = false;
		};
	},
	//gets the dead boolean which is true or false
	//@return dead value
	getDead = function(){
		return dead;
	},
	//the stand sprite iteration, keeps incrementing the sprite throughout the standing posture.
	stand = function(){
		//first 4 columns - standing still.
		if(currentSprite < 3){
			currentSprite++;
		}
		else{
			currentSprite = 0;
		}
	},
	//the walk sprite iteration, keeps incrementing the sprite throughout the walking posture.
	walk = function(){
		//columns 5-12 - walking.
		if(currentSprite < 11 && currentSprite > 4){
			currentSprite++;
		}
		else{
			currentSprite = 5;
		}
	},
	//the die sprite iteration, keeps incrementing the sprite throughout the dying posture, unless the zombie has died once, then it stops looping.
	die = function(){
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
	//bounding box variables
	var boxWidth = 30;
	var boxHeight = 60;
	//gets the x value of the box
	//@return the x value of the box
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	//gets the y value of the box
	//@return the y value of the box
	var boxY = function(){
		return getY() - (boxHeight/2);
	};

	//returns all the appropriate functions and variables which are used by external classes.
	return{
		spriteIterate:spriteIterate,
		getCurrentSprite:getCurrentSprite,
		x:x,
		y:y,
		dir:dir,
		id:id,
		getX:getX,
		getY:getY,
		getDir:getDir,
		setX:setX,
		setY:setY,
		setDir:setDir,
		setDead:setDead,
		setMoved:setMoved,
		getMoved:getMoved,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		boxX:boxX,
		boxY:boxY,
		getDead:getDead
	};
};

