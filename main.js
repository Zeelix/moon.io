
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
	counter: 0,
	timer_last: new Date(),
	fps: 0
};

const html_fps = document.querySelector("#html_fps");

function Render_Loop(){
  const timer_current = new Date();
  const delta_t = (timer_current.getTime() - g_frame_time.timer_last.getTime()) / 1000.0;
  
  g_frame_time.timer_last = timer_current;
  g_frame_time.fps = (1 / delta_t).toFixed(1);
  if(g_frame_time.counter % 10 == 0)
	html_fps.textContent = g_frame_time.fps;

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
