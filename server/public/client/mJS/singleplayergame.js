/*
*@author samuel richards
*@candidate number: 77513
*
* Description: the main class, this class completely runs the game and creates instances of the other classes
*/
/****************/
/*Game Variables*/

window.keys;
window.canvas;
window.context;
window.backgroundCanvas;
window.backgroundContext;
window.backCanvas;
window.backContext;
window.hudCanvas;
window.hudContext;
window.player;
window.loadedImages;
window.mouseX = 400;
window.mouseY = 420;
window.housePlanks;
window.spriteChange = 0;
window.enemies = new Array();
window.level = 0;
window.nextLevel = true;
window.levelStarted = false;
window.bullets = new Array();
window.repairTimer = 0;
window.shotTimer = 100;
window.shotDif = 20;
window.dropRandom;
window.pickUps = new Array();
window.enemiesAlive = 0;

	//Random types:
	//1: Piercing bullets.
	//2: More health.
	//3: faster firing rate.
	//4: Bigger bullets.
	//Pick ups.

window.pierceTimer = 1000;
window.fasterFiringTimer = 1000;
window.biggerBulletsTimer = 1000;
window.bulletSize = 12;
window.speedTimer = 1000;
window.pickUpText = new Array();

window.AlphaOne = 1;
window.AlphaTwo = 1;
window.AlphaThree = 1;
window.AlphaFour = 1;
window.AlphaFive = 1;

window.damageText = new Array();
window.addDamageText;

window.score = 0;

window.levelupsound = new Audio("../Sounds/levelup.wav");
window.deathsound = new Audio("../Sounds/death.wav");
window.bulletshotsound = new Audio("../Sounds/gunshot.wav");

/****************/
/*Initialisation*/
//this is triggered by the html page upon load
function singleinitialisation(){
	//create the preloadedimages variable
	window.loadedImages = new preloadedimages();

	//Keys variable is used to store all keys which are currently pressed
	keys = {
		//Pressed array, holds true or nothing for keys which are pressed down.
		pressed:{},
		//checks if a key is currently pressed
		//@param keyCode the keycode of the key checked
		isDown: function(keyCode){
			return this.pressed[keyCode];
		},
		//is called when a key is pressed
		//@param event the keycode of the key pressed
		onKeydown: function(event){
			this.pressed[event.keyCode] = true;
		},
		//releases a key from being pressed
		//@param event - the keycode of the released key
		onKeyup: function(event){
			delete this.pressed[event.keyCode];
		}
	};
	//When the window has initialised, sets up the arena.
	window.onload = function(){
		//the canvas elements
		window.canvas = document.getElementById("frontCanvas");
		//the context is the area inside the canvas, this is why this is drawn onto, to draw onto the canvas.
		window.context = canvas.getContext("2d");
		//background canvas
		window.backCanvas = document.getElementById("backCanvas");
		window.backContext = backCanvas.getContext("2d");
		//hud canvas
		window.hudCanvas = document.getElementById("hudCanvas");
		window.hudContext = hudCanvas.getContext("2d");

		/*
		3rd canvas to draw the zombies coming in through the windows.
		Saves me having to calculate what parts of their body to not draw.
		*/
		window.backgroundCanvas = document.getElementById('gameCanvas');
		window.backgroundContext = window.backgroundCanvas.getContext('2d');
		//creates encironment
		housePlanks = new environment(loadedImages.plank);
		//draws the background image
		backgroundContext.drawImage(loadedImages.background,0,0,backgroundCanvas.width, backgroundCanvas.height);
		//draws all the houseplanks
		housePlanks.draw(context);
		//draws the background canvas on the main canvas initially
		context.drawImage(backgroundCanvas, 0, 0, canvas.width, canvas.height);
		//creates a new player
		player = new Player(loadedImages.playerImage, loadedImages.otherPlayer);
		//triggers the initiailise method 'mInit' in the multiplayer class.
		mInit();
		//draws the player
		player.draw(context);	
		//sets up handlers - aka event listeners
		handlers();
	}
};
//initialises event listeners for the window which effect the game element
//reference for mouse co-ords - http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
//reference for key presses - http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
function handlers(){
	window.addEventListener('keyup', function(event) { keys.onKeyup(event); }, false);
    window.addEventListener('keydown', function(event) { keys.onKeydown(event); }, false);
    canvas.addEventListener('mousedown', checkMouseDown, false);
    canvas.addEventListener('mousemove', mouseCoords, false);
    //starts the game updating
    singleupdate();
};

