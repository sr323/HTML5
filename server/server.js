/*
@author samuel richards
@candidate number: 77513

Description: This file is the server file. This server acts for serving the HTML pages to clients, along with any necessary other 
files they need to render the page (images, sounds, css, js etc), and acts as the game server, for the current multiplayer 
game in progress.

The server is split into two sections. The first section labelled "serving web pages" uses the express Node.Js library 
 to serve the HTML pages naively.

And the rest of the server from "Node.JS requirements" is coded purely for the multiplayer game.

This works by listening on different ports. Serving pages listens on port 3000, while multiplayer game pages listen on 8000.

The server keeps track of elements, but doesn't update the elements, this was done on the client side as this multiplayer was
built ontop of the single player game. But to keep the server up to date there is constantely a host of the game, the host keeps
the server up to date with zombie information by systematically messaging the server.

When a new client joins, the updates zombie information is then passed onto the new client.
*/

/*************************************************
** Serving web-pages
*************************************************/

/*
	This code is purely for serving web pages.

	All of the files which a client would need are stored in a folder called 'public' on the server, then when a client requests
	a page, the server already knows it look into the public folder for it.

	So when the server recieves the request 'http://37.235.54.208:3000/client/index.html', the port is 3000, which means a page needs
	serving to a client, and the extension '/client/index.html' means to look in the public folder for the folder client, and inside 
	that distribute the HTML file called index. 

	A Node.JS library called express is used for the serving of pages, and automatically sends all required content to the client.
*/

//Express is the library used, aquired by using Node.JS's require method.
var express = require('express');
//Var app initialises the express class.
var app = express();
//fs is the Node.JS's filesystem, this allows for writing and reading files on the server. 
var fs = require('fs');
//The path is another Node.JS file, and is a utility for handing file paths
var path = require('path');

//The app configure uses the path method to permanently join the 'public' string onto the current path, so when looking for files
//it always starts in the public folder automatically.
app.configure(function(){
  app.use(express.static(path.join(__dirname, 'public')))
});

//The Express app server listens to serve pages on port 3000
app.listen(3000);
console.log('Listening on port 3000');

/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/

/*
The rest of the server is for the multiplayer game. This runs on port 8000 and allows for clients and the server to communicate
and play a synchronised game.
*/
//util is a utility, allows for objects to be inspected, allows easy logging of data and more.
var util = require("util"),					// Utility resources
	//io is the websockets.io class, and is used for messaging between clients and server, this listens on port 8000.
	io = require("socket.io").listen(8000),	// Socket.IO
	//The remote classes are incredibly similar to the games respective classes, and are just for storing data about each element,
	//to distribute the information to all the players.
	Player = require("./Player").Player,	// Player remote class
	Zombie = require("./Zombie").Zombie,	//Zombie remote class
	Bullet = require("./bullet").Bullet,	//bullet remote class
	house = require("./house").house;		//house remote class

/**************************************************
** GAME VARIABLES
**************************************************/

/*
The game information variables.
*/
var players,	// Array of connected players
	zombies,	//Array of zombies
	bullets;	//Array of bullets

var level = 0,	//Current level
	score = 0,	//Current score
	levelling = false,	//Stores a variable used to check if the game should level up or not
	running = false,	//Checks if the game is running, used to only loop the game methods when the game is actually being played.
	bulletid = 0,	//Bullet id and zombie id are used to create unique id's when creating new elements
	zombieid = 0,
	haveHost = false,	//Have host stores if the game has a host or not. 
	environment = new house();	//Creates a new house remote class, stores if windows are broken into etc.

	//Score array holding top scores.
	var scoreTable = new Array();

