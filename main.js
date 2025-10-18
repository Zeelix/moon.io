
import { rocket_modelData, rocket_modelIndexData_1, rocket_modelIndexData_2, rocket_modelIndexData_3 } from './assets.js';
import { star_modelData_1, star_modelData_2, star_modelIndexData } from './assets.js';

var gl;
var timer = 30.0;

//  Render
window.requestAnimFrame = ( function() {
    return  window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame ||  
            window.mozRequestAnimationFrame || 
            window.oRequestAnimationFrame || 
            window.msRequestAnimationFrame ||
    
    // if none of the above, use non-native timeout method
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  } ) (); 
  
var then = new Date();
var now;

function renderLoop(){
  now = new Date();
  const deltaTime = (now.getTime() - then.getTime()) / 1000.0;
  then = now;
	
  timer++;
  requestAnimFrame( renderLoop );
  render(); 
}

function render() {
	
}

function main() {
    const canvas = document.querySelector('#glcanvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    renderLoop();
}

main();