function checkMouseDown(event){
	//Code for firing a gun or what not.
};
//fires a bullet from the players location in a direction
function fireBullet(){
	//creates a new bullet with all appropriate variables
	if(shotTimer > shotDif){
		//with the multiplayer game it uses the multiplayer create bullet method, which uses the server to create the bullet
		window.mFireBullet(player.getX(), player.getY(), (mouseX - player.getX()), (mouseY - player.getY()), player.getPierce(), player.getDamage(), window.bulletSize);
		shotTimer = 0;
		bulletshotsound.play();
	}
};
//mouse co ordinates information passed to this method when the event is triggered.
//@param event - all of the mouse co-ordinate information
function mouseCoords(event){

	//has to find the x and y from the canvases offset
	var rect = canvas.getBoundingClientRect();

	//Sets the mouse x variable with the current mouse x location
	window.mouseX = (event.clientX - rect.left);
	//Sets the mouse y variable with the current mouse y location
	window.mouseY = (event.clientY - rect.top);
};

//method changes the players direction to face the mouse at all times
function mousePosition(){ 
	if(!player.getDead()){//if player isnt dead
		var dirx = mouseX - player.getX();//find the difference between the player and the co-ordinates
		var diry = mouseY - player.getY();
		//sets the correct direction depending on the mouse and player locations
		if(diry < -10 && dirx < 30 && dirx > -30){
			//North
			player.setDir(2);
		}
		else if(diry > 10 && dirx < 30 && dirx > -30){
			//South
			player.setDir(6);
		}
		else if(dirx < -10 && diry < 40 && diry > -30){
			//West
			player.setDir(0);
		}
		else if(dirx > 10 && diry < 40 && diry > -30){
			//East
			player.setDir(4);
		}
		else if(dirx < 10 && diry < -30){
			player.setDir(1);
		}
		else if(dirx > 10 && diry < -30){
			player.setDir(3);
		}
		else if(dirx < 10 && diry > 30){
			player.setDir(7);
		}
		else if(dirx > 10 && diry > 30){
			player.setDir(5);
		}
	}
};

//the game has to run at a steady rate, and call update and draw methods to keep the canvas dynamic, and simulating a game.
//this method insures that.
//this method is recursively called 60 times a second, and calls update and draw, and also checks mouse position.
function singleupdate(){
	//uses requestAnimFrame from the raf class to call itself 60 times a second.
	window.requestAnimFrame(singleupdate);
	//checks the position of the mouse
	mousePosition();
	//if player isnt dead then checks for keyboard input
	if(!player.getDead()){
		checkKeyInput();
	}
	//keeps sprites iterating
	window.spriteChange++;
	if(spriteChange == 15){
		player.spriteIterate();
		for(var i = 0; i < enemies.length; i++){
			enemies[i].spriteIterate();
		}
		spriteChange = 0;
	}
	//calls update
	update();
	//calls draw
	drawElements();
};

