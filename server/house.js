/*
*@author samuel richards
*@candidate number: 77513
*
* Description: the house class is used to store information about the games environment(it's current window information), it stores
if planks have been destroyed or not, and this information is passed and used by the client, so when they join the current game, 
they join the same environment as all the other players.
*/

//The house function, is used as a class.
//@return the 3 window objects, the break and fix plank methods, all for external use.
var house = function(){
	//Another function used as a class for the windows, each window stores 2 plank objects.
	//@return the 2 plank variables and the break function, all for external use
	var _window = function(){
		//planks are true or false depending on breakages.
		var plank1 = true;
		var plank2 = true;
		//function allows for a window to recieve a quick breakage
		//plank1 should always be broken before plank2
		function _break(){
			console.log("_break called " + plank1 + " " + plank2);
			if(plank1){
				plank1 = false;
			}
			else{
				plank2 = false;
			}
		}
		//returns variables and functions for outside use.
		return{
			plank1:plank1,
			plank2:plank2,
			_break:_break
		}
	};
	//creates 3 instances of the _window function.
	var window1 = new _window();
	var window2 = new _window();
	var window3 = new _window();
	//a function to break a specific plank.
	//@param plank the plank number to break
	function breakPlank(plank){
		switch(plank){
			case 0:
			//	console.log("Window 1 has broken a plank");
				window1.plank1 = false;
			break;
			case 1:
			//	console.log("Window 1 has broken a plank");
				window1.plank2 = false;
			break;
			case 2:
			//	console.log("Window 2 has broken a plank");
				window2.plank1 = false;
			break;
			case 3:
			//	console.log("Window 2 has broken a plank");
				window2.plank2 = false;
			break;
			case 4:
			//	console.log("Window 3 has broken a plank");
				window3.plank1 = false;
			break;
			case 5:
			//	console.log("Window 3 has broken a plank");
				window3.plank2 = false;
			break;
		}
	};

	//a function to fix a specific plank
	//@param plank the plank number to fix
	function fixPlank(plank) {
		switch(plank){
			case 0:
			//	console.log("Window 1 has fixed a plank");
				window1.plank1 = true;
			break;
			case 1:
			//	console.log("Window 1 has fixed a plank");
				window1.plank2 = true;
			break;
			case 2:
			//	console.log("Window 2 has fixed a plank");
				window2.plank1 = true;
			break;
			case 3:
			//	console.log("Window 2 has fixed a plank");
				window2.plank2 = true;
			break;
			case 4:
			//	console.log("Window 3 has fixed a plank");
				window3.plank1 = true;
			break;
			case 5:
			//	console.log("Window 3 has fixed a plank");
				window3.plank2 = true;
			break;
		}
	};

	return{
		window1:window1,
		window2:window2,
		window3:window3,
		breakPlank:breakPlank,
		fixPlank:fixPlank
	}

};

//Exports the file for use in the server.js JavaScript file
exports.house = house;