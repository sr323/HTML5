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

function singleinitialisation(){

	window.loadedImages = new preloadedimages();

	//Keys variable. As an object literal full of name:value pairs.
	keys = {
		//Pressed array, holds true or nothing for keys which are pressed down.
		pressed:{},
		//Creates a variable which references a function.
		//To trigger the function the syntax needs to be "function(event){keys.isDown(event);}"
		isDown: function(keyCode){
			return this.pressed[keyCode];
		},
		onKeydown: function(event){
			this.pressed[event.keyCode] = true;
		},
		onKeyup: function(event){
			delete this.pressed[event.keyCode];
		}
	};
	//When the window has initialised, sets up the arena.
	window.onload = function(){

		window.canvas = document.getElementById("frontCanvas");
		window.context = canvas.getContext("2d");

		window.backCanvas = document.getElementById("backCanvas");
		window.backContext = backCanvas.getContext("2d");

		window.hudCanvas = document.getElementById("hudCanvas");
		window.hudContext = hudCanvas.getContext("2d");

		/*
		3rd canvas to draw the zombies coming in through the windows.
		Saves me having to calculate what parts of their body to not draw.
		*/
		window.backgroundCanvas = document.getElementById('gameCanvas');
		window.backgroundContext = window.backgroundCanvas.getContext('2d');

		housePlanks = new environment(loadedImages.plank);

		backgroundContext.drawImage(loadedImages.background,0,0,backgroundCanvas.width, backgroundCanvas.height);

		housePlanks.draw(context);

		context.drawImage(backgroundCanvas, 0, 0, canvas.width, canvas.height);

		player = new Player(loadedImages.playerImage);

		player.draw(context);	

		handlers();
	}
};

function handlers(){
	/*
	 Can't add event listener to canvas, as it's not a focusable object.
	 And the arrow keys effect scrolling. So should use WASD for moving the
	 player.
	*/
	window.addEventListener('keyup', function(event) { keys.onKeyup(event); }, false);
    window.addEventListener('keydown', function(event) { keys.onKeydown(event); }, false);
    //http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
    canvas.addEventListener('mousedown', checkMouseDown, false);
    canvas.addEventListener('mousemove', mouseCoords, false);

    singleupdate();
};

function checkMouseDown(event){
	//Code for firing a gun or what not.
};

function fireBullet(){
	//_x,_y, _speed, _xDir, _yDir, _pierce, _damage parameters.
	if(levelStarted && shotTimer > shotDif){
		bullets.push(new Bullet(player.getX(), player.getY(), 1, (mouseX - player.getX()), (mouseY - player.getY()), player.getPierce(), player.getDamage(), loadedImages.bulletimg));
		shotTimer = 0;
		bulletshotsound.play();
	}
};

function mouseCoords(event){
	var rect = canvas.getBoundingClientRect();

	//should find a reference here.
	window.mouseX = (event.clientX - rect.left);
	window.mouseY = (event.clientY - rect.top);
};

