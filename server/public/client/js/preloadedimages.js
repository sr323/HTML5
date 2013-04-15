/*
*@author samuel richards
*@candidate number: 77513
*
* Description: JavaScript passes all required files automatically when using Node.JS and Express. Creating this file that
loads all images at the beginning of the game initialisation insures all images are passed to the client before they start the game.
*/
//function acts as a class
var preloadedimages = function(){
		//creates and loads the background image
		var background = new Image();
		background.src = "../Images/hauntedHouseWithoutWindows.png";
		//creates and loads the zombie sprite image
		var _zombieSprite = new Image();
		_zombieSprite.src = "../Images/zombie_sprite.png";
		//creates and loads the plank image
		var plank = new Image();
		plank.src = "../Images/plank_right.png";
		//creates and loads the crosshairs image
		var crossHairs = new Image();
		crossHairs.src = "../Images/Crosshairs.png";
		//creates and loads the bullet image image
		var bulletimg = new Image();
		bulletimg.src = "../Images/bullet.png";
		//creates and loads the bigger bullets pick up image
		var bigBulletIcon = new Image();
		bigBulletIcon.src = "../Images/bigBulletIcon.jpg";
		//creates and loads the player speed increase pick up image
		var bulletSpeedIncrease = new Image();
		bulletSpeedIncrease.src = "../Images/bulletSpeedIncreaseIcon.jpg";
		//creates and loads the health icon pick up image
		var healthIcon = new Image();
		healthIcon.src = "../Images/healthIcon.png";
		//creates and loads the piercing bullets pick up image
		var piercingBulletIcon = new Image();
		piercingBulletIcon.src = "../Images/piercingBulletIcon.jpg";
		//creates and loads the speed icon pick up image
		var speedIcon = new Image();
		speedIcon.src = "../Images/speedIcon.jpg";
		//creates and loads the player image
		var playerImage = new Image();
		playerImage.src = "../Images/player.png";
		//returns all the images loaded. So external classes may use them.
		return{
			background:background,
			_zombieSprite:_zombieSprite,
			plank:plank,
			crossHairs:crossHairs,
			bulletimg:bulletimg,
			bigBulletIcon:bigBulletIcon,
			bulletSpeedIncrease:bulletSpeedIncrease,
			healthIcon:healthIcon,
			piercingBulletIcon:piercingBulletIcon,
			speedIcon:speedIcon,
			playerImage:playerImage
		}
};