//keyboard input is checked constantely, and the input from the user is used to control the player.
function checkKeyInput(){
	//uses keycodes and only checks keys needed
	if(keys.isDown(82)){
		//checks r to fix windows
	//	console.log("R pressed");
	console.log("calling repair");
		repair();
	}
	//W + A- moves player up and left
	if(keys.isDown(87) && keys.isDown(65)){
		//console.log(" A + W ");
		if(player.getY()>80 && player.getX() > 14){
			player.setMoved(true);
			player.setY(player.getY() - player.getmoveSpeed());
			player.setX(player.getX() - player.getmoveSpeed());
		}
	}
	//W + D- moves player up and right
	else if(keys.isDown(87) && keys.isDown(68)){
	//	console.log("W+ D");
		if(player.getY()>80 && player.getX()<785){
			player.setMoved(true);
			player.setY(player.getY() - player.getmoveSpeed());
			player.setX(player.getX() + player.getmoveSpeed());
		}
	}
	//S + A - moves player down and left
	else if(keys.isDown(83) && keys.isDown(65)){
	//	console.log("S+A");
		if(player.getY() <545 && player.getX() > 14){
			player.setMoved(true);
			player.setY(player.getY() + player.getmoveSpeed());
			player.setX(player.getX() - player.getmoveSpeed());
		}
	}
	//S + D - moves player down and right
	else if(keys.isDown(83) && keys.isDown(68)){
	//	console.log("S+D");
		if(player.getY() <545 && player.getX()<785){
			player.setMoved(true);
			player.setY(player.getY() + player.getmoveSpeed());
			player.setX(player.getX() + player.getmoveSpeed());
		}
	}
	//W - moves player up
	else if(keys.isDown(87)){
	//	console.log("W");
		if(player.getY()>81){
			player.setMoved(true);
			//player.setDir(2);
			player.setY(player.getY() - player.getmoveSpeed());
		}
	}
	//A - moves player left
	else if(keys.isDown(65)){
		//console.log("A");
		if(player.getX() > 15){
			player.setMoved(true);
			//player.setDir(0);
			player.setX(player.getX() - player.getmoveSpeed());
		}
	}
	//S - moves player down
	else if(keys.isDown(83)){
	//	console.log("S");
		if(player.getY() <545){
			player.setMoved(true);
			//player.setDir(6);
			player.setY(player.getY() + player.getmoveSpeed());
		}
	}
	//D - moves player right
	else if(keys.isDown(68)){
	//	console.log("D");
		if(player.getX()<785){
			player.setMoved(true);
			//player.setDir(4);
			player.setX(player.getX() + player.getmoveSpeed());
		}
	}
	//space bar to fire bullet
	if(keys.isDown(32)){
		if(!player.getDead()){
			fireBullet();
		}
	}
};
/*
DRAWING ALL THE ELEMENTS constantely
*/
function drawElements(){
	//checks the canvas context is available to draw on
	if(typeof context !== 'undefined'){
		//clears most of canvas' entire canvas to just a blank screen again
		context.clearRect(0,0, canvas.width, canvas.height);

		backContext.clearRect(0,0, 800, 300);

		hudContext.clearRect(0,0,800,100);
		//then draws elements back onto it, with element changes
		//draw window planks
		housePlanks.draw(context);
		//draw all pick ups
		for(var i = 0; i < pickUps.length; i++){
				pickUps[i].draw(context);
		}
		//draws all the pick up text
		for(var i = 0; i < pickUpText.length; i++){
			var x = pickUpText[i]();
			if(x.alpha == 0){
				pickUpText.splice(i,1);
				i--;
			}
		}
		//draw all enemies
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].getInside()){
				enemies[i].draw(context);//if inside draw on main canvas
				//DrawBoxes
			//	enemies[i].drawBoundingBox(context);
			}
			else{
				enemies[i].draw(backContext);//if outside draw on background canvas
				//DrawBoxes
			//	enemies[i].drawBoundingBox(backContext);
			}
		}
		//draw all damage text messages
		for(var i = 0; i < damageText.length; i++){
			damageText[i].callText();
			if(damageText[i].getAlpha() < 0){
				damageText.splice(i,1);
				i--;
			}
		}
		
		//draw all bullets
		for(var i = 0; i < bullets.length; i++){
			bullets[i].draw(context);
		//	bullets[i].drawBoundingBox(context);
		}
		//draw the cursor
		drawCursor();

		//The player being drawn after the zombies draws the player after the zombies.
		//If he is above them he will be drawn after and be drawn over them.
		//But as they are coming from above and he is more likely to be under, this is a sacrifice.
		player.draw(context);
		//player.drawBoundingBox(context);
		//draw the multiplayer connected other players
		window.mDraw(context);
		//draw the HUD of information
		drawHud();

	}
};
//draws the cursor which follows the mouse location
var drawCursor = function(){
	context.drawImage(window.loadedImages.crossHairs, //Image
	0, 0, /*Source image x and y*/
	600,600, /*Source image width and height*/
	mouseX - 20, mouseY - 20, /* Destination canvas x and y */
	40,40); /*Destination width and height*/
};

