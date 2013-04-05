/*************************************************
** Serving web-pages
*************************************************/
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

app.configure(function(){
  app.use(express.static(path.join(__dirname, 'public')))
});

app.listen(3000);
console.log('Listening on port 3000');

/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io").listen(8000),	// Socket.IO
	Player = require("./Player").Player,	// Player class
	Zombie = require("./Zombie").Zombie,
	Bullet = require("./bullet").Bullet,
	house = require("./house").house;

/**************************************************
** GAME VARIABLES
**************************************************/
var players,	// Array of connected players
	zombies,	//Array of zombies
	bullets;	//Array of bullets

var level = 0,
	score = 0,
	levelling = false,
	running = false,
	bulletid = 0,
	zombieid = 0,
	haveHost = false,
	environment = new house();

	//Score array holding top scores.
	var scoreTable = new Array();

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];

	zombies = [];

	bullets = [];

	// Set up Socket.IO to listen on port 8000
	//socket = io.listen(8000);

	// Configure Socket.IO
	io.configure(function() {
		// Only use WebSockets
		io.set("transports", ["websocket"]);

		// Restrict log output
		io.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();

	//Should have a loop constantely checking if next level is initiated
};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	io.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	util.log("New player has connected: " + client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);

	//listen for deaths
	client.on("death", onPlayerDeath);

	//listen for not moved message, to stop sprite animation
	client.on("not moved", notMoved);

	//Listen for a new bullet from the client.
	client.on("new bullet",newBullet);

	//Requesting a new host.
	client.on("request host", requestedHost);

	//Host has told us to remove a bullet.
	client.on("remove bullet", removeBullet);

	//the host intermittently updates the server using this method call
	client.on("host update", hostUpdate);

	//A client has killed a zombie, and the server is updated with this information.
	client.on("zombie death", zombieDeath);

	//A clients window has smashed, and the server is updated with this information.
	client.on("break window", breakWindow);

	//A window has been fixed, broadcast this to everyone else.
	client.on("fix plank", fixPlank);
};

function hostUpdate(data){

	var zombieParse = JSON.parse(data.zombies);

	for(var i = 0; i < zombieParse.length; i++){
		var zomb = zombieById(zombieParse[i].id);

		if(!zomb){
			console.log("A zombie was not found " + zomb.getid());
			return;
		}

		zomb.setX(zombieParse[i].x);
		zomb.setY(zombieParse[i].y);
		zomb.setInside(zombieParse[i].inside);
		zomb.setHealth(zombieParse[i].health);
		//if(zombieParse[i].health < 1){//Zombie has died
		//	zomb.setDead(true);
		//};
		zomb.setCurrentTime(zombieParse[i].currentTime);
	}
};

function requestedHost(){
	console.log("a new host has been requested - " + this.id);
	var playerHost = playerById(this.id);

	if(!playerHost){
		console.log("A player hasn't been found when requested host");
		return;
	};

	console.log("Have a host currently? " + haveHost);
	if(!haveHost){
		haveHost = true;
		playerHost.host = true;
		this.emit("hosting");
		console.log("new host found");
	};
};

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id + " when checking a disconnect");
		return;
	};

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id, host:removePlayer.host});

	if(removePlayer.host){
		console.log("A player has been removed thatwas the host");
		haveHost = false;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	if(players.length == 0){
		stopGame();
	};
};

// New player has joined
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y, data.dir);
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), dir: newPlayer.getDir(), dead: newPlayer.getDead()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), dir: existingPlayer.getDir(), dead: existingPlayer.getDead()});
	};

	var remotePlanks = function(windowNo, _plank1,_plank2){
		var plank1 = _plank1, plank2 = _plank2, _window = windowNo;
		return{
			plank1:plank1,
			plank2:plank2,
			windowNo:_window
		}
	}

	var houses = new Array();
		for(var i = 0; i < 3; i++){
			if(i == 0){
				houses.push(new remotePlanks(1,environment.window1.plank1,environment.window1.plank2));
			}
			else if(i == 1){
				houses.push(new remotePlanks(2,environment.window2.plank1,environment.window2.plank2));
			}
			else if(i == 2){
				houses.push(new remotePlanks(3,environment.window3.plank1,environment.window3.plank2));
			}
			else{
				console.log("game line 205 is wrong.");
			}
		}

	//After it sends all the other players, it should then submit all the other zombies in play, and all the bullets and drops in play.
	this.emit("new player information", {level: level, score: score, zombies: JSON.stringify(zombies), bullets: JSON.stringify(bullets), house: JSON.stringify(houses)});

	// Add new player to the players array
	players.push(newPlayer);

	if(players.length == 1){
		newPlayer.host = true;
		haveHost = true;
		this.emit("hosting");
		startGame();
	}
};

// Player has moved
function onMovePlayer(data){
	// Find player in array
	var movePlayer = playerById(this.id);
	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id + " when asking if moved");
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setDir(data.dir);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), dir: movePlayer.getDir()});
};

//A player has died
function onPlayerDeath(data){
	var deadPlayer = playerById(this.id);
	console.log("death called");
	if(!deadPlayer){
		util.log("player not found:" +this.id + " when asking if dead");
		return;
	};
	util.log("A player has died:" +this.id);

	deadPlayer.setDead(true);

	this.broadcast.emit("death", {id: deadPlayer.id});
};

function notMoved(){
	var nonMover = playerById(this.id);

	if(!nonMover){
		util.log("player not found:" + this.id + " when asking if not moved");
		return;
	}

	//util.log("player has stopped moving:" + this.id);
	this.broadcast.emit("not moved", {id: nonMover.id});
};

