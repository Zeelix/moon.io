// IMPORTS
import { e_sm_vs_code, e_sm_fs_code } from './shaders.js'
import { e_asset_sm_cube_vertices, e_asset_sm_cube_indices, e_asset_sm_moon_vertices, e_asset_sm_moon_indices } from './assets.js'

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
		uniform_mvp: -1,
		uniform_mvi: -1,
		uniform_toon_num_bands: -1,
		uniform_toon_stride: -1,
		uniform_object_color: -1,
		uniform_light_dir: -1,
		uniform_light_amb: -1,
		vbo: -1,
		ebo: -1,
		vertex_count: 0,
		element_count: 0
	}
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
var g_space = {
	light_theta_current: 0.0,
	light_theta_speed: 0.4
}
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
	near: 0.1,
	far: 100.0,
	mouse_sensitivity_x: 2.0,
	mouse_sensitivity_y: 2.0,
	
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	dir_u: vec3.fromValues(0.0, 1.0, 0.0),
	dir_flat_u: vec3.fromValues(0.0, 1.0, 0.0),
	right_u: vec3.fromValues(1.0, 0.0, 0.0),
	local_up_u: vec3.fromValues(0.0, 0.0, 1.0),
	proj: mat4.create(),
	view: mat4.create(),
	view_proj: mat4.create()
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
function Load_Shader(t_shader_type, t_shader_code)
{
    const shader = g_gl.createShader(t_shader_type);
    g_gl.shaderSource(shader, t_shader_code);
    g_gl.compileShader(shader);

    if (!g_gl.getShaderParameter(shader, g_gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + g_gl.getShaderInfoLog(shader));
        g_gl.deleteShader(shader);
        return null;
    }
    return shader;
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
	
	// Compile Static-Mesh (SM)
	const sm_vs = Load_Shader(g_gl.VERTEX_SHADER, e_sm_vs_code);
    const sm_fs = Load_Shader(g_gl.FRAGMENT_SHADER, e_sm_fs_code);
    g_gpu.static_mesh.program_id = g_gl.createProgram();
    g_gl.attachShader(g_gpu.static_mesh.program_id, sm_vs);
    g_gl.attachShader(g_gpu.static_mesh.program_id, sm_fs);
    g_gl.linkProgram(g_gpu.static_mesh.program_id);

    if (!g_gl.getProgramParameter(g_gpu.static_mesh.program_id, g_gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + g_gl.getProgramInfoLog(g_gpu.static_mesh.program_id));
        return null;
    }
	
	g_gpu.static_mesh.attrib_pos = g_gl.getAttribLocation(g_gpu.static_mesh.program_id, 'in_pos');
	//g_gpu.static_mesh.attrib_tex = g_gl.getAttribLocation(g_gpu.static_mesh.program_id, 'in_tex');
	g_gpu.static_mesh.attrib_nrm = g_gl.getAttribLocation(g_gpu.static_mesh.program_id, 'in_nrm');
	
	g_gpu.static_mesh.uniform_mvp = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_mvp');
	g_gpu.static_mesh.uniform_mvi = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_mvi');
	g_gpu.static_mesh.uniform_toon_num_bands = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_toon_num_bands');
	g_gpu.static_mesh.uniform_toon_stride = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_toon_stride');
	g_gpu.static_mesh.uniform_object_color = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_object_color');
	g_gpu.static_mesh.uniform_light_dir = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_light_dir');
	g_gpu.static_mesh.uniform_light_amb = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_light_amb');
	
	g_gl.useProgram(g_gpu.static_mesh.program_id);
	g_gpu.static_mesh.vbo = g_gl.createBuffer();
	g_gpu.static_mesh.ebo = g_gl.createBuffer();
	g_gl.bindBuffer(g_gl.ARRAY_BUFFER, g_gpu.static_mesh.vbo);
	g_gl.bindBuffer(g_gl.ELEMENT_ARRAY_BUFFER, g_gpu.static_mesh.ebo);
	
	const sm_vbo_stride = 4 * 8 // 8 floats of 4 bytes each
	g_gpu.static_mesh.vertex_count = e_asset_sm_moon_vertices.length;
	g_gpu.static_mesh.element_count = e_asset_sm_moon_indices.length;
	
	g_gl.vertexAttribPointer(g_gpu.static_mesh.attrib_pos, 3, g_gl.FLOAT, false, sm_vbo_stride, 0);
	//g_gl.vertexAttribPointer(g_gpu.static_mesh.attrib_tex, 2, g_gl.FLOAT, false, sm_vbo_stride, 3*4);
	g_gl.vertexAttribPointer(g_gpu.static_mesh.attrib_nrm, 3, g_gl.FLOAT, false, sm_vbo_stride, 5*4);
	g_gl.enableVertexAttribArray(g_gpu.static_mesh.attrib_pos);
	//g_gl.enableVertexAttribArray(g_gpu.static_mesh.attrib_tex);
	g_gl.enableVertexAttribArray(g_gpu.static_mesh.attrib_nrm);
	
	g_gl.bufferData(g_gl.ARRAY_BUFFER, e_asset_sm_moon_vertices, g_gl.STATIC_DRAW);
	g_gl.bufferData(g_gl.ELEMENT_ARRAY_BUFFER, e_asset_sm_moon_indices, g_gl.STATIC_DRAW);
	
	g_gl.uniform3f(g_gpu.static_mesh.uniform_object_color, 0.0, 0.635, 1.0);
	g_gl.uniform1f(g_gpu.static_mesh.uniform_toon_num_bands, 8.0);
	g_gl.uniform1f(g_gpu.static_mesh.uniform_toon_stride, 0.05); 
	g_gl.uniform1f(g_gpu.static_mesh.uniform_light_amb, 0.15); // .09
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
	// Update World
	var space_light_dir = vec3.create();
	vec3.rotateY(space_light_dir, g_xp_vec3, g_zero_vec3, g_space.light_theta_current);
	g_space.light_theta_current += t_delta_t * g_space.light_theta_speed;
	
	// Update Camera
	var fov_r = (Math.PI/180.0) * g_player_camera.fov_d;
	var fov_r_half = fov_r / 2.0;
	
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
	
    const proj_aspect = g_gl.canvas.clientWidth / g_gl.canvas.clientHeight;
	mat4.perspective(g_player_camera.proj, fov_r, proj_aspect, g_player_camera.near, g_player_camera.far);
	mat4.lookAt(g_player_camera.view, g_player_camera.pos, g_player_actor.pos, g_player_camera.global_up_u);
	mat4.mul(g_player_camera.view_proj, g_player_camera.proj, g_player_camera.view);
	
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
	
	const light_vi = mat3.create();
	const actor_mvi = mat3.create();
	mat3.normalFromMat4(light_vi, g_player_camera.view);
	mat3.normalFromMat4(actor_mvi, g_player_camera.view); // usually model-view
	
	const local_light_dir = vec3.clone(space_light_dir);
	vec3.normalize(local_light_dir, local_light_dir);
	vec3.transformMat3(local_light_dir, local_light_dir, light_vi);
	
	g_gl.useProgram(g_gpu.static_mesh.program_id);
	g_gl.bindBuffer(g_gl.ARRAY_BUFFER, g_gpu.static_mesh.vbo);
	g_gl.bindBuffer(g_gl.ELEMENT_ARRAY_BUFFER, g_gpu.static_mesh.ebo);
	
	g_gl.uniformMatrix4fv(g_gpu.static_mesh.uniform_mvp, false, g_player_camera.view_proj);
    g_gl.uniformMatrix3fv(g_gpu.static_mesh.uniform_mvi, false, actor_mvi);
	g_gl.uniform3fv(g_gpu.static_mesh.uniform_light_dir, local_light_dir);
	
	g_gl.drawElements(g_gl.TRIANGLES, g_gpu.static_mesh.element_count, g_gl.UNSIGNED_SHORT, 0);
}

Init();
Render_Loop();