/*
UPDATING THE GAME
*/
function update(){
	//keep incrementing pick up timers, when they hit 1000 they are removed
	window.shotTimer++;
	window.pierceTimer++;
	window.fasterFiringTimer++;
	window.biggerBulletsTimer++;
	window.speedTimer++;
	//update all pick ups and give collision detection to check if user collides with this object
	for(var i = 0; i < pickUps.length; i++){
		pickUps[i].update(collisionDetection, player);
		if(pickUps[i].TTLover()){
			//if TTL is over (Time to live) remove the object from game
			pickUps.splice(i,1);
			i--;
		};
	};
	//when bullet locations are updated by the server, they each run collision functions client side
	for(var i = 0; i < bullets.length; i++){
		bullets[i].update(enemies, collisionDetection);//given enemies and collision function
	};

	//checks if all pick up timers are 1000, if they are remove the benefit from the game
	if(pierceTimer == 1000){
		player.setPierce(false);
	//	console.log("Pierce finished");
	}
	if(fasterFiringTimer == 1000){
		shotDif = 20;
	//	console.log("shots slowed");
	}
	if(biggerBulletsTimer == 1000){
	//	console.log("bullets small agan");
		bulletSize = 12;
	}
	if(speedTimer == 1000){
		player.setmoveSpeed(3);
	}

		//sorts the enemies by y value, so zombies higher up are drawn first, this stops higher zombies being drawn over the lower 
	//y value zombies
	enemies.sort(function(a,b){return a.getY() - b.getY()});

	//the enemies are all updated with their simple AIs' to run at the closest player using euclidean distance
	for(var i = 0; i < enemies.length; i++){
		var tempplayer = player;
		if(remotePlayers.length != 0){//if no other players, this is unnecessary
			var currentDistance = euclideanDistance(tempplayer,enemies[i]);
			for(var o = 0; o < remotePlayers.length; o++){
				if(!remotePlayers[o].getDead()){	//if not dead, check if other player is closer
					var tempDistance = euclideanDistance(remotePlayers[o],enemies[i]);
					if(tempDistance < currentDistance || tempplayer.getDead()){//if players euclidean is closer
						currentDistance = tempDistance;
						tempplayer = remotePlayers[o];//the closest player becomes the zombie target
					}
				}

			}//End of for
		}//End of if
		//runs at the closest player after calculation
		enemies[i].update(tempplayer,collisionDetection);
	}//End of enemies for
};

//function to calculate which enemy is closest
//@param a - the zombie element to check
//@param b - the  player element to check
//@return the euclidean distances
function euclideanDistance(a,b){
	var p = Math.pow((a.getX() - b.getX()),2);
	var q = Math.pow((a.getY() - b.getY()),2);

	return Math.sqrt(p + q);
};

//method used to check bounding box collisions
//reference - taken from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
function collisionDetection(a, b) {
	//REFERENCE NO TEARS GUIDE TO HTML5 GAME DEVELOPMENT
    return a.boxX() < b.boxX() + b.boxWidth &&
         a.boxX() + a.boxWidth > b.boxX() &&
         a.boxY() < b.boxY() + b.boxHeight &&
         a.boxY() + a.boxHeight > b.boxY();
};

