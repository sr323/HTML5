/*Resize the canvas*/
/*X is first - Width.*/
/*Y is height. The second parameter.*/
function resize(x, y){
	var canvas = document.getElementById("gameCanvas");
	var canvasDiv = document.getElementById("gameCanvasDiv");
	canvas.style.width = x + "px";
	canvas.style.height = y + "px";
	canvasDiv.style.width = x + "px";
	canvasDiv.style.height = y + "px";
	canvas.width = 300;
	canvas.width = 400;
	canvas.height = 300;
}

/* Code from http://paulrouget.com/e/ctxfs/ */
/* It didn't want to work any other way..-.- */
/* For some reason has to be a html element. */
function fullScreen(){
	document.getElementById("gameCanvasDiv").requestFullScreen();
}

HTMLElement.prototype.requestFullScreen = 
	HTMLElement.prototype.requestFullScreen ||
	HTMLElement.prototype.webkitRequestFullScreen ||
	HTMLElement.prototype.mozRequestFullScreen ||
	HTMLElement.prototype.oRequestFullScreen ||
	HTMLElement.prototype.msRequestFullScreen;