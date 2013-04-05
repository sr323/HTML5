window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/*REFERENCE*/
/*  http://paulirish.com/2011/requestanimationframe-for-smart-animating/

    Paul Irish from Google with his request animation frame for smart animating.

    Decodes a smart way to use the request animation frame along with the set timeout function to achieve a smooth 60fps animation.*/