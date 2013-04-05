var preloadedimages = function(){
	
		var background = new Image();
		background.src = "../Images/hauntedHouseWithoutWindows.png";

		var _zombieSprite = new Image();
		_zombieSprite.src = "../Images/zombie_sprite.png";

		var plank = new Image();
		plank.src = "../Images/plank_right.png";

		var crossHairs = new Image();
		crossHairs.src = "../Images/Crosshairs.png";

		var bulletimg = new Image();
		bulletimg.src = "../Images/bullet.png";

		var bigBulletIcon = new Image();
		bigBulletIcon.src = "../Images/bigBulletIcon.jpg";

		var bulletSpeedIncrease = new Image();
		bulletSpeedIncrease.src = "../Images/bulletSpeedIncreaseIcon.jpg";

		var healthIcon = new Image();
		healthIcon.src = "../Images/healthIcon.png";

		var piercingBulletIcon = new Image();
		piercingBulletIcon.src = "../Images/piercingBulletIcon.jpg";

		var speedIcon = new Image();
		speedIcon.src = "../Images/speedIcon.jpg";

		var playerImage = new Image();
		playerImage.src = "../Images/player.png";

		var otherPlayer = new Image();
		otherPlayer.src = "../Images/otherplayer.png";

		return{
			background:background,
			_zombieSprite:_zombieSprite,
			plank:plank,
			crossHairs:crossHairs,
			repair:repair,
			bulletimg:bulletimg,
			bigBulletIcon:bigBulletIcon,
			bulletSpeedIncrease:bulletSpeedIncrease,
			healthIcon:healthIcon,
			piercingBulletIcon:piercingBulletIcon,
			speedIcon:speedIcon,
			playerImage:playerImage,
			otherPlayer:otherPlayer
		}
};

/*

If the images still cause an issue with the page, by them not loading -although they should as the javascript should be sequentially- then the images could be 
placed in a series of *.onload = function(){ *.onload = function(){ and then the rest of the code could be placed here. } }

*/