//repair function used to check if the player is close enough to a window, and if he is repairs the window
function repair(){
	if(player.getY() < 150){
		if(player.getX() > 85 && player.getX() < 200){
			repairWindow(1);
			//calls the repairWindow with the specified window
		}
		else if(player.getX() > 360 && player.getX() < 475){
			repairWindow(2);
			//calls the repairWindow with the specified window
		}
		else if(player.getX() > 590 && player.getX() < 700){
			repairWindow(3);
			//calls the repairWindow with the specified window
		}
	}
};

//repair window function
//@param n - the window to fix a plank on
function repairWindow(n){
	console.log("repair here");
	if(housePlanks.anyBroken(n)){//check if the window is broken at all
		console.log("A houseplank is broken");
		window.repairTimer++;//keeps a window timer so the player cant instantly fix windows
		if(repairTimer == 50){
			housePlanks.repair(n);//if the timer is reached, the window at the location is fixed.
			//houseplanks.repair calls the multiplayer function to communicate the fix to the server
			repairTimer = 0;
		}
		else{
			console.log("repairTimer != 50");
		}
	}
	else{
		console.log("no house planks broken");
	}
}

//drop random used when a zombie dies. It pushes the pickup drop to the arraylist
//@param n - the pickup number
//@param x - the x location of the drop
//@param y - the y location of the drop
//@param inside - if the drop is inside or not
window.dropRandom = function(n,x,y,inside){
	//console.log("drop random called with: " +  n);
	if(inside){
		//pushes the pick up to the arraylist
		pickUps.push(new pickup(x,y,n));
	}
};

//pickup function is used as an object for the random pickup drops arraylist.
//@param _x - the x location of the drop
//@param _y - the y location of the drop
//@param number -  the number of the pick up
var pickup = function(_x,_y,number){
	//Random types:
	//1: Piercing bullets.
	//2: More health.
	//3: faster firing rate.
	//4: Bigger bullets.
	//add 5 - speed increase.
	//initialises variables
	var x = _x, y = _y, type = number;
	//returns x 
	var getX = function(){
		return x;
	};
	//returns y
	var getY = function(){
		return y;
	};
	//image to use
	var pickUpImage;
	//checks the image to use, image depends on the number of the pick up (aka the drop type)
	var imageLoad = function(){
		switch(type){
			case 1:
				pickUpImage = window.loadedImages.piercingBulletIcon;
			  break;
			case 2:
				pickUpImage = window.loadedImages.healthIcon;
			  break;
			case 3:
				pickUpImage = window.loadedImages.bulletSpeedIncrease;
			  break;
			case 4:
				pickUpImage = window.loadedImages.bigBulletIcon;
			  break;
			case 5:
				pickUpImage = window.loadedImages.speedIcon;
			 break;
			}
	};
	//calls image load
	imageLoad();
	//Bounding Box
	var boxWidth = 50;
	var boxHeight = 50;
	//returns the x location of the box
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	//returns the y location of the box
	var boxY = function(){
		return getY() - (boxHeight/2);
	};
	//Time to live
	var TTL = 300;
	var type = number;
	//draw bounding box around the element
	//@param context - the canvas to draw  onto
	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};
	//draws the pick up icon
	//@param context - the canvas to draw the image onto
	var draw = function(context){
		context.drawImage(pickUpImage, //Image
			0, 0, /*Source image x and y*/
			50,50, /*Source image width and height*/
			boxX(), boxY(), /* Destination canvas x and y */
			boxWidth,boxHeight); /*Destination width and height*/
	};
	//returns true if TTL is less than one else false
	var TTLover = function(){
		return TTL < 1;
	};
	//updates the pick up to just check for collision detection with the player 
	var update = function(collisionDetection, player){
		TTL--;

		if(collisionDetection(player,this)){//checks collision detection
			TTL = 0;//if it collides remote this pick up
			//and display some text informing the user about the pick up
			switch(type){
				//The text is added to an array to found out and slowly opacity is decreased until the text has gone
				//pickuptext stores all of the text objects in the form of a method called fadeout
				case 1:
					AlphaOne = 1;
				  	player.setPierce(true);//sets player benfit for picking this pickup up
				  	pierceTimer = 0;//resets pick up timer
				  	pickUpText.push(fadeOut("Piercing bullets picked up!",1,50,200));
				  break;
				case 2:
				  	fadeOut("Player health increase!");
				  	player.setHealth(player.getHealth() + 5);//sets player benfit for picking this pickup up
				  	pickUpText.push(fadeOut("Player health increase!",2,50,260));
				  	AlphaTwo = 1;
				  break;
				case 3:
					AlphaThree = 1;
					fadeOut("Shot  speed increase!");
				  	shotDif = 10;//sets player benfit for picking this pickup up
				  	fasterFiringTimer = 0;//resets pick up timer
				  	pickUpText.push(fadeOut("Shoot speed increase picked up!",3,50,320));
				  break;
				case 4:
					AlphaFour = 1;
					fadeOut("Bullet size increase!");
					bulletSize = 18;//sets player benfit for picking this pickup up
					biggerBulletsTimer = 0;//resets pick up timer
					pickUpText.push(fadeOut("Bullet size increase!",4,50,380));
				  break;
				case 5:
					AlphaFive = 1;
					fadeOut("Player speed increased!");
				    player.setmoveSpeed(6);//sets player benfit for picking this pickup up
				    speedTimer = 0;//resets pick up timer
				    pickUpText.push(fadeOut("Player speed increase!",5,50,460));
				 break;
			}
		}
	};
	//returns all variables and functions for external use
	return{
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		boxX:boxX,
		boxY:boxY,
		type:type,
		drawBoundingBox:drawBoundingBox,
		TTL:TTL,
		TTLover:TTLover,
		update:update,
		draw:draw
	}

};

