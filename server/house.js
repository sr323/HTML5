/*
*@author samuel richards
*@candidate number: 77513
*
* Description: 
*/

var house = function(){

	var _window = function(){
		var plank1 = true;
		var plank2 = true;

		function _break(){
			console.log("_break called " + plank1 + " " + plank2);
			if(plank1){
				plank1 = false;
			}
			else{
				plank2 = false;
			}
		}

		return{
			plank1:plank1,
			plank2:plank2,
			_break:_break
		}
	};

	var window1 = new _window();
	var window2 = new _window();
	var window3 = new _window();

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

exports.house = house;