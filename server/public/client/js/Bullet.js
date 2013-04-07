//@author - samuel richards - candidate number - 77513
/*
The bullet class. This class is initiated when the player fires a bullet,
and passed into an array of bullets, bullets are then constantely drawn and
updated, and removed from the game when collides with an enemy or the 
Time To Live runs out.
*/
//@param _x - the starting x location of the bullet
//@param _y - the starting y location of the bullet 
//@param _speed - the speed the bullet will travel in
//@param _xDir - the x direction the bullet will travel in
//@param _yDir  - the y direction the bullet will travel in
//@param _pierce - the pierce information of the bullet, true or false
//@param _damage - the damage of the bullet 
//@param _img - the image used to draw the bullet
var Bullet = function(_x,_y, _speed, _xDir, _yDir, _pierce, _damage, _img){
	//initialise variables
	var x = _x, y = _y, speed = _speed, xDir = _xDir, yDir = _yDir, pierce = _pierce, damage = _damage, TTL = 400;
	var img = _img;
	//bullet speed manipulation when moving in vectors
	var modX = 75;
	var modY = 75;

	//Bounding box
	var boxWidth = window.bulletSize;
	var boxHeight = window.bulletSize;
	//gets the x co-ordinate of the bounding box
	//@return the x value of the bounding box
	var boxX = function(){
		return x - (boxWidth/2);
	};
	//gets the y co-ordinate of the bounding box
	//@return the y value of the bounding box
	var boxY = function(){
		return y - (boxHeight/2);
	};

	var getTTL = function(){
		return TTL < 1;
	};

	//Draws the bounding box of the object given a canvas context to draw on
	//@param context the canvas to draw on
	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	//Draws the bullet with the image provided. Drawn to the canvas provided.
	//@param context the canvas to be drawn on
	var draw = function(context){
		context.drawImage(img, //Image
			0, 0, /*Source image x and y*/
			58,58, /*Source image width and height*/
			boxX(), boxY(), /* Destination canvas x and y */
			boxWidth,boxHeight); /*Destination width and height*/
	}

	var dos = 0;

	//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	//updates the bullet appropriately to keep moving and check for collisions.
	//@param enemies - the zombies in the game array used to check if the bullet collided with any zombie
	//@param collisionDetection - the collision detection function used to check bounding box collisions
	var update = function(enemies, collisionDetection){
		//Higher the mod value is, the slower the bullets.
		x = x + (xDir * (speed / modX));
		y = y + (yDir * (speed / modY));
		TTL--;
		//checks bullet collision with all zombies
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].getHealth() > 0){//if the zombie is alive check for collisions
				if(collisionDetection(enemies[i],this)){//if a collision occurs
					enemies[i].takeDamage(damage);//the enemy takes damage
					if(!pierce){//and if the bullet doesnt pierce, the bullet is removed
						TTL = 0;//TTL at 0 removes the bullet
					}
				}
			}
		}

	};
	//@returns all appropriate functions and variables for the use of external files
	return{
		update:update,
		drawBoundingBox:drawBoundingBox,
		boxX:boxX,
		boxY:boxY,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		getTTL:getTTL,
		draw:draw
	}
};