var bullet = function(_x,_y, _xDir, _yDir, _pierce, _damage, _id, _bulletSize){

	var x = _x, y = _y, speed = 1, xDir = _xDir, yDir = _yDir, pierce = _pierce, damage = _damage, TTL = 400;
	var id = _id;
	var bulletSize = _bulletSize;

	//Bounding box
	var boxWidth = bulletSize;
	var boxHeight = bulletSize;
	var boxX = function(){
		return x - (boxWidth/2);
	};
	var boxY = function(){
		return y - (boxHeight/2);
	};

	var getTTL = function(){
		return this.TTL < 1;
	};

	var getX = function(){
		return this.x;
	};

	var getY = function(){
		return this.y;
	};

	var setX = function(s){
		x = s;
	};

	var setY = function(f){
		y = f;
	};

	//Reference
	//http://gamedev.stackexchange.com/questions/28180/shoot-a-bullet-towards-cursor-top-down-2d
	var update = function(){
		//Higher the mod value is, the slower the bullets.
		this.x = this.x + (xDir * (speed / 75));
		this.y = this.y + (yDir * (speed / 75));
		this.TTL--;
	};

	return{
		update:update,
		boxX:boxX,
		x:x,
		y:y,
		boxY:boxY,
		boxWidth:boxWidth,
		boxHeight:boxHeight,
		getTTL:getTTL,
		id:id,
		getX:getX,
		getY:getY,
		setX:setX,
		setY:setY,
		TTL:TTL,
		bulletSize:bulletSize,
		pierce:pierce
	}

};

exports.Bullet = bullet;