//this function is used to track opacity with "taken damage" text
//@param alpha1 - the alpha opacity of the current text object
//@param y1 - the current y value of the text object
//the y value is moved down the page whilst the opacity fades to 0
function takeArray(alpha1, y1){
	var alpha =  alpha1;
	var y = y1;
	//makes the text act accordingly
	var callText = function(){
		takeDamageText(alpha, y);
		alpha = alpha - 0.005;
		y = y + 1;
	}
	//return alpha
	var getAlpha = function(){
		return alpha;
	}
	//returns all required functions
	return {
		callText:callText,
		getAlpha:getAlpha
	}
};
//function is called to create the "take damage" text on the screen
//@param alpha1 - the alpha opacity of the current text object
//@param y1 - the current y value of the text object
function takeDamageText(alpha1, y1){
		window.context.fillStyle = "rgba(255, 0, 0, " + alpha1 + ")";
		context.font = "italic 20pt Arial";
		var text =  "Damage taken!";
		if(player.getDead()){
			text = "Being eaten!";//changes the text to being eaten if the player is dead
		}
		context.fillText(text, 600, y1);
};
//pushes the damage text onto the array to be updated
window.addDamageText = function(){
	damageText.push(takeArray(1,200));
};

//fades out the alpha of all text
//@param text - the text to be faded
//@param n - the current n number representing the pick up text to fade
//@param x - the x of the text
//@param y - the y of the text
function fadeOut(text, n,x,y) {
	return function(){
		var alpha = 0;
	  	switch (n){
	  		case 1:
	  			if(AlphaOne > 0){
	  				AlphaOne = AlphaOne - 0.005;
	  				alpha = AlphaOne;
	  			}
	  		break;
	  		case 2:
	  			if(AlphaTwo > 0){
	  				AlphaTwo = AlphaTwo - 0.005;
	  				alpha = AlphaTwo;
	  			}
	  		break
	  		case 3:
	  			if(AlphaThree > 0){
	  				AlphaThree = AlphaThree - 0.005;
	  				alpha = AlphaThree;
	  			}
	  		break;
	  		case 4:
	  			if(AlphaFour > 0){
	  				AlphaFour = AlphaFour - 0.005;
	  				alpha = AlphaFour;
	  			}
	  		break;
	  		case 5:
	  			if(AlphaFive > 0){
	  				AlphaFive = AlphaFive - 0.005;
	  				alpha = AlphaFive;
	  			}
	  			break;
	  		case 6:
	  			if(AlphaDamage > 0){
	  				AlphaDamage = AlphaDamage - 0.05;
	  				alpha = AlphaDamage;
	  			}
	  		break;
	  	}
	  	if(alpha > 0){
	  		//draws the text to the screen after alpha has been reduced
		  	window.context.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
			context.font = "italic 20pt Arial";
			context.fillText(text, x, y);
	    }
	    return{//returns the required variables for external use
	    	n:n,
	    	alpha:alpha
	    }
	}
};

