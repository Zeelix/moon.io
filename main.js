
//import { rocket_modelData, rocket_modelIndexData_1, rocket_modelIndexData_2, rocket_modelIndexData_3 } from './assets.js';
//import { star_modelData_1, star_modelData_2, star_modelIndexData } from './assets.js';

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

var g_gl;
var g_frame_counter = 30;
var g_timestamp_last = new Date();
var g_timestamp_current;

function Render_Loop(){
  g_timestamp_current = new Date();
  const delta_time = (g_timestamp_current.getTime() - g_timestamp_last.getTime()) / 1000.0;
  g_timestamp_last = g_timestamp_current;
	
  g_frame_counter++;
  requestAnimFrame( Render_Loop );
  Render(); 
}

function Init() {
	
}

function Render() {
	
}

function Main() {
    const canvas = document.querySelector('#glcanvas');
    g_gl = canvas.getContext('webgl');

    if (!g_gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

	Init();
    Render_Loop();
}

Main();
