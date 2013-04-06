var localPlayer,	//local player.
	remotePlayers,	//Remote players
	socket;			//Socket connection

var x, y, dir, id, moved = false, host = false;

window.mInit = function(){

	localPlayer = window.player;

	x = localPlayer.getX();
	y = localPlayer.getY();
	dir = localPlayer.getDir();
	
	//The server which this client will try to connect with.
	socket = io.connect("http://37.235.54.208", {port: 8000, transports: ["websocket"]});
	
	//Remote client array here. Holds information about all other players.
	remotePlayers = [];
	
	//Should also set up event listeners here.
	setEventHandlers();
	
	updateUserLocation();
};

//Event handlers listen to the socket broadcasts, and react to the information.
var setEventHandlers = function(){
	//This code is from RAWKES multiplayer example.	
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
	
	//Self made socket functions
	//When a new player joins, they recieve information based on the current game.
	socket.on("new player information", newPlayerInformation);

	//player has died
	socket.on("death", onPlayerDeath);

	//A player has stopped moving
	socket.on("not moved", onNonMove);

	//Updates
	socket.on("updates",updatings);

	//New bullets will be broadcast
	socket.on("new bullet", newBullet);

	//Remove a bullet from the game. This is called by the server for the TTL(time to live) running out, or it has collided with an enemy.
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

//REFERENCE
//http://stackoverflow.com/questions/13028604/sending-a-javascript-object-through-websockets-with
var updatings = function(data){

	var bulletParse = JSON.parse(data.bullets);

	//Updates the bullets location, which is the exact same as the servers bullet location.
	for(var i = 0; i < bulletParse.length; i++){
		//console.log(bulletParse[i]);
		var bulletInQuestion = bulletById(bulletParse[i].id);
		//console.log(bulletParse[i].id);

		if(!bulletInQuestion){
			console.log("couldn't find bullet " + bulletInQuestion.id);
			return;
		}

		bulletInQuestion.setX(bulletParse[i].x);
		bulletInQuestion.setY(bulletParse[i].y);
	};

	score = data.score;
	level = data.level;

	//this should also be done for zombies.
};

function levelUp(){
	console.log("been told to level up!");

	for(var i  = 0; i < enemies.length; i++){
		enemies[i].setHealth(0);
	};
	levelStarted =  false;

	if(level!= 0){window.levelupsound.play();};
	console.log(level);

	setTimeout(1500, (function(){enemies.length = 0})());
};

function newZombie(data){
	//console.log("new zombie being added -- ");
	//console.log(data);
	enemies.push(new zombie(data.id, data.x, data.y, data._window, data.timer));
	enemiesAlive = enemies.length;
};

function hostingFunction(data){
	host = true;
	console.log("I am now hosting the game");
	hostEmit();
};

//The update user location function, checks if the location of the local player has moved,
//and if it has, it broadcasts the new location to the server to update it's information.
var updateUserLocation = function(){
	//Should be set to false when comes back alive, then starts this loop again.
	if(localPlayer.getDead()){
		socket.emit("death", {});
		console.log("emitting death");
	}
	else{
		var newX = localPlayer.getX(), newY = localPlayer.getY(), newDir = localPlayer.getDir();
		if(newX != x || newY != y || newDir != dir){
			//Something has changed, new information should be sent to user.
			x = newX, y = newY, dir = newDir;
			//Emit, sends information to the server.
			socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), dir:localPlayer.getDir()});
			moved = true;
		}
		else{
			if(moved){
			//	console.log("Stopped moving");
				moved = false;
				socket.emit("not moved", {});
			}
		}
		
		//Recursive call to constantely update the user location.
		//The divide amount shows how many times this function is called each second(1000 millieseconds)
		//higher the number, the more responsive it is.
		setTimeout(updateUserLocation, 1000/30);
	}
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), dir: localPlayer.getDir()});
	//The server should then respond with information, about the level, the zombies and bullets in play, etc.
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	// Initialise the new player
	var newPlayer = new remotePlayer(data.x, data.y, data.dir);
	newPlayer.id = data.id;

	newPlayer.setDead(data.dead);
	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {

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
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	if(data.host){
		socket.emit("request host");
	}
	else{
		console.log("removed player was not a host"); //FOR DEBUGGING ONLY	
	}

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

/*************
**Own written socket functions, specific to the game
**************/
//a player has died
function onPlayerDeath(data){

	var deadPlayer = playerById(data.id);
	//Player not found
	if(!deadPlayer){
		console.log("A player was claimed dead, but wasn't found");
		return;
	};
//	console.log("player died");
	console.log("On player death - " + data.id);
	deadPlayer.setDead(true);
};

//A player hasn't moved
function onNonMove(data){
	
	var noneMovePlayer = playerById(data.id);
	//player not found
	if(!noneMovePlayer){
		console.log("A player was claimed non moving, but wasn't found");
		return;
	};

	noneMovePlayer.setMoved(false);
};

//All information for a new player which is this player that has just connected.
function newPlayerInformation(data){
//	console.log(data);

	window.level = data.level;
	window.score = data.score;


	//Current information about zombies and bullets is also passed across.
	//information includes current bullets and zombies in play.

	//New player informed about all current zombies in play.
	var zombParse = JSON.parse(data.zombies);

	for(var i = 0; i < zombParse.length; i++){
		console.log("On connect a zombie is already in play - " + zombParse[i].id);
		var temp = zombParse[i];

		var zombTemp = new zombie(temp.id, temp.x, temp.y, temp._window, temp.timer);

		zombTemp.setInside(temp.inside);
		zombTemp.setDrop(0);
		zombTemp.setHealth(temp.health);
		zombTemp.setCurrentTime(temp.currentTime);

		if(temp.health > 0){
			enemiesAlive++;
		}

		enemies.push(zombTemp);
	};

	//New player must be informed about all the current bullets in play.
	var bulletParse = JSON.parse(data.bullets);

	for(var i = 0; i < bulletParse.length; i++){
	//	console.log("new bullet being created - ");
		var temp = bulletParse[i];
	//	console.log(temp);
		window.bullets.push(new Bullet(temp.id, temp.x, temp.y, temp.bulletSize, temp.pierce));
	};
	
	//The current environment information has to be passed to new players
	var houseParse = JSON.parse(data.house);

	for(var i = 0; i < houseParse.length; i++){
		var temp = houseParse[i];
		if(temp.windowNo == 1){
			if(!temp.plank1){
				housePlanks.getPlanks()[0].setHealth(0);
			}
			if(!temp.plank2){
				housePlanks.getPlanks()[1].setHealth(0);
			}
		}
		else if(temp.windowNo == 2){
			if(!temp.plank1){
				housePlanks.getPlanks()[2].setHealth(0);
			}
			if(!temp.plank2){
				housePlanks.getPlanks()[3].setHealth(0);
			}
		}
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

function newBullet(data){
//	console.log("new bullet");
//	console.log(data);
	window.bullets.push(new Bullet(data.id, data.x, data.y, data.bulletSize, data.pierce));
	bulletshotsound.play();
};

function removeBullet(data){
	var removedBullet = bulletById(data.id);
	//console.log("A bullet has been asked to be removed");
	if(!removedBullet){
		console.log("bullet was requested to be removed, but couldn't be found");
		return;
	};
	//console.log("bullet has been removed");
	//console.log("bullet removed info" + " x: " + removedBullet.getX() + " - y: " +  removedBullet.getY() + " - id: " + removedBullet.id);
	bullets.splice(bullets.indexOf(removedBullet),1);
};

/**************************************************
** GAME HELPER FUNCTIONS REFERENCEEEEE RAWKES AGAIIIN
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

function bulletById(id){
	var i = 0;
	var notFound = true;
	while(notFound && i < window.bullets.length){

		if(bullets[i].id == id){
			return bullets[i];
		};

		i++;
	};

	return false;
};

function zombieById(id){
	var i = 0;
	var notFound = true;
	while(notFound && i < window.enemies.length){
		console.log("trying to find zombie" + id);
		console.log("zombie current id " + enemies[i].getid());
		if(enemies[i].getid() == id){
			return enemies[i];
		};

		i++;
	};

	return false;
};
/*
* Functions to inform server about user interaction.
*/
window.mFireBullet = function(_x, _y, _mouseX, _mouseY, _pierce, _damage, _bulletSize){
	//console.log(_mouseX + " x - y " + _mouseY);
	socket.emit("new bullet", {x: _x, y: _y, xDir: _mouseX, yDir: _mouseY, pierce: _pierce, damage:_damage, bulletSize: _bulletSize});
};

window.bulletGameRemoval = function(id){
	var b = bulletById(id);

	//console.log("A bullet has been removed from the game by collision.");

	if(!b){
		console.log("Bullet not found");
		return;
	};

	bullets.splice(bullets.indexOf(b),1);

	socket.emit("remove bullet", {id:id});

};

function zombieDead(data){

	var z = zombieById(data.id);

	console.log("A zombie has been claimed dead " + data.id);

	if(!z){
		console.log("Zombie doesn't exist, but was claimed dead.." + data.id);
		return;
	};

	z.setHealth(0);
};

//When a zombie dies, this emits it to the rest of the server.
function emitZombieDeath(id){
//	console.log("emitting zombie death to the server");
	socket.emit("zombie death", {id:id});
};

//When a plank is broken, this emits the information to the server.
function emitPlankBreak(plank){
	socket.emit("break window", {plank: plank});
};

function emitPlankRepair(plank){
	socket.emit("fix plank", {plank:plank})
};

function breakPlank(data){
	//A house plank has been removed on another clients machine. 
//	console.log("A plank has been told to be broken. ");
	var dataNo = data.plank;
	//houseplanks.planks is undefined,
	housePlanks.getPlanks()[dataNo].setHealth(0);
};

function fixPlank(data){
	console.log("A plank has been told to be fixed");
	var dataNo = data.plank;
	housePlanks.getPlanks()[dataNo].setHealth(5);
};

function hostEmit(){
	setTimeout(hostEmit, 1000 / 2);
	if(enemies.length != 0){
	
		var emitArray = new Array();

		for(var i = 0; i < enemies.length; i++){
			var zomb = enemies[i];
			emitArray.push(new remoteZombie(zomb.getid(), zomb.getX(), zomb.getY(),
			 zomb.getInside(), zomb.getHealth(), zomb.getCurrentTime()));
		}
		socket.emit("host update", {zombies: JSON.stringify(emitArray)});
	}
	//console.log("Should be emitting to the host about zombie positions");
};

function endGame(){

	window.window.deathsound.play();

	setTimeout((function(){
		window.reset();
		console.log("Resetting the game");
		localPlayer.resetHealth();

		for(var i = 0; i < remotePlayers.length; i++){
			remotePlayers[i].setDead(false);
		};

		updateUserLocation();

	}),2500);
};


/********************************************
**	Remote classes
*********************************************/

// Remote zombie class
var remoteZombie = function(_id, _x, _y, _inside, _health, _currentTime){
	var id = _id, x = _x, y = _y, inside = _inside, health = _health, currentTime = _currentTime;

	return{
		id:id, x:x, y:y, inside:inside, health:health, currentTime:currentTime
	};
};

//remote player class
var remotePlayer = function(_x,_y,_dir){

	var x = _x, y = _y, dir = _dir, id, dead = false, moved = false, currentSprite = 0, deathAnimFinished =  false,
	
	getX = function(){
		return x;
	},
	
	getY = function(){
		return y;
	},
	
	getDir = function(){
		return dir;
	},
	
	setX = function(p){
		x = p;
	},
	
	setY = function(o){
		y = o;
	},
	
	setDir = function(m){
		dir = m;
	},

	setMoved = function(n){
		moved = n;
	},

	getMoved = function(o){
		return moved;
	},

	getCurrentSprite = function(){
		return currentSprite;
	},

	spriteIterate = function(){
		if(!dead && moved){
			walk();
		}
		else if(!dead){
			stand();
		}
		else{
			die();
		}
	},

	setDead = function(deathBool){
		//console.log(dead);
		//console.log(deathBool);
		dead = deathBool;
		if(dead){
			deathAnimFinished = false;
		};
		//console.log(dead);
	},

	getDead = function(){
		return dead;
	},

	stand = function(){
		//first 4 columns - standing still.
		if(currentSprite < 3){
			currentSprite++;
		}
		else{
			currentSprite = 0;
		}
	},

	walk = function(){
		//columns 5-12 - walking.
		if(currentSprite < 11 && currentSprite > 4){
			currentSprite++;
		}
		else{
			currentSprite = 5;
		}
	},

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

	var boxWidth = 30;
	var boxHeight = 60;
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	var boxY = function(){
		return getY() - (boxHeight/2);
	};

	
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

