var Bullet = function(_id, _x, _y, _bulletSize, _pierce){
	//pierce true or false for piercing bullets.
	//X direction and Y direction and calculated from the cursor location when clicked.
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
	var boxX = function(){
		return x - (boxWidth/2);
	};
	var boxY = function(){
		return y - (boxHeight/2);
	};
	//Bullet speed manipulation.

	var drawBoundingBox = function(context){
		context.fillRect(boxX(), boxY(), 
			boxWidth, boxHeight);
	};

	var draw = function(context){
		context.drawImage(img, //Image
			0, 0, /*Source image x and y*/
			58,58, /*Source image width and height*/
			boxX(), boxY(), /* Destination canvas x and y */
			boxWidth,boxHeight); /*Destination width and height*/
	};

		//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	var update = function(enemies, collisionDetection){
		//Higher the mod value is, the slower the bullets.
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].getHealth() > 0){
				if(collisionDetection(enemies[i],this)){
					enemies[i].takeDamage(1);
					if(!pierce){
						window.bulletGameRemoval(id);
					}
					if(enemies[i].getHealth() == 0){
						//Should also inform the server about the zombie being killed.
						window.emitZombieDeath(enemies[i].getid());
						enemiesAlive--;
					}
				}
			}
		}
	};

	//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	//var update = function(){
	//	x = x + (xDir * (speed / 75));
	//	y = y + (yDir * (speed / 75));
	//	console.log("new x: " + x + " new y: " + y);
	//};

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