function mousePosition(){
	if(!player.getDead()){
		var dirx = mouseX - player.getX();
		var diry = mouseY - player.getY();
		/*
		-30 y = north 30 y = south 30 x = east -30 x = west 
		direction 0 - facing west. direction 1 - facing north west.
		direction 2 - facing north. direction 3 - facing north east.
		direction 4 - facing east. direction 5 - facing south east.
		direction 6 - facing south. direction 7 - facing south west
		*/
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

/*Game initialisation and handlers should be complete*/
/*Now the game should loop at a constant 60 fps.     */
function singleupdate(){
	window.requestAnimFrame(singleupdate);

	mousePosition();
	
	//Should check for collisions here before calling the player and zombies to all move.
	//Should maybe store all which collide and where??
	//console.log(player.getDead());
	if(!player.getDead()){
		checkKeyInput();
	}

	window.spriteChange++;
	if(spriteChange == 15){
		player.spriteIterate();
		for(var i = 0; i < enemies.length; i++){
			enemies[i].spriteIterate();
		}
		spriteChange = 0;
	}

	update();

	drawElements();
};

function checkKeyInput(){
	//At the moment keys are getting priority over others.
	//Could be rectified with more if statements.
	if(keys.isDown(82)){
	//	console.log("R pressed");
		repair();
	}
	//W + A
	if(keys.isDown(87) && keys.isDown(65)){
		//console.log(" A + W ");
		if(player.getY()>80 && player.getX() > 14){
			player.setMoved(true);
			player.setY(player.getY() - player.getmoveSpeed());
			player.setX(player.getX() - player.getmoveSpeed());
		}
	}
	//W + D
	else if(keys.isDown(87) && keys.isDown(68)){
	//	console.log("W+ D");
		if(player.getY()>80 && player.getX()<785){
			player.setMoved(true);
			player.setY(player.getY() - player.getmoveSpeed());
			player.setX(player.getX() + player.getmoveSpeed());
		}
	}
	//S + A
	else if(keys.isDown(83) && keys.isDown(65)){
	//	console.log("S+A");
		if(player.getY() <545 && player.getX() > 14){
			player.setMoved(true);
			player.setY(player.getY() + player.getmoveSpeed());
			player.setX(player.getX() - player.getmoveSpeed());
		}
	}
	//S + D
	else if(keys.isDown(83) && keys.isDown(68)){
	//	console.log("S+D");
		if(player.getY() <545 && player.getX()<785){
			player.setMoved(true);
			player.setY(player.getY() + player.getmoveSpeed());
			player.setX(player.getX() + player.getmoveSpeed());
		}
	}
	//W
	else if(keys.isDown(87)){
	//	console.log("W");
		if(player.getY()>81){
			player.setMoved(true);
			//player.setDir(2);
			player.setY(player.getY() - player.getmoveSpeed());
		}
	}
	//A
	else if(keys.isDown(65)){
		//console.log("A");
		if(player.getX() > 15){
			player.setMoved(true);
			//player.setDir(0);
			player.setX(player.getX() - player.getmoveSpeed());
		}
	}
	//S
	else if(keys.isDown(83)){
	//	console.log("S");
		if(player.getY() <545){
			player.setMoved(true);
			//player.setDir(6);
			player.setY(player.getY() + player.getmoveSpeed());
		}
	}
	//D
	else if(keys.isDown(68)){
	//	console.log("D");
		if(player.getX()<785){
			player.setMoved(true);
			//player.setDir(4);
			player.setX(player.getX() + player.getmoveSpeed());
		}
	}
	if(keys.isDown(32)){
		if(!player.getDead()){
			fireBullet();
		}
	}
};
/*
DRAWING ALL THE ELEMENTS
*/
function drawElements(){
	/*This could slow it down, this only catches a minor problem at the star.
	Could be removed without consequence.*/
	if(typeof context !== 'undefined'){

		context.clearRect(0,0, canvas.width, canvas.height);

		backContext.clearRect(0,0, 800, 300);

		hudContext.clearRect(0,0,800,100);

		housePlanks.draw(context);

		for(var i = 0; i < pickUps.length; i++){
				pickUps[i].draw(context);
		}

		for(var i = 0; i < pickUpText.length; i++){
			var x = pickUpText[i]();
			if(x.alpha == 0){
				pickUpText.splice(i,1);
				i--;
			}
		}

		var enemiesAlive = 0;
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].getHealth() > 0){
				enemiesAlive++;
			}
			if(enemies[i].getInside()){
				enemies[i].draw(context);
				//DrawBoxes
			//	enemies[i].drawBoundingBox(context);
			}
			else{
				enemies[i].draw(backContext);
				//DrawBoxes
			//	enemies[i].drawBoundingBox(backContext);
			}
		}

		for(var i = 0; i < damageText.length; i++){
			damageText[i].callText();
			if(damageText[i].getAlpha() < 0){
				damageText.splice(i,1);
				i--;
			}
		}
		

		for(var i = 0; i < bullets.length; i++){
			bullets[i].draw(context);
		//	bullets[i].drawBoundingBox(context);
		}

		drawCursor();

		//The player being drawn after the zombies draws the player after the zombies.
		//If he is above them he will be drawn after and be drawn over them.
		//But as they are coming from above and he is more likely to be under, this is a sacrifice.
		player.draw(context);
		//player.drawBoundingBox(context);

		drawHud(enemiesAlive);

	}
};

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

	if(!player.getDead()){
		window.score++;
	}
	
	window.shotTimer++;
	window.pierceTimer++;
	window.fasterFiringTimer++;
	window.biggerBulletsTimer++;
	window.speedTimer++;

	for(var i = 0; i < bullets.length; i++){
		bullets[i].update(enemies, collisionDetection);
		if(bullets[i].getTTL()){
			bullets.splice(i,1);
			i--;
		}
	}

	for(var i = 0; i < pickUps.length; i++){
		pickUps[i].update(collisionDetection, player);
		if(pickUps[i].TTLover()){
			pickUps.splice(i,1);
			i--;
		}
	}

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

	enemies.sort(function(a,b){return a.getY() - b.getY()});

	if(nextLevel){
		nextLevel = false;
		console.log("next level initiated");
		setTimeout(initNextLevel, 2000);
	}
	else if(levelStarted){
		var aZombieAlive = false;
		//console.log(collisionDetection(player, enemies[i]) + " for " + i);
		//Should check for collision detection here, as this is where the enemies are constantely updated.
		for(var i = 0; i < enemies.length; i++){
			enemies[i].update(player,collisionDetection);
			if(enemies[i].getHealth() > 0){
				aZombieAlive = true;
			}
			else{
				if(!enemies[i].getScoreAdd()){
					score = score + 1000;
					enemies[i].setScoreAdd(true);
				}
			}
		}

		if(aZombieAlive == false){
			nextLevel = true;
			levelStarted = false;
		}
	}
};

