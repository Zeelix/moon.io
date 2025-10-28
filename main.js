const html_fps = document.querySelector("#html_fps");
const html_canvas = document.querySelector('#html_canvas');

// GLOBALS
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
		uniform_sampler_diffuse: -1,
		vbo: -1,
		ebo: -1,
		
		vertex_count: 0,
		element_count: 0,
		tex_diffuse: -1,
	}
};
var g_gl_ext = {
	WEBGL_multi_draw: 0
};
const g_load = {
	texture_png_count: 1,
	texture_png_downloaded: 0,
	texture_png_loaded: 0,
	
	program_js_count: 1,
	program_js_downloaded: 0,
	program_js_compiled: 0,
	
	complete: false
};
const g_assets = {
	static_mesh_js_1: null,
	shaders_js_1: null,
	diffuse_png_1: null
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
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	radius: 5.0,
	rotation_mat4: mat4.create(),
	rotation_quat: quat.create()
};
var g_space = {
	light_theta_current: 0.0,
	light_theta_speed: 0.0 // 0.4
}
var g_player_actor = {
	pos: vec2.fromValues(0.0, 0.0),
	dir_u: vec3.fromValues(0.0, 0.0, -1.0),
	dir_s: vec3.fromValues(0.0, 0.0, -0.5),
	speed: 0.5
};
var g_player_camera = {	
	global_up_u: vec3.fromValues(0.0, 1.0, 0.0),
	actor_follow_distance: 5.0,
	actor_follow_height: 0.0, // 0.2
	actor_follow_theta: 0.0,
	actor_focal_height: 0.0,
	zoom_sensitivity: 0.002,
	zoom_max: 20.0,
	zoom_min: 0.5,
	actor_follow_height_max: 1.0,
	actor_follow_height_min: 0.0,
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

// Functions
const Clamp = (t_value, t_min, t_max) => 
{
  return Math.min(Math.max(t_value, t_min), t_max);
};
function Timeout(t_ms, t_message = 'Operation timed out') 
{
  return new Promise((_, reject) => { setTimeout(() => { reject(new Error(t_message)); }, t_ms); });
}
async function Async_With_Timeout(t_func, t_ms)
{
  try { const result = await Promise.race([ t_func(), Timeout(t_ms) ]); return result; } 
  catch (error) { throw error; }
}
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
function CB_Mouse_Wheel(event)
{
	g_player_camera.actor_follow_distance += event.deltaY * g_player_camera.zoom_sensitivity;
	g_player_camera.actor_follow_distance = Clamp(g_player_camera.actor_follow_distance, g_player_camera.zoom_min, g_player_camera.zoom_max);
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
const Check_Game_Is_Loaded = () => 
{
	g_load.complete = 
	(g_load.texture_png_loaded == g_load.texture_png_count) &&
	(g_load.program_js_compiled == g_load.program_js_count);
};
function Load() 
{
	console.log('Load Start');
	
	// Callbacks
	document.addEventListener('keydown', CB_Key_Pressed);
	document.addEventListener('keyup', CB_Key_Released);
	document.addEventListener('wheel', CB_Mouse_Wheel);
	html_canvas.addEventListener('mousemove', CB_Mouse_Move);
	html_canvas.addEventListener('click', CB_Mouse_Click);
	
	// GL Render-Context
    g_gl = html_canvas.getContext('webgl');
    if (!g_gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
	const extensions = g_gl.getSupportedExtensions();
	if (extensions && extensions.length > 0) 
	{
		console.log("Supported WebGL 2 Extensions:");
		extensions.forEach((extension) => { console.log(`- ${extension}`); } );
		console.log("");
	} 
	else 
	{
		console.log("No WebGL 2 extensions are supported.");
	}
	g_gl_ext.WEBGL_multi_draw = g_gl.getExtension("WEBGL_multi_draw");
	console.log("WEBGL_multi_draw: ", g_gl_ext.WEBGL_multi_draw);
	
	g_gl.clearColor(0.0, 0.0, 0.0, 0.0);
    g_gl.clearDepth(1.0);
    g_gl.enable(g_gl.DEPTH_TEST);
    g_gl.depthFunc(g_gl.LEQUAL);
	g_gl.enable(g_gl.CULL_FACE);
	g_gl.cullFace(g_gl.BACK);
	
	g_load.static_mesh_js_downloaded = 0;
	g_load.texture_png_downloaded = 0;
	g_load.shader_js_downloaded = 0;
	
	g_load.static_mesh_js_loaded = 0;
	g_load.texture_png_loaded = 0;
	g_load.shader_js_compiled = 0;
	
	// Load Textures Async
	g_assets.diffuse_png_1 = new Image();
	g_assets.diffuse_png_1.onload = () => 
	{
		console.log("Downloaded diffuse_1.png");
		g_load.texture_png_downloaded++;
		
		g_gpu.static_mesh.tex_diffuse = g_gl.createTexture();
		g_gl.bindTexture(g_gl.TEXTURE_2D, g_gpu.static_mesh.tex_diffuse);
		g_gl.pixelStorei(g_gl.UNPACK_FLIP_Y_WEBGL, true);
		g_gl.texImage2D(g_gl.TEXTURE_2D, 0, g_gl.RGBA, g_gl.RGBA, g_gl.UNSIGNED_BYTE, g_assets.diffuse_png_1);
		g_gl.generateMipmap(g_gl.TEXTURE_2D);
		g_gl.activeTexture(g_gl.TEXTURE0);
		g_gl.bindTexture(g_gl.TEXTURE_2D, g_gpu.static_mesh.tex_diffuse);
		
		console.log("Loaded diffuse_1.png");
		g_load.texture_png_loaded++;
		
		Check_Game_Is_Loaded();
	};
	g_assets.diffuse_png_1.src = 'diffuse_1.png';
	
	// Load Assets Async
	const shaders_js_1_promise = import('./static_mesh_1.js');
	shaders_js_1_promise.then(module => 
	{
		console.log('Downloaded static_mesh_1.js');
		g_load.program_js_downloaded++;
		
		// Compile Shaders
		const sm_vs = Load_Shader(g_gl.VERTEX_SHADER, module.vs_code);
		const sm_fs = Load_Shader(g_gl.FRAGMENT_SHADER, module.fs_code);
		g_gpu.static_mesh.program_id = g_gl.createProgram();
		g_gl.attachShader(g_gpu.static_mesh.program_id, sm_vs);
		g_gl.attachShader(g_gpu.static_mesh.program_id, sm_fs);
		g_gl.linkProgram(g_gpu.static_mesh.program_id);
		if (!g_gl.getProgramParameter(g_gpu.static_mesh.program_id, g_gl.LINK_STATUS)) 
		{
			alert('Unable to initialize the shader program: ' + g_gl.getProgramInfoLog(g_gpu.static_mesh.program_id));
			return null;
		}
		g_gl.useProgram(g_gpu.static_mesh.program_id);
		
		// Buffers
		g_gpu.static_mesh.vbo = g_gl.createBuffer();
		g_gpu.static_mesh.ebo = g_gl.createBuffer();
		g_gl.bindBuffer(g_gl.ARRAY_BUFFER, g_gpu.static_mesh.vbo);
		g_gl.bindBuffer(g_gl.ELEMENT_ARRAY_BUFFER, g_gpu.static_mesh.ebo);
		
		// Attributes
		const sm_vbo_stride = 8 * 4; // 8 floats
		
		g_gpu.static_mesh.attrib_pos = g_gl.getAttribLocation(g_gpu.static_mesh.program_id, 'in_pos');
		g_gpu.static_mesh.attrib_tex = g_gl.getAttribLocation(g_gpu.static_mesh.program_id, 'in_tex');
		g_gpu.static_mesh.attrib_nrm = g_gl.getAttribLocation(g_gpu.static_mesh.program_id, 'in_nrm');
		g_gl.vertexAttribPointer(g_gpu.static_mesh.attrib_pos, 3, g_gl.FLOAT, false, sm_vbo_stride, 0);
		g_gl.vertexAttribPointer(g_gpu.static_mesh.attrib_tex, 2, g_gl.FLOAT, false, sm_vbo_stride, 3*4);
		g_gl.vertexAttribPointer(g_gpu.static_mesh.attrib_nrm, 3, g_gl.FLOAT, false, sm_vbo_stride, 5*4);
		g_gl.enableVertexAttribArray(g_gpu.static_mesh.attrib_pos);
		g_gl.enableVertexAttribArray(g_gpu.static_mesh.attrib_tex);
		g_gl.enableVertexAttribArray(g_gpu.static_mesh.attrib_nrm);
		
		// Uniforms
		g_gpu.static_mesh.uniform_mvp = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_mvp');
		g_gpu.static_mesh.uniform_mvi = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_mvi');
		g_gpu.static_mesh.uniform_toon_num_bands = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_toon_num_bands');
		g_gpu.static_mesh.uniform_toon_stride = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_toon_stride');
		g_gpu.static_mesh.uniform_object_color = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_object_color');
		g_gpu.static_mesh.uniform_light_dir = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_light_dir');
		g_gpu.static_mesh.uniform_light_amb = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_light_amb');
		g_gpu.static_mesh.uniform_sampler_diffuse = g_gl.getUniformLocation(g_gpu.static_mesh.program_id, 'u_diffuse');
		
		g_gl.uniform3f(g_gpu.static_mesh.uniform_object_color, 0.0, 0.635, 1.0);
		g_gl.uniform1f(g_gpu.static_mesh.uniform_toon_num_bands, 4.0);
		g_gl.uniform1f(g_gpu.static_mesh.uniform_toon_stride, 0.10); 
		g_gl.uniform1f(g_gpu.static_mesh.uniform_light_amb, 0.15);
		g_gl.uniform1i(g_gpu.static_mesh.uniform_sampler_diffuse, 0);
		
		if(!g_gl_ext.WEBGL_multi_draw)
		{
			// Perform index compression on client's PC (Slow loading), extend indices from uint16 to uint32 if index-count is out-of-range
			alert('WEBGL_multi_draw is not supported on this browser, need code for index asset compression (which will be added!)');
			return null;
		}
		
		g_gpu.static_mesh.vertex_count = module.e_pooled_vertices.length;
		g_gpu.static_mesh.element_count = module.e_pooled_indices.length;
		g_gl.bufferData(g_gl.ARRAY_BUFFER, module.e_pooled_vertices, g_gl.STATIC_DRAW);
		g_gl.bufferData(g_gl.ELEMENT_ARRAY_BUFFER, module.e_pooled_indices, g_gl.STATIC_DRAW);
		
		console.log('Compiled static_mesh_1.js');
		g_load.program_js_compiled++;
		
		g_assets.static_mesh_js_1 = module;
		Check_Game_Is_Loaded();
		
    }).catch((error) => 
	{
		console.log('uncaught exception thrown: ', error);
	});
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
  
  if(g_load.complete)
  {
	  Game_Update_And_Render_SceneGame(delta_t); 
  }
  else
  {
	  Game_Update_And_Render_SceneLoad(delta_t); 
  }
  
  g_user_mouse.x_movement_px = 0.0;
  g_user_mouse.y_movement_px = 0.0;
}
function Game_Update_And_Render_SceneLoad(t_delta_t)
{
	
}

function Game_Update_And_Render_SceneGame(t_delta_t) 
{
	// Update World
	var space_light_dir = vec3.create();
	vec3.rotateY(space_light_dir, g_xp_vec3, g_zero_vec3, g_space.light_theta_current);
	g_space.light_theta_current += t_delta_t * g_space.light_theta_speed;
	
	// Update Camera
	var fov_r = (Math.PI/180.0) * g_player_camera.fov_d;
	var fov_r_half = fov_r / 2.0;
	
	var dtheta = (g_user_mouse.x_movement_n * fov_r_half * g_player_camera.mouse_sensitivity_x);
	g_player_camera.actor_follow_theta = g_player_camera.actor_follow_theta - dtheta;
	if(g_player_camera.actor_follow_theta < 0.0)
	{
		g_player_camera.actor_follow_theta += g_2pi;
	}
	if(g_player_camera.actor_follow_theta > g_2pi)
	{
		g_player_camera.actor_follow_theta -= g_2pi;
	}
	
	const proj_aspect = g_gl.canvas.clientWidth / g_gl.canvas.clientHeight;
	const sin_dist = Math.sin(g_player_camera.actor_follow_theta) * g_player_camera.actor_follow_distance;
	const cos_dist = Math.cos(g_player_camera.actor_follow_theta) * g_player_camera.actor_follow_distance;
	
	g_player_camera.pos = vec3.fromValues(0.0, 0.0, g_player_camera.actor_follow_distance);
	//g_player_camera.pos = vec3.fromValues(sin_dist, g_player_camera.actor_follow_height, cos_dist);
	mat4.perspective(g_player_camera.proj, fov_r, proj_aspect, g_player_camera.near, g_player_camera.far);
	mat4.lookAt(g_player_camera.view, g_player_camera.pos, g_zero_vec3, g_player_camera.global_up_u);
	mat4.mul(g_player_camera.view_proj, g_player_camera.proj, g_player_camera.view);
	
	//var camera_dir_flat_s_inv = vec3.create();
	//var actor_follow_height_vec3 = vec3.fromValues(0, g_player_camera.actor_follow_height, 0);
	//vec3.rotateY(g_player_camera.dir_flat_u, g_zn_vec3, g_zero_vec3, g_player_camera.actor_follow_theta);
	//vec3.scale(camera_dir_flat_s_inv, g_player_camera.dir_flat_u, -g_player_camera.actor_follow_distance);
	//vec3.add(g_player_camera.pos, camera_dir_flat_s_inv, actor_follow_height_vec3);
	
	var camera_dir_u_inv = vec3.create();
	vec3.sub(g_player_camera.dir_u, g_zero_vec3, g_player_camera.pos);
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
		vec2.add(actor_proj_vec2, actor_proj_vec2, g_yn_vec2);
	}
	if(g_user_held_keys['d'])
	{
		actor_is_moving = true;
		vec2.add(actor_proj_vec2, actor_proj_vec2, g_xp_vec2);
	}
	if(g_user_held_keys['a'])
	{
		actor_is_moving = true;
		vec2.add(actor_proj_vec2, actor_proj_vec2, g_xn_vec2);
	}
	
	if(actor_is_moving)
	{
		vec3.normalize(actor_proj_vec2, actor_proj_vec2);
		//vec2.rotate(actor_proj_vec2, actor_proj_vec2, g_zero_vec2, g_player_camera.actor_follow_theta);
		vec2.scale(actor_proj_vec2, actor_proj_vec2, g_player_actor.speed * t_delta_t);
		// TODO(ED1): replace g_player_actor.pos from 3D representation to 2D surface, wrapped around the moon (uv)
		//vec3.scale(g_player_actor.dir_u, g_player_camera.right_u, actor_proj_vec2[0]);
		//vec3.scaleAndAdd(g_player_actor.dir_u, g_player_actor.dir_u, g_player_camera.dir_flat_u, actor_proj_vec2[1]);
		//vec3.normalize(g_player_actor.dir_u, g_player_actor.dir_u);
		//vec3.scale(g_player_actor.dir_s, g_player_actor.dir_u, g_player_actor.speed * t_delta_t);
		//vec3.add(g_player_actor.pos, g_player_actor.pos, g_player_actor.dir_s);
		vec2.add(g_player_actor.pos, g_player_actor.pos, actor_proj_vec2);
	}
	
	// Render
	g_gl.clear(g_gl.COLOR_BUFFER_BIT| g_gl.DEPTH_BUFFER_BIT);
	
	var moon_model = mat4.create();
	var moon_scale = vec3.fromValues(1, 1, 1);
	var moon_translate = vec3.fromValues(0, -1, 0);
	//mat4.translate(moon_model, moon_model, moon_translate);
	
	let temp_quat = quat.create();
	quat.setAxisAngle(temp_quat, [1,0,0], g_player_actor.pos[1]);
	quat.multiply(g_moon_local.rotation_quat, temp_quat, g_moon_local.rotation_quat);
	
	quat.setAxisAngle(temp_quat, [0,1,0], dtheta);
	quat.multiply(g_moon_local.rotation_quat, temp_quat, g_moon_local.rotation_quat);
	
	quat.setAxisAngle(temp_quat, [0,0,1], g_player_actor.pos[0]);
	quat.multiply(g_moon_local.rotation_quat, temp_quat, g_moon_local.rotation_quat);
	
	//mat4.rotate(g_moon_local.rotation, g_moon_local.rotation, dtheta, g_yp_vec3);
	if(vec2.len(g_player_actor.pos) != 0)
	{
		
		//mat4.rotate(g_moon_local.rotation, g_moon_local.rotation, g_player_actor.pos[0], g_zp_vec3);
		//mat4.rotate(g_moon_local.rotation, g_moon_local.rotation, g_player_actor.pos[1], g_xp_vec3);
		g_player_actor.pos[0] = 0.0;
		g_player_actor.pos[1] = 0.0;
	}
	//mat4.mul(moon_model, rotation, g_player_actor.pos[1]);
	//moon_model = mat4.copy(g_moon_local.rotation);
	//mat4.scale(moon_model, moon_model, moon_scale);
	
	mat4.fromQuat(g_moon_local.rotation_mat4, g_moon_local.rotation_quat);
	
	var moon_mvp = mat4.create();
	var moon_mv = mat4.create();
	mat4.mul(moon_mvp, g_player_camera.view_proj, g_moon_local.rotation_mat4); // usually model 
	mat4.mul(moon_mv, g_player_camera.view, g_moon_local.rotation_mat4); // usually model
	
	g_gl.useProgram(g_gpu.static_mesh.program_id);
	g_gl.bindBuffer(g_gl.ARRAY_BUFFER, g_gpu.static_mesh.vbo);
	g_gl.bindBuffer(g_gl.ELEMENT_ARRAY_BUFFER, g_gpu.static_mesh.ebo);
	
	const light_vi = mat3.create();
	const moon_mvi = mat3.create();
	mat3.normalFromMat4(light_vi, g_player_camera.view);
	mat3.normalFromMat4(moon_mvi, moon_mv);
	
	const local_light_dir = vec3.clone(space_light_dir);
	vec3.normalize(local_light_dir, local_light_dir);
	vec3.transformMat3(local_light_dir, local_light_dir, light_vi);
	
	g_gl.uniformMatrix4fv(g_gpu.static_mesh.uniform_mvp, false, moon_mvp);
    g_gl.uniformMatrix3fv(g_gpu.static_mesh.uniform_mvi, false, moon_mvi);
	g_gl.uniform3fv(g_gpu.static_mesh.uniform_light_dir, local_light_dir);
	
	// Draw cube
	g_gl.drawElements(g_gl.TRIANGLES, 36, g_gl.UNSIGNED_SHORT, 0);
	//g_gl.drawElements(g_gl.TRIANGLES, g_assets.static_mesh_js_1.e_pooled_index_counts[1], g_gl.UNSIGNED_SHORT, g_assets.static_mesh_js_1.e_pooled_index_offsets[1]);
}

Load();
Render_Loop();