//Draws the entire HUD on a seperate canvas below the game
//@param enemiesAlive - the amount of enemies alive
function drawHud(){
	//the hud context style, set to dark red.
	window.hudContext.fillStyle = "#300000";
	//assigning canvas style
	hudContext.fillRect(0,0,800,100);

	hudContext.fillStyle = "rgba(255,255,255, 1)";
	hudContext.font = "15pt Calibri";
	hudContext.fillText("Health:",10,50);
	//draws the text information onto the hud
	hudContext.fillText("Enemies: " + enemiesAlive, 650,30);
	hudContext.fillText("Level: " + level, 650,60);

	hudContext.fillText("Score: " + score, 350, 85);
	//draws all of the pick up information
	//if the timer is >= 1000 then the pick up is disabled
	//otherwise compute and display the time left on the pick up from 100 to 0%.
	if(pierceTimer >= 1000){
		hudContext.fillText("Piercing bullets: Off", 200,30);
	}
	else{
		hudContext.fillText("Piercing bullets: " + (100 - (Math.floor((pierceTimer / 1000) * 100))) + "%",200,30);
	}

	if(fasterFiringTimer >= 1000){
		hudContext.fillText("Shot speed increase: Off", 200,60);
	}
	else{
		hudContext.fillText("Shot speed increase: " + (100 - (Math.floor((fasterFiringTimer / 1000) * 100))) + "%",200,60);
	}

	if(biggerBulletsTimer >= 1000){
		hudContext.fillText("Bigger bullets: Off", 450,30);
	}
	else{
		hudContext.fillText("Bigger bullets: " + (100 - (Math.floor((biggerBulletsTimer / 1000) * 100))) + "%",450,30);
	}

	if(speedTimer >= 1000){
		hudContext.fillText("Speed increase: Off", 450,60);
	}
	else{
		hudContext.fillText("Speed increase: " + (100 - (Math.floor((speedTimer / 1000) * 100))) + "%",450,60);
	}

	hudContext.fillStyle = "#A00000";
	hudContext.fillRect(80,30,80,30);

	hudContext.fillStyle = "green";
	hudContext.fillRect(80,30, player.getHealth() * 4, 30);

};

//reset function triggerd the server when all players die and need to reset the game.
//the reset function resets all required variable in order to reset the game
function reset(){
	
	window.housePlanks;
	window.spriteChange = 0;
	window.enemies = new Array();

	
	window.bullets = new Array();
	window.repairTimer = 0;
	window.shotTimer = 100;
	window.shotDif = 20;
	window.dropRandom;
	window.pickUps = new Array();

	window.pierceTimer = 1000;
	window.fasterFiringTimer = 1000;
	window.biggerBulletsTimer = 1000;
	window.bulletSize = 12;
	window.speedTimer = 1000;
	window.pickUpText = new Array();

	window.AlphaOne = 1;
	window.AlphaTwo = 1;
	window.AlphaThree = 1;
	window.AlphaFour = 1;
	window.AlphaFive = 1;

	window.damageText = new Array();
	window.addDamageText;

	housePlanks = new environment(loadedImages.plank);
};