//REFERENCE NO TEARS GUIDE TO HTML5 GAME DEVELOPMENT
function collisionDetection(a, b) {
    return a.boxX() < b.boxX() + b.boxWidth &&
         a.boxX() + a.boxWidth > b.boxX() &&
         a.boxY() < b.boxY() + b.boxHeight &&
         a.boxY() + a.boxHeight > b.boxY();
};

/*
	Next level initialisations.
*/
function initNextLevel(){
	console.log("starting next level");
	levelStarted = true;
	level++;
	window.levelupsound.play();
	//Amount of zombies spawn depending on the level
	var amount = 3;

	enemies.length = 0;

	for(var i = 0; i < amount * level; i++){

		enemies.push(new zombie(i, 
			Math.floor(Math.random() * 800) + 1, 
			Math.floor(Math.random() * -200) + 1,
			Math.floor(Math.random() * 3) + 1,
			window.loadedImages._zombieSprite,
			housePlanks, Math.floor(Math.random() * (100 * level) + 1)));
	}

};

function repair(){
	if(player.getY() < 150){
		if(player.getX() > 85 && player.getX() < 200){
			repairWindow(1);
		}
		else if(player.getX() > 360 && player.getX() < 475){
			repairWindow(2);
		}
		else if(player.getX() > 590 && player.getX() < 700){
			repairWindow(3);
		}
	}
};

function repairWindow(n){
	if(housePlanks.anyBroken(n)){
		window.repairTimer++;
	//	console.log(repairTimer);
		if(repairTimer == 50){
			housePlanks.repair(n);
			repairTimer = 0;
		}
	}
}

window.dropRandom = function(n,x,y,inside){
	//console.log("drop random called with: " +  n);
	if(inside){
		pickUps.push(new pickup(x,y,n));
	}
};

