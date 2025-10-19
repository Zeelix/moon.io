
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
var g_user_mouse = {
	x_window_px: 0,
	y_window_py: 0,
	x_window_n: 0.0,
	y_window_n: 0.0,
	x_last_window_px: 0,
	y_last_window_py: 0,
	x_last_window_n: 0.0,
	y_last_window_n: 0.0
}

var g_moon_local = {
	pos: vec3.fromValues(0.0, 0.0, 0.0)
};

var g_player_actor = {
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir_s: vec3.fromValues(0.0, 0.0, -1.0),
	dir_u: vec3.fromValues(0.0, 0.0, -0.1),
	speed: 0.1
};

var g_player_camera = {	
	global_up_u: vec3.fromValues(0.0, 0.0, 1.0),
	actor_follow_distance: 5.0,
	actor_follow_height: 5.0,
	actor_follow_theta: 0.0,
	
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir_u: vec3.fromValues(0.0, 1.0, 0.0),
	dir_flat_u: vec3.fromValues(0.0, 1.0, 0.0),
	right_u: vec3.fromValues(1.0, 0.0, 0.0),
	left_u: vec3.fromValues(-1.0, 0.0, 0.0),
	local_up_u: vec3.fromValues(0.0, 0.0, 1.0)
};

const g_xp_vec3 = vec3.fromValues(1.0, 0.0, 0.0);
const g_xn_vec3 = vec3.fromValues(-1.0, 0.0, 0.0);
const g_yp_vec3 = vec3.fromValues(0.0, 1.0, 0.0);
const g_yn_vec3 = vec3.fromValues(0.0, -1.0, 0.0);
const g_zp_vec3 = vec3.fromValues(0.0, 0.0, 1.0);
const g_zn_vec3 = vec3.fromValues(0.0, 0.0, -1.0);
const g_zero_vec3 = vec3.fromValues(0.0, 0.0, 0.0);

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

function CB_Mouse_Move(event)
{
	g_user_mouse.x_window_px = event.offsetX;
	g_user_mouse.y_window_px = event.offsetY;
	g_user_mouse.x_window_n = g_user_mouse.x_window_px / html_canvas.clientWidth;
	g_user_mouse.y_window_n = g_user_mouse.y_window_px / html_canvas.clientHeight;
}

function CB_Mouse_Click(event)
{
	await html_canvas.requestPointerLock();
}

function Init() 
{
	html_canvas.addEventListener('keydown', CB_Key_Pressed);
	html_canvas.addEventListener('keyup', CB_Key_Released);
	html_canvas.addEventListener('mousemove', CB_Mouse_Move);
	html_canvas.addEventListener('click', CB_Mouse_Click);
	
    g_gl = html_canvas.getContext('webgl');

    if (!g_gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
	
	g_gl.clearColor(0.0, 0.0, 0.0, 0.0);
    g_gl.clearDepth(1.0);
    g_gl.enable(g_gl.DEPTH_TEST);
    g_gl.depthFunc(g_gl.LEQUAL);
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
	g_gl.clear(g_gl.COLOR_BUFFER_BIT| g_gl.DEPTH_BUFFER_BIT);
	
	var mouse_dx_n = g_user_mouse.x_window_n - g_user_mouse.x_last_window_n;
	var mouse_dy_n = g_user_mouse.y_window_n - g_user_mouse.y_last_window_n;
	
	g_user_mouse.x_last_window_px = g_user_mouse.x_window_px;
	g_user_mouse.y_last_window_px = g_user_mouse.y_window_px;
	g_user_mouse.x_last_window_n = g_user_mouse.x_window_n;
	g_user_mouse.y_last_window_n = g_user_mouse.y_window_n;
}

Init();
Render_Loop();