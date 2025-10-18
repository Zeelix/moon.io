
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
var g_frame_time = {
	counter = 30,
	timer_last = new Date(),
	timer_current = new Date(),
	delta_t,
	fps
};

const html_fps = document.querySelector("#html_fps");

function Render_Loop(){
  g_frame_time.timer_current = new Date();
  g_frame_time.delta_time = (g_frame_time.timer_current.getTime() - g_frame_time.timer_last.getTime()) / 1000.0;
  g_frame_time.timer_last = g_frame_time.timer_current;
  g_frame_time.fps = 1 / g_frame_time.delta_t;
  if(g_frame_time.counter % 10 == 0)
	html_fps.textContent = fps.toFixed(1);

  g_frame_time.counter++;
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