function newBullet(data){

	bullets.push(new Bullet(data.x, data.y, data.xDir, data.yDir, data.pierce, data.damage, bulletid, data.bulletSize));
	this.broadcast.emit("new bullet", {id:bulletid, x: data.x, y: data.y, bulletSize: data.bulletSize, xDir: data.xDir, yDir: data.yDir, pierce: data.pierce});
	this.emit("new bullet", {id:bulletid, x: data.x, y: data.y, bulletSize: data.bulletSize, xDir: data.xDir, yDir: data.yDir, pierce:data.pierce});
	bulletid++;
};

function removeBullet(data){
	//console.log("remove a bullet sent by the client");
	var b = bulletById(data.id);

	if(!b){
		console.log("the bullet to be removed wasn't found, probably already removed.");
		return;
	}

	this.broadcast.emit("remove bullet", {id: data.id});

	bullets.splice(bullets.indexOf(b),1);
};

function zombieDeath(data){
	var zombieInQuestion = zombieById(data.id);
	if(!zombieInQuestion){
		console.log("A zombie was claimed dead but couldn't be found");
		return;
	}
	this.broadcast.emit("zombie dead", {id: data.id});

	zombieInQuestion.setHealth(0);
	zombieInQuestion.setDead(true);
};

function breakWindow(data){
	environment.breakPlank(data.plank);

	this.broadcast.emit("break plank", {plank: data.plank});

};

function fixPlank(data){
	//console.log("A window plank has been fixed ");

	//console.log("data" + util.inspect(data));

	environment.fixPlank(data.plank);

	this.broadcast.emit("fix plank", {plank: data.plank});
};

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};

function bulletById(id){
	var i = 0;
	var notFound = true;
	while(notFound && i < bullets.length){

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
	while(notFound && i < zombies.length){

		if(zombies[i].getid() == id){
			return zombies[i];
		};

		i++;
	};

	return false;
};

/**************************************************
** RUN THE GAME
**************************************************/
init();

function startGame(){
	console.log("Game is starting");
	running = true;
	gameRunLoop();
	emitLoop();
};

function stopGame(){
	console.log("Game has finished");
	running = false;
	addScore(score);
	score = 0;
	level = 0;

	players = [];
	zombies = [];
	bullets = [];

	environment = new house();
};

function resetGame(){
	console.log("Game has restarted");
	addScore(score);
	score = 0;
	level = 0;

	zombies.length = 0;
	bullets.length = 0;

	environment = new house();

	for(var i = 0; i < players.length; i++){
		console.log("players no longer dead - ");
		players[i].setDead(false);
		console.log(players[i].id + " death status - " + players[i].getDead());
	};

	running = true;

	console.log("Game reset");

	gameRunLoop();
	emitLoop();
};

/*
* The emit loop, will loop and emit information to clients, this is slower than the actual game loop to slow the game down.
*/
function emitLoop(){
	if(running){
		setTimeout(emitLoop, 1000 / 60);
		io.sockets.emit("updates", {bullets: JSON.stringify(bullets), score: score, level:level});
	}
	//Else { display end screen, ect.}
};

/*
* The game loop runs the actual game, updating AI, collisions, bullets, etc.
*/
function gameRunLoop(){
	if(running){
		setTimeout(gameRunLoop, 1000 / 60);
		//console.log("game loop");

		if(!checkSomethingAlive(zombies) && !levelling){
			levelling = true;
			console.log("initiating next level");
			setTimeout(levelUp, 3000);
			console.log("Emitting levelling");
			io.sockets.emit("levelling");
		};

		score++;
		//For loop for updating bullets
		for(var i = 0; i < bullets.length; i++){
			bullets[i].update();
			if(bullets[i].getTTL()){
				io.sockets.emit("remove bullet", {id: bullets[i].id});
				bullets.splice(i,1);
				i--;
			};
		};

		//check anyone alive
		if(!checkSomethingAlive(players)){
			running = false;
			io.sockets.emit("end game");
			setTimeout(resetGame,3000);
		}
	};
	//else { calculate ending, send final figures to players, then start the game again }
};

/*********
* Helper functions.
*********/

function levelUp(){
	level++;
	levelling = false;
	var amount = ((level * players.length) * 3);
	console.log("Amount of zombies being spawned - " + amount);

	for(var i = 0; i < amount; i++){
		var zombTemp = new Zombie(zombieid, 
			Math.floor(Math.random() * 800) + 1, 
			Math.floor(Math.random() * -200) + 1,
			Math.floor(Math.random() * 3) + 1,
			Math.floor(Math.random() * (100 * level) + 1));
		zombies.push(zombTemp);	
		io.sockets.emit("new zombie", {id: zombieid, x: zombTemp.x, y: zombTemp.y, _window: zombTemp._window, timer: zombTemp.timer});
		zombieid++;
	};
	
};

//For use on zombies and players.
function checkSomethingAlive(array){
	var i = 0;
	somethingAlive = false;
	while(!somethingAlive && i < array.length){
		if(!array[i].getDead()){
			somethingAlive = true;
		}
		i++;
	};
	return somethingAlive;
};

/****************************
** Score holding values!
****************************/

var scoreTable = new Array();

function addScore(){
	console.log("adding score");
	console.log("current score object");
	console.log(util.inspect(scoreTable));


	scoreTable.splice(scoreTable.length, 0 , score);

	scoreTable.sort();

	console.log("Finished adding");
	console.log(util.inspect(scoreTable));
};