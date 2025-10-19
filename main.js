
// IMPORTS
//import { rocket_modelData, rocket_modelIndexData_1, rocket_modelIndexData_2, rocket_modelIndexData_3 } from './assets.js';
//import { star_modelData_1, star_modelData_2, star_modelIndexData } from './assets.js';

// HTML elements
const html_fps = document.querySelector("#html_fps");
const html_canvas = document.querySelector('#html_canvas');

// GLOBALS
var g_gl;
var g_gpu = {
	static_mesh: {
		program_id: -1,
		attrib_pos: -1,
		attrib_tex: -1,
		attrib_nrm: -1,
		uniform_mvp: -1
	};
};

var g_frame_time = {
	counter: 0,
	timer_last: new Date(),
	fps: 0
};
var g_user_held_keys = {}
var g_user_mouse = {
	x_movement_px: 0,
	y_movement_px: 0,
	x_movement_n: 0.0,
	y_movement_n: 0.0
}

var g_moon_local = {
	pos: vec3.fromValues(0.0, 0.0, 0.0)
};

var g_player_actor = {
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir_u: vec3.fromValues(0.0, 0.0, -1.0),
	dir_s: vec3.fromValues(0.0, 0.0, -0.5),
	speed: 0.5
};

var g_player_camera = {	
	global_up_u: vec3.fromValues(0.0, 1.0, 0.0),
	actor_follow_distance: 10.0,
	actor_follow_height_vec3: vec3.fromValues(0.0, 5.0, 0.0),
	actor_follow_theta: 0.0,
	fov_d: 90.0,
	mouse_sensitivity_x: 2.0,
	mouse_sensitivity_y: 2.0,
	
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir_u: vec3.fromValues(0.0, 1.0, 0.0),
	dir_flat_u: vec3.fromValues(0.0, 1.0, 0.0),
	right_u: vec3.fromValues(1.0, 0.0, 0.0),
	local_up_u: vec3.fromValues(0.0, 0.0, 1.0)
};

const g_xp_vec2 = vec2.fromValues(1.0, 0.0);
const g_xn_vec2 = vec2.fromValues(-1.0, 0.0);
const g_yp_vec2 = vec2.fromValues(0.0, 1.0);
const g_yn_vec2 = vec2.fromValues(0.0, -1.0);
const g_zero_vec2 = vec2.fromValues(0.0, 0.0);

const g_xp_vec3 = vec3.fromValues(1.0, 0.0, 0.0);
const g_xn_vec3 = vec3.fromValues(-1.0, 0.0, 0.0);
const g_yp_vec3 = vec3.fromValues(0.0, 1.0, 0.0);
const g_yn_vec3 = vec3.fromValues(0.0, -1.0, 0.0);
const g_zp_vec3 = vec3.fromValues(0.0, 0.0, 1.0);
const g_zn_vec3 = vec3.fromValues(0.0, 0.0, -1.0);
const g_zero_vec3 = vec3.fromValues(0.0, 0.0, 0.0);

const g_2pi = Math.PI * 2.0;

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
	if (document.pointerLockElement === html_canvas) 
	{
		g_user_mouse.x_movement_px = g_user_mouse.x_movement_px + event.movementX;
		g_user_mouse.y_movement_px = g_user_mouse.y_movement_px + event.movementY;
	}
}

function CB_Mouse_Click(event)
{
	html_canvas.requestPointerLock();
}

function Init() 
{
	document.addEventListener('keydown', CB_Key_Pressed);
	document.addEventListener('keyup', CB_Key_Released);
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
  
  g_user_mouse.x_movement_n = ((2 * g_user_mouse.x_movement_px) / html_canvas.clientWidth);
  g_user_mouse.y_movement_n = ((2 * g_user_mouse.y_movement_px) / html_canvas.clientHeight);
  
  Game_Update_And_Render(delta_t); 
  
  g_user_mouse.x_movement_px = 0.0;
  g_user_mouse.y_movement_px = 0.0;
}

function Game_Update_And_Render(t_delta_t) 
{
	// Update Camera
	var fov_r_half = (Math.PI/360.0) * g_player_camera.fov_d;
	
	g_player_camera.actor_follow_theta = g_player_camera.actor_follow_theta - (g_user_mouse.x_movement_n * fov_r_half * g_player_camera.mouse_sensitivity_x);
	if(g_player_camera.actor_follow_theta < 0.0)
	{
		g_player_camera.actor_follow_theta += g_2pi;
	}
	if(g_player_camera.actor_follow_theta > g_2pi)
	{
		g_player_camera.actor_follow_theta -= g_2pi;
	}
	
	var camera_dir_flat_s_inv = vec3.create();
	vec3.rotateY(g_player_camera.dir_flat_u, g_zn_vec3, g_zero_vec3, g_player_camera.actor_follow_theta);
	vec3.scale(camera_dir_flat_s_inv, g_player_camera.dir_flat_u, -g_player_camera.actor_follow_distance);
	vec3.add(g_player_camera.pos, g_player_actor.pos, camera_dir_flat_s_inv);
	vec3.add(g_player_camera.pos, g_player_camera.pos, g_player_camera.actor_follow_height_vec3);
	
	var camera_dir_u_inv = vec3.create();
	vec3.sub(g_player_camera.dir_u, g_player_actor.pos, g_player_camera.pos);
	vec3.normalize(g_player_camera.dir_u, g_player_camera.dir_u);
	vec3.scale(camera_dir_u_inv, g_player_camera.dir_u, -1.0);
	vec3.cross(g_player_camera.right_u, g_player_camera.global_up_u, camera_dir_u_inv);
	vec3.normalize(g_player_camera.right_u, g_player_camera.right_u);
	vec3.cross(g_player_camera.local_up_u, camera_dir_u_inv, g_player_camera.right_u);
	
	// Update Actor
	var actor_is_moving = false;
	var actor_proj_vec2 = vec2.fromValues(0.0, 0.0);
	
	if(g_user_held_keys['w'])
	{
		actor_is_moving = true;
		vec2.add(actor_proj_vec2, actor_proj_vec2, g_yp_vec2);
	}
	if(g_user_held_keys['s'])
	{
		actor_is_moving = true;
		vec3.add(actor_proj_vec2, actor_proj_vec2, g_yn_vec2);
	}
	if(g_user_held_keys['d'])
	{
		actor_is_moving = true;
		vec3.add(actor_proj_vec2, actor_proj_vec2, g_xp_vec2);
	}
	if(g_user_held_keys['a'])
	{
		actor_is_moving = true;
		vec3.add(actor_proj_vec2, actor_proj_vec2, g_xn_vec2);
	}
	
	if(actor_is_moving)
	{
		vec3.scale(g_player_actor.dir_u, g_player_camera.right_u, actor_proj_vec2[0]);
		vec3.scaleAndAdd(g_player_actor.dir_u, g_player_actor.dir_u, g_player_camera.dir_flat_u, actor_proj_vec2[1]);
		vec3.normalize(g_player_actor.dir_u, g_player_actor.dir_u);
		vec3.scale(g_player_actor.dir_s, g_player_actor.dir_u, g_player_actor.speed * t_delta_t);
		vec3.add(g_player_actor.pos, g_player_actor.pos, g_player_actor.dir_s);
	}
	
	// Render
	g_gl.clear(g_gl.COLOR_BUFFER_BIT| g_gl.DEPTH_BUFFER_BIT);
	
	
}

Init();
Render_Loop();