/**************************************************
** GAME INITIALISATION
**************************************************/
//Init method is for initialising the game. Most game variables are initialised here. 
function init() {
	// Create an empty array to store players
	players = [];
	//Creates an empty array to store zombies in the game
	zombies = [];
	//Creates an empty array to store bullets currently in the game
	bullets = [];

	// Configure Socket.IO
	io.configure(function() {
		// Only use WebSockets
		io.set("transports", ["websocket"]);

		// Restrict log output
		io.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();
};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
/*
	After game variables are created, the ability for the server and the clients to communicate is created.
*/
var setEventHandlers = function() {
	//When a player connects, call the method onSocketConnection
	io.sockets.on("connection", onSocketConnection);
};

//When a player is connected, the server has to configure its settings. Because each time a client sends a message the server has to
//react differently. 

//The server reacts differently due to the message it recieves, this is done using the client.on method, this method has two parameters
//The first parameter is the message which the server has recieved by the client, and the second is the callback function, which
//is the function that will be triggered.

//For example client.on("disconnect",onClientDisconnect) - when the server recieves "disconnect" from this client, the method
//onClientDisconnect is triggered, passing the client object to the method call.

//@param client - the current client networking object
function onSocketConnection(client) {
	//util.log is the equivalent to Java's System.out.println and prints text lines to the command line. mainly for development use.
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

/*
Host update is called each time the host updates the server. It passes all the zombies stored on the clients machine with 
updated information.

The method then finds the remote zombie duplicate on the server and updates its information.

@param data - the data parameter is the information passed from the client, this can include Javascript Literal objects
or a array in stringify form(string representation).
@return returns nothing if the zombie can't be found.
*/
function hostUpdate(data){
	//JSON.parse turns a string array into an actual array, which was used extensively to send arrays over the network.
	var zombieParse = JSON.parse(data.zombies);
	//For loops through all the zombies passed.
	for(var i = 0; i < zombieParse.length; i++){
		//Calls zombieById with the ID of the zombie, which returns the remote zombie with the same ID in the servers zombie array.
		//if a zombie isn't found, the zombieById returns false.
		var zomb = zombieById(zombieParse[i].id);
		//if the zombie wasn't found, return and leave the function.
		if(!zomb){
			console.log("A zombie was not found " + zomb.getid());
			return;
		}

		//If the zombie is found, update all of its information with the updated information passed by the client.
		zomb.setX(zombieParse[i].x);
		zomb.setY(zombieParse[i].y);
		zomb.setInside(zombieParse[i].inside);
		zomb.setHealth(zombieParse[i].health);
		zomb.setCurrentTime(zombieParse[i].currentTime);
	}
};

/*
When the servers current host leaves the game, all the other clients respond to become the next client, the first client to respond is
the new host, by triggering this method.

@return returns nothing if the player isnt found.
*/
function requestedHost(){
	console.log("a new host has been requested - " + this.id);
	//The playerById finds the servers player object with the ID given, the clients server object is found on the server.
	//And passed into the variable playerHost.
	var playerHost = playerById(this.id);
	//If playerById returns false then return and leave the function.
	if(!playerHost){
		console.log("A player hasn't been found when requested host");
		return;
	};
	//The client host object has been found.
	console.log("Have a host currently? " + haveHost);
	if(!haveHost){	//checks if the host place is still available
		haveHost = true;
		//this player becomes the host
		playerHost.host = true;
		//then the client is told it's hosting, so it knows to emit host updates to the client.
		//messages are sent to a specific client with this.emit
		this.emit("hosting");
		console.log("new host found");
	};
};

//Socket client has disconnected
//@return returns nothing if the player object isn't found.
function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);
	//finds the player which has left, to remove its object from server.
	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id + " when checking a disconnect");
		return;
	};

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id, host:removePlayer.host});
	//checks if the removed player is the host
	if(removePlayer.host){
		console.log("A player has been removed thatwas the host");
		haveHost = false;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);
	//if the player disconnected and no players are left, stop the game looping.
	if(players.length == 0){
		stopGame();
	};
};