var pickup = function(_x,_y,number){
	//Random types:
	//1: Piercing bullets.
	//2: More health.
	//3: faster firing rate.
	//4: Bigger bullets.
	//add 5 - speed increase.
	//Bounding Box

	var x = _x, y = _y, type = number;

	var getX = function(){
		return x;
	};
	var getY = function(){
		return y;
	};

	var pickUpImage;

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

	imageLoad();

	var boxWidth = 50;
	var boxHeight = 50;
	var boxX = function(){
		return getX() - (boxWidth/2);
	};
	var boxY = function(){
		return getY() - (boxHeight/2);
	};
	var TTL = 300;
	var type = number;

	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	var draw = function(context){
		context.drawImage(pickUpImage, //Image
			0, 0, /*Source image x and y*/
			50,50, /*Source image width and height*/
			boxX(), boxY(), /* Destination canvas x and y */
			boxWidth,boxHeight); /*Destination width and height*/
	};

	var TTLover = function(){
		return TTL < 1;
	};

	var update = function(collisionDetection, player){
		TTL--;

		if(collisionDetection(player,this)){
			TTL = 0;

			switch(type){

				case 1:
					AlphaOne = 1;
				  	player.setPierce(true);
				  	pierceTimer = 0;
				  	pickUpText.push(fadeOut("Piercing bullets picked up!",1,50,200));
				  break;
				case 2:
				  	fadeOut("Player health increase!");
				  	player.setHealth(player.getHealth() + 5);
				  	pickUpText.push(fadeOut("Player health increase!",2,50,260));
				  	AlphaTwo = 1;
				  break;
				case 3:
					AlphaThree = 1;
					fadeOut("Shot  speed increase!");
				  	shotDif = 10;
				  	fasterFiringTimer = 0;
				  	pickUpText.push(fadeOut("Shoot speed increase picked up!",3,50,320));
				  break;
				case 4:
					AlphaFour = 1;
					fadeOut("Bullet size increase!");
					bulletSize = 18;
					biggerBulletsTimer = 0;
					pickUpText.push(fadeOut("Bullet size increase!",4,50,380));
				  break;
				case 5:
					AlphaFive = 1;
					fadeOut("Player speed increased!");
				    player.setmoveSpeed(6);
				    speedTimer = 0;
				    pickUpText.push(fadeOut("Player speed increase!",5,50,460));
				 break;
			}
		}
	};

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

function takeArray(alpha1, y1){
	var alpha =  alpha1;
	var y = y1;

	var callText = function(){
		takeDamageText(alpha, y);
		alpha = alpha - 0.005;
		y = y + 1;
	}

	var getAlpha = function(){
		return alpha;
	}

	return {
		callText:callText,
		getAlpha:getAlpha
	}
};

function takeDamageText(alpha1, y1){
		window.context.fillStyle = "rgba(255, 0, 0, " + alpha1 + ")";
		context.font = "italic 20pt Arial";
		var text =  "Damage taken!";
		if(player.getDead()){
			text = "Being eaten!";
		}
		context.fillText(text, 600, y1);
};

window.addDamageText = function(){
	damageText.push(takeArray(1,200));
};

//Fade out text
/*
http://stackoverflow.com/questions/9932898/fade-out-effect-for-text-in-html5-canvas
*/
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
		  	window.context.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
			context.font = "italic 20pt Arial";
			context.fillText(text, x, y);
	    }
	    return{
	    	n:n,
	    	alpha:alpha
	    }
	}
};

function drawHud(enemiesAlive){
	window.hudContext.fillStyle = "#300000";
	hudContext.fillRect(0,0,800,100);

	hudContext.fillStyle = "rgba(255,255,255, 1)";
	hudContext.font = "15pt Calibri";
	hudContext.fillText("Health:",10,50);

	hudContext.fillText("Enemies: " + enemiesAlive, 650,30);
	hudContext.fillText("Level: " + level, 650,60);

	hudContext.fillText("Score: " + score, 350, 85);

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

function reset(){
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

	housePlanks = new environment(loadedImages.plank);
	player = new Player(loadedImages._zombieSprite);

};