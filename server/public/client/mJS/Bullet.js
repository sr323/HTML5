//@author - samuel richards - candidate number - 77513
/*
The bullet class. This class is initiated when the player fires a bullet,
and passed into an array of bullets, bullets are then constantely drawn and
updated, and removed from the game when collides with an enemy or the 
Time To Live runs out.
*/
//@param _id - the id of the bullet
//@param _x - the starting x location of the bullet
//@param _y - the starting y location of the bullet 
//@param _bulletSize - the size of the bullet
//@param _pierce - the piercing information of the bullet
var Bullet = function(_id, _x, _y, _bulletSize, _pierce){
	//initialise variables
	var img = window.loadedImages.bulletimg;
	var id = _id, pierce = _pierce;
	var x = _x, y = _y;
	var speed = 1;
	var bulletSize = _bulletSize;

	var getX = function(){
		return x;
	};

	var getY = function(){
		return y;
	};

	var setX = function(s){
		x = s;
	};

	var setY = function(f){
		y = f;
	};

	var boxWidth = bulletSize;
	var boxHeight = bulletSize;
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
	};

	//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	//updates the bullet appropriately to keep moving and check for collisions.
	//@param enemies - the zombies in the game array used to check if the bullet collided with any zombie
	//@param collisionDetection - the collision detection function used to check bounding box collisions	
	var update = function(enemies, collisionDetection){
		//Higher the mod value is, the slower the bullets.
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].getHealth() > 0){//if the zombie is alive check for collisions
				if(collisionDetection(enemies[i],this)){//if the enemy and the bullet collide
					enemies[i].takeDamage(1);//the zombie takes damage
					if(!pierce){//if the bullet isn't piercing the bullet is removed 
						window.bulletGameRemoval(id);//removes the bullet
					}
					if(enemies[i].getHealth() == 0){//if the enemy dies
						//Should also inform the server about the zombie being killed.
						window.emitZombieDeath(enemies[i].getid());//informs the server the zombie died
						enemiesAlive--;
					}
				}
			}
		}
	};
	//@returns all appropriate functions and variables for the use of external files
	return{
		drawBoundingBox:drawBoundingBox,
		draw:draw,
		getX:getX,
		getY:getY,
		setY:setY,
		setX:setX,
		update:update,
		id:id,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		boxX:boxX,
		boxY:boxY
	}
};