// New player has joined
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y, data.dir);
	//give the new player object an id, equal to the networking objects id.
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), dir: newPlayer.getDir(), dead: newPlayer.getDead()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), dir: existingPlayer.getDir(), dead: existingPlayer.getDead()});
	};

	//Creates a remotePlanks object, to store only the information required about the environment(house) to send to the new player.
	//So the new player can render theworld in the same state as every other player. 
	var remotePlanks = function(windowNo, _plank1,_plank2){
		var plank1 = _plank1, plank2 = _plank2, _window = windowNo;
		return{
			plank1:plank1,
			plank2:plank2,
			windowNo:_window
		}
	}
	//new house array created
	var houses = new Array();
	//new houses array is filled with 3 remotePlanks object, each object has a window number, and information if the 2 seperate windows
	//and broken down or not, in true or false.
		for(var i = 0; i < 3; i++){
			if(i == 0){
				//The environment.window*.plank* returns true or false if the window plank is broken or not
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

	//sends all the zombies in play, all the bullets and window information required to the new player 
	//for the new player to join the current game in the state displayed for everyone else.
	this.emit("new player information", {level: level, score: score, zombies: JSON.stringify(zombies), bullets: JSON.stringify(bullets), house: JSON.stringify(houses)});

	// Add new player to the players array
	players.push(newPlayer);

	//if the player is the first player, this player is told to be the host, and the game is started.
	if(players.length == 1){
		newPlayer.host = true;
		haveHost = true;
		this.emit("hosting");
		startGame();
	}
};

// When a player moves, it updates the server with its new location.
//@param data - the data passed from the client to the server
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

//A player has died - and its informing the server on there death
//@param data - the data passed from the client to the server
function onPlayerDeath(data){
	//find player in array
	var deadPlayer = playerById(this.id);
	console.log("death called");
	//if player not found
	if(!deadPlayer){
		util.log("player not found:" +this.id + " when asking if dead");
		return;
	};
	util.log("A player has died:" +this.id);
	//set the player objects dead variable to true
	deadPlayer.setDead(true);
	//broadcast information to other players
	this.broadcast.emit("death", {id: deadPlayer.id});
};

//If a player has not moved, should inform others so they can draw sprites appropriately.
function notMoved(){
	//find player in array
	var nonMover = playerById(this.id);
	//if player not found return nothing
	if(!nonMover){
		util.log("player not found:" + this.id + " when asking if not moved");
		return;
	}
	//util.log("player has stopped moving:" + this.id);
	this.broadcast.emit("not moved", {id: nonMover.id});
};

//When a player has shot a bullet, the server creates a new bullet at its location and informs everyone of its existance
//@param data - the data passed from the client to the server
function newBullet(data){
	//New bullet created and pushed to the bullets array with the required information from the client
	bullets.push(new Bullet(data.x, data.y, data.xDir, data.yDir, data.pierce, data.damage, bulletid, data.bulletSize));
	//broadcast this information to every other player
	this.broadcast.emit("new bullet", {id:bulletid, x: data.x, y: data.y, bulletSize: data.bulletSize, xDir: data.xDir, yDir: data.yDir, pierce: data.pierce});
	//broadcast the new bullet to the client who fired the bullet
	this.emit("new bullet", {id:bulletid, x: data.x, y: data.y, bulletSize: data.bulletSize, xDir: data.xDir, yDir: data.yDir, pierce:data.pierce});
	//increase the bulletid variable to keep bullet id unique
	bulletid++;
};

//Remove a bullet when it's collided with an enemy
//@param data - the data passed from the client to the server
function removeBullet(data){
	//find the bullet in array
	var b = bulletById(data.id);
	//if not found return nothing
	if(!b){
		console.log("the bullet to be removed wasn't found, probably already removed.");
		return;
	}
	//broadcast and inform everyone of the bullets removal and its id.
	this.broadcast.emit("remove bullet", {id: data.id});
	//remove the bullet from array
	bullets.splice(bullets.indexOf(b),1);
};

//client has told the server a zombie has died, tell all the other players also
//@param data - the data passed from the client to the server
function zombieDeath(data){
	//find the zombie in array
	var zombieInQuestion = zombieById(data.id);
	//if zombie not found return nothing
	if(!zombieInQuestion){
		console.log("A zombie was claimed dead but couldn't be found");
		return;
	}
	//broadcast the zombie removal to all players
	this.broadcast.emit("zombie dead", {id: data.id});
	//set the zombie to dead
	zombieInQuestion.setHealth(0);
	zombieInQuestion.setDead(true);
};

//Zombie has broken a plank on the game
//@param data - the data passed from the client to the server
function breakWindow(data){
	//calls the environment.breakplank method on the window number
	environment.breakPlank(data.plank);
	//braodcast to tell all the other players about the broken window.
	this.broadcast.emit("break plank", {plank: data.plank});
};

//A player has fixed the window
//@param data - the data passed from the client to the server
function fixPlank(data){
	//Environment.fixplank method fixes a plank on a window number - 1, 2 or 3.
	environment.fixPlank(data.plank);
	//braodcast to tell all the other players about the broken window.
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

//find a bullet by ID.
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

//find a zombie by ID.
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
** Game specific functions
**************************************************/
init(); // call init to initialise the games variables

//Start game function turns the running variable to true and starts the game loops
function startGame(){
	console.log("Game is starting");
	running = true;
	gameRunLoop();
	emitLoop();
};

//Stop game turns the game loops off when turning running to false.
//and resets all game variables.
function stopGame(){
	console.log("Game has finished");
	running = false;
	//calls the addscore method for the highscores table.
	addScore(score);
	score = 0;
	level = 0;

	players = [];
	zombies = [];
	bullets = [];

	environment = new house();
};

//Reset game is called when all players have died, the game restarts so they can try to beat more highscores.
//resets all variables.
//and brings all players back to life, and starts the game loops again.
function resetGame(){
	console.log("Game has restarted");
	//calls the addscore method for the highscores table.
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
* The emit loop, will loop and emit information to clients, this is slower than the actual game loop keep networking lower.
*/
function emitLoop(){
	if(running){
		setTimeout(emitLoop, 1000 / 30);
		io.sockets.emit("updates", {bullets: JSON.stringify(bullets), score: score, level:level});
	}
};

/*
* The game loop runs the actual game, updating AI, collisions, bullets, etc.
*/
function gameRunLoop(){
	if(running){
		//recursive call to itself to run it at the speed specified. 60 times a second(1000 ms).
		setTimeout(gameRunLoop, 1000 / 60);
		//console.log("game loop");
		//checks if any zombies are alive and if its not already levelling, and if both are false, it levels up the game.
		if(!checkSomethingAlive(zombies) && !levelling){
			levelling = true;
			console.log("initiating next level");
			//calls the level up function to respond in 3 seconds.
			setTimeout(levelUp, 3000);
			console.log("Emitting levelling");
			//informs all clients of the levelling
			io.sockets.emit("levelling");
		};
		//keeps the score updating with time
		score++;
		//For loop for updating bullets
		for(var i = 0; i < bullets.length; i++){
			//updates all bullets.
			bullets[i].update();
			//if the bullets have been alive too long (Time To Live) remove them.
			if(bullets[i].getTTL()){
				//if a bullet has run out of Time To Live, remove it and inform all connected.
				io.sockets.emit("remove bullet", {id: bullets[i].id});
				bullets.splice(i,1);
				i--;
			};
		};

		//check anyone alive - if no one is, reset the game.
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
//levels up the game appropriately.
function levelUp(){
	level++;
	levelling = false;
	//spawns an amount of zombies depending on the amount of players
	var amount = ((level * players.length) * 3);
	console.log("Amount of zombies being spawned - " + amount);
	//creates new zombies
	for(var i = 0; i < amount; i++){
		var zombTemp = new Zombie(zombieid, 
			Math.floor(Math.random() * 800) + 1, 
			Math.floor(Math.random() * -200) + 1,
			Math.floor(Math.random() * 3) + 1,
			Math.floor(Math.random() * (100 * level) + 1));
		//adds zombies to the zombie array
		zombies.push(zombTemp);	
		//and broadcasts all new zombies to the players with required information
		io.sockets.emit("new zombie", {id: zombieid, x: zombTemp.x, y: zombTemp.y, _window: zombTemp._window, timer: zombTemp.timer});
		//increases zombie id to keep the zombie id unique
		zombieid++;
	};
	
};

//For use on zombies and players.
//checks if an element in the array is alive, used to check if the game is over, or when to level up.
//@param array - the array to be checked.
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
** Score holding values
****************************/
/*
A self built easy method for storing the top 10 scores in an array on the game server.
*/
//The array to store top scores.
var scoreTable = new Array();

//add score takes the current score, adds it to the array, sorts the array by number value, then keeps just the top 10 values.
function addScore(){
	console.log("adding score");
	console.log("current score - " + score);
	console.log(util.inspect(scoreTable));
	//Adds the current score into the table.
	scoreTable.splice(scoreTable.length, 0 , score);
	//Sorts the array of scores by high to low value
	scoreTable.sort(function(a,b){return b - a});
	//if the list of values is higher than 10, make it the top ten highest scores only.
	if(scoreTable.length > 10){
		scoreTable = scoreTable.splice(0,10);
	};

	console.log("Finished adding");
	console.log(util.inspect(scoreTable));
	//Write the array to a file, so the clients can request the file and render the scores on their machines.
	fs.writeFile("./public/score.txt", JSON.stringify(scoreTable));
};