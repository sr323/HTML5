var Bullet = function(_x,_y, _speed, _xDir, _yDir, _pierce, _damage, _img){
	//pierce true or false for piercing bullets.
	//X direction and Y direction and calculated from the cursor location when clicked.
	var x = _x, y = _y, speed = _speed, xDir = _xDir, yDir = _yDir, pierce = _pierce, damage = _damage, TTL = 400;
	var img = _img;
	//Bullet speed manipulation.
	var modX = 75;
	var modY = 75;

	//Bounding box
	var boxWidth = window.bulletSize;
	var boxHeight = window.bulletSize;
	var boxX = function(){
		return x - (boxWidth/2);
	};
	var boxY = function(){
		return y - (boxHeight/2);
	};

	var getTTL = function(){
		return TTL < 1;
	};

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
	}

	var dos = 0;
	//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	var update = function(enemies, collisionDetection){
		//Higher the mod value is, the slower the bullets.
		x = x + (xDir * (speed / modX));
		y = y + (yDir * (speed / modY));
		TTL--;
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].getHealth() > 0){
				if(collisionDetection(enemies[i],this)){
					enemies[i].takeDamage(damage);
					if(!pierce){
						TTL = 0;
					}
				}
			}
		}

	};

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