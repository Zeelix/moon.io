
// IMPORTS
//import { rocket_modelData, rocket_modelIndexData_1, rocket_modelIndexData_2, rocket_modelIndexData_3 } from './assets.js';
//import { star_modelData_1, star_modelData_2, star_modelIndexData } from './assets.js';

// HTML elements
const html_fps = document.querySelector("#html_fps");
const html_canvas = document.querySelector('#html_canvas');

// GLOBALS
var g_gl;
var g_frame_time = {
	counter: 0,
	timer_last: new Date(),
	fps: 0
};
var g_user_held_keys = {}

var g_moon_local = {
	pos: vec3.fromValues(0.0, 0.0, 0.0)
};

var g_player_actor = {
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir: vec3.fromValues(0.0, 1.0, 0.0)
};

var g_player_camera = {
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir: vec3.fromValues(0.0, 1.0, 0.0),
	right: vec3.fromValues(1.0, 0.0, 0.0),
	up: vec3.fromValues(0.0, 0.0, 1.0),
	actor_follow_distance: 5.0,
	actor_follow_height: 5.0,
	actor_follow_theta: 0.0
};

window.requestAnimFrame = ( function() {
    return  window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame ||  
            window.mozRequestAnimationFrame || 
            window.oRequestAnimationFrame || 
            window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  } ) (); 

function CB_Key_Pressed(event)
{
	if(event.repeat) return;
	g_user_held_keys[event.key] = true;
}

function CB_Key_Released(event)
{
	if(event.repeat) return;
	g_user_held_keys[event.key] = false;
}

function Init() 
{
    g_gl = html_canvas.getContext('webgl');

    if (!g_gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
	
	document.addEventListener('keydown', CB_Key_Pressed);
	document.addEventListener('keyup', CB_Key_Released);
}

function Render_Loop()
{
  // Frame_Time
  const timer_current = new Date();
  const delta_t = (timer_current.getTime() - g_frame_time.timer_last.getTime()) / 1000.0;
  g_frame_time.timer_last = timer_current;
  g_frame_time.fps = (1 / delta_t).toFixed(1);
  if(g_frame_time.counter % 10 == 0)
	html_fps.textContent = g_frame_time.fps;
  g_frame_time.counter++;
  
  requestAnimFrame(Render_Loop);
  Game_Update_And_Render(delta_t); 
}

function Game_Update_And_Render(t_delta_t) 
{	
	if(g_user_held_keys['w'])
	{
		console.log('W');
	}
	
	if(g_user_held_keys['a'])
	{
		console.log('A');
	}

	if(g_user_held_keys['s'])
	{
		console.log('S');
	}
	
	if(g_user_held_keys['d'])
	{
		console.log('D');
	}
}

Init();
Render_Loop();