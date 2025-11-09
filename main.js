const g_version = "0.0.1";

const html_fps = document.querySelector("#html_fps");
const html_fovd = document.querySelector("#html_fovd");
const html_pitch = document.querySelector("#html_pitch");
const html_zoom = document.querySelector("#html_zoom");
const html_version = document.querySelector("#html_version");
const html_canvas = document.querySelector('#html_canvas');

// GLOBALS
const g_xp_vec2 = vec2.fromValues(1.0,0.0);
const g_xn_vec2 = vec2.fromValues(-1.0,0.0);
const g_yp_vec2 = vec2.fromValues(0.0,1.0);
const g_yn_vec2 = vec2.fromValues(0.0,-1.0);
const g_zero_vec2 = vec2.fromValues(0.0,0.0);
const g_xp_vec3 = vec3.fromValues(1.0,0.0,0.0);
const g_xn_vec3 = vec3.fromValues(-1.0,0.0,0.0);
const g_yp_vec3 = vec3.fromValues(0.0,1.0,0.0);
const g_yn_vec3 = vec3.fromValues(0.0,-1.0,0.0);
const g_zp_vec3 = vec3.fromValues(0.0,0.0,1.0);
const g_zn_vec3 = vec3.fromValues(0.0,0.0,-1.0);
const g_zero_vec3 = vec3.fromValues(0.0,0.0,0.0);
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
var g_ico_collider = {
	face_surface_normals: [
		vec3.fromValues( 0.49111782, 0.79464776,-0.35684483),//7,11,12[19]
		vec3.fromValues( 0.49111782, 0.79464776, 0.35684483),//8,7,12[15]
		vec3.fromValues(-0.18758785, 0.79464764, 0.57736118),//9,8,12[16]
		vec3.fromValues(-0.60706390, 0.79465302,0.00000000),//10,9,12[17]
		vec3.fromValues(-0.18758785, 0.79464764,-0.57736118),//11,10,12[18]
		vec3.fromValues( 0.79464764, 0.18758785,-0.57736118),//4,11,7[14]
		vec3.fromValues( 0.98224740,-0.18759012, 0.00000000),//2,4,7[5]
		vec3.fromValues( 0.79464764, 0.18758785, 0.57736118),//2,7,8[10]
		vec3.fromValues( 0.30352073,-0.18758219, 0.93417776),//3,2,8[6]
		vec3.fromValues(-0.30352073, 0.18758219, 0.93417776),//3,8,9[11]
		vec3.fromValues(-0.79464764,-0.18758785, 0.57736118),//5,3,9[7]
		vec3.fromValues(-0.98224740, 0.18759012, 0.00000000),//5,9,10[12]
		vec3.fromValues(-0.79464764,-0.18758785,-0.57736118),//6,5,10[8]
		vec3.fromValues(-0.30352073, 0.18758219,-0.93417776),//6,10,11[13]
		vec3.fromValues( 0.30352073,-0.18758219,-0.93417776),//4,6,11[9]
		vec3.fromValues( 0.18758785,-0.79464764,-0.57736118),//1,6,4[4]
		vec3.fromValues( 0.60706390,-0.79465302, 0.00000000),//2,1,4[1]
		vec3.fromValues( 0.18758785,-0.79464764, 0.57736118),//1,2,3[0]
		vec3.fromValues(-0.49111782,-0.79464776, 0.35684483),//1,3,5[2]
		vec3.fromValues(-0.49111782,-0.79464776,-0.35684483) //1,5,6[3]
	],
	face_change_of_base_i: [
		vec3.fromValues( 1.11806798, 0.00000000, 0.36327024),//7,11,12[19]
		vec3.fromValues( 0.00000000, 0.00000000, 1.17550253),//8,7,12[15]
		vec3.fromValues(-1.11806222, 0.00000000, 0.36326836),//9,8,12[16]
		vec3.fromValues( 0.69091961, 0.00000000,-0.95101660),//10,9,12[17]
		vec3.fromValues( 0.50002492,-1.00004984,-0.36324839),//11,10,12[18]
		vec3.fromValues( 0.30902349,-0.61804697, 0.95111280),//4,11,7[14]
		vec3.fromValues( 0.50002492,-1.00004984, 0.36324839),//2,4,7[5]
		vec3.fromValues( 0.50002492,-1.00004984, 0.36324839),//2,7,8[10]
		vec3.fromValues(-0.80898084,-0.61806283, 0.58775126),//3,2,8[6]
		vec3.fromValues(-0.19101916,-1.00000515, 0.58775126),//3,8,9[11]
		vec3.fromValues(-0.80902116,-0.61809363,-0.58778056),//5,3,9[7]
		vec3.fromValues(-0.61804697,-1.00004201, 0.00000000),//5,9,10[12]
		vec3.fromValues( 0.30899624,-0.61799248,-0.95102895),//6,5,10[8]
		vec3.fromValues(-0.19101916,-1.00000515,-0.58775126),//6,10,11[13]
		vec3.fromValues( 1.00000000,-0.61806798, 0.00000000),//4,6,11[9]
		vec3.fromValues(-0.19101818,-1.00000000, 0.58774824),//1,6,4[4]
		vec3.fromValues( 0.69098950, 0.00000000, 0.95111280),//2,1,4[1]
		vec3.fromValues(-0.19101818,-1.00000000,-0.58774824),//1,2,3[0]
		vec3.fromValues( 0.50000000,-1.00000000,-0.36323028),//1,3,5[2]
		vec3.fromValues( 0.50000000,-1.00000000, 0.36323028) //1,5,6[3]
	],
	face_change_of_base_j: [
		vec3.fromValues( 0.00000000, 0.00000000,-1.17550253),//7,11,12[19]
		vec3.fromValues( 1.11806798, 0.00000000,-0.36327024),//8,7,12[15]
		vec3.fromValues( 0.69091961, 0.00000000, 0.95101660),//9,8,12[16]
		vec3.fromValues(-1.11806222, 0.00000000,-0.36326836),//10,9,12[17]
		vec3.fromValues(-0.30899624, 0.61799248,-0.95102895),//11,10,12[18]
		vec3.fromValues( 0.30902349,-0.61804697,-0.95111280),//4,11,7[14]
		vec3.fromValues( 0.80902116, 0.61809363,-0.58778056),//2,4,7[5]
		vec3.fromValues( 0.80902116, 0.61809363,-0.58778056),//2,7,8[10]
		vec3.fromValues( 1.00000000,-0.61806798, 0.00000000),//3,2,8[6]
		vec3.fromValues( 0.80898084, 0.61806283, 0.58775126),//3,8,9[11]
		vec3.fromValues( 0.30899624,-0.61799248, 0.95102895),//5,3,9[7]
		vec3.fromValues(-0.30902349, 0.61804697, 0.95111280),//5,9,10[12]
		vec3.fromValues(-0.80902116,-0.61809363, 0.58778056),//6,5,10[8]
		vec3.fromValues(-1.00000000, 0.61806798, 0.00000000),//6,10,11[13]
		vec3.fromValues(-0.80898084,-0.61806283,-0.58775126),//4,6,11[9]
		vec3.fromValues(-0.69091961, 0.00000000,-0.95101660),//1,6,4[4]
		vec3.fromValues(-0.61802101,-1.00000000, 0.00000000),//2,1,4[1]
		vec3.fromValues( 1.11806222, 0.00000000, 0.36326836),//1,2,3[0]
		vec3.fromValues( 0.00000000, 0.00000000, 1.17550253),//1,3,5[2]
		vec3.fromValues(-1.11806798, 0.00000000, 0.36327024) //1,5,6[3]
	],
	face_change_of_base_k: [
		vec3.fromValues(-0.50000000, 1.00000000, 0.36323028),//7,11,12[19]
		vec3.fromValues(-0.50000000, 1.00000000,-0.36323028),//8,7,12[15]
		vec3.fromValues( 0.19101818, 1.00000000,-0.58774824),//9,8,12[16]
		vec3.fromValues( 0.19101818, 1.00000000, 0.58774824),//10,9,12[17]
		vec3.fromValues( 0.80902116, 0.61809363, 0.58778056),//11,10,12[18]
		vec3.fromValues( 0.61804697, 1.00004201, 0.00000000),//4,11,7[14]
		vec3.fromValues(-0.30899624, 0.61799248, 0.95102895),//2,4,7[5]
		vec3.fromValues(-0.30899624, 0.61799248, 0.95102895),//2,7,8[10]
		vec3.fromValues( 0.19101916, 1.00000515, 0.58775126),//3,2,8[6]
		vec3.fromValues(-1.00000000, 0.61806798, 0.00000000),//3,8,9[11]
		vec3.fromValues(-0.50002492, 1.00004984, 0.36324839),//5,3,9[7]
		vec3.fromValues(-0.30902349, 0.61804697,-0.95111280),//5,9,10[12]
		vec3.fromValues(-0.50002492, 1.00004984,-0.36324839),//6,5,10[8]
		vec3.fromValues( 0.80898084, 0.61806283,-0.58775126),//6,10,11[13]
		vec3.fromValues( 0.19101916, 1.00000515,-0.58775126),//4,6,11[9]
		vec3.fromValues( 1.11806222, 0.00000000,-0.36326836),//1,6,4[4]
		vec3.fromValues( 0.69098950, 0.00000000,-0.95111280),//2,1,4[1]
		vec3.fromValues(-0.69091961, 0.00000000, 0.95101660),//1,2,3[0]
		vec3.fromValues(-1.11806798, 0.00000000,-0.36327024),//1,3,5[2]
		vec3.fromValues( 0.00000000, 0.00000000,-1.17550253) //1,5,6[3]
	],
	
	face_index_buffer: new ArrayBuffer(4),
	face_index_buffer_view: null, 
	
	// Key = A | (B << 3) | (C << 6), Value is face index [0,63], Value = face_index_lookup[Key]
	// A = floor(8*i), B = floor(8*j), C = floor(8*k)
	face_index_lookup: [7,14,21,28,35,42,49,56,6,13,20,27,34,41,48,70,77,84,91,98,105,112,69,76,83,90,97,104,133,140,147,154,161,168,132,139,146,153,160,196,203,210,217,224,195,202,209,216,259,266,273,280,258,265,272,322,329,336,321,328,385,392,384,448],
	
	k_offset: [0,9,17,24,30,35,39,42,44],
	point_ring_counts: [1,5,10,15,20,25,30,35,40,40,40,40,40,40,40,40,40,35,30,25,20,15,10,5,1],
	point_ring_offsets: [0,1,6,16,31,51,76,106,141,181,221,261,301,341,381,421,461,501,536,566,591,611,626,636,641,642],
};
var g_user_key_timers = {
	last_b_press_time: new Date()
};
var g_user_held_keys = {}
var g_user_mouse = {
	x_movement_px: 0,
	y_movement_px: 0,
	x_movement_n: 0.0,
	y_movement_n: 0.0,
	wheel_delta_y_px: 0
} 
var g_moon_local = {
	pos: vec3.fromValues(0.0, 0.0, 0.0),
	radius: 7.0,
	rotation_mat4: mat4.create(),
	rotation_quat: quat.create(),
	model: mat4.create(),
	model_inv: mat4.create()
};
var g_space = {
	light_theta_current: 0.0,
	light_theta_speed: 0.0 // 0.4
}
const g_building_type = Object.freeze({
	Pt: 'Pt', // Point
	Ln: 'Ln', // Line
	Te: 'Te', // Triangle-Empty
	Tf: 'Tf'  // Triangle-Full
});
const g_buildings = [
	{ name: 'drill', 				type: g_building_type.Tf },
	{ name: 'space_potato_plot', 	type: g_building_type.Te },
	{ name: 'solar_panel', 			type: g_building_type.Tf },
	{ name: 'windmill', 			type: g_building_type.Te },
	{ name: 'grinder', 				type: g_building_type.Tf },
	{ name: 'smelter', 				type: g_building_type.Tf },
	{ name: 'sprinkler', 			type: g_building_type.Pt },
	{ name: 'smelter', 				type: g_building_type.Tf },
	{ name: 'heater_rod', 			type: g_building_type.Pt },
	{ name: 'fence_metal', 			type: g_building_type.Ln },
	{ name: 'fence_gate_metal', 	type: g_building_type.Ln },
	{ name: 'fence_rock', 			type: g_building_type.Ln },
	{ name: 'fence_gate_rock', 		type: g_building_type.Ln },
	{ name: 'road_rock', 			type: g_building_type.Te },
	{ name: 'research_machine', 	type: g_building_type.Tf }
];
const g_player_actor_modes = Object.freeze({
	MOVE: 'MOVE',
	BUILD: 'BUILD'
});
var g_player_actor = {
	pos: vec2.fromValues(0.0, 0.0),
	velocity: vec2.fromValues(0.0, 0.0),
	accel: vec2.fromValues(0.0, 0.0),
	dir_u: vec3.fromValues(0.0, 0.0, -1.0),
	speed: 32.0, // 16.0
	friction: 8,
	
	jump_height: 0.0,
	jump_power: 1.8,
	jump_grounded: false,
	jump_velocity: 0.0,
	jump_acceleration: -1,
	
	movement_mode: g_player_actor_modes.MOVE,
	build_mode_selected_index: 6 // Valid only when movement_move = BUILD, currently set to sprinkler (6)
	
	//pos_leash: vec2.fromValues(0.0, 0.0)
};
var g_player_camera = {	
	global_up_u: vec3.fromValues(0.0, 1.0, 0.0),
	
	actor_follow_theta: 0.0,
	actor_focal_height: 0.0,
	
	actor_follow_distance_sensitivity: 0.002,
	actor_follow_distance: 12.0,
	actor_follow_distance_max: 80.0,
	actor_follow_distance_min: 0.8,
	
	actor_follow_pitch_sensitivity: 0.8,
	actor_follow_pitch: 45.0,
	actor_follow_pitch_max: 89.0,
	actor_follow_pitch_min: 1.0,
	
	fov_d_sensitivity: 0.2,
	fov_d: 30.0,
	fov_d_max: 90.0,
	fov_d_min: 10.0,
	
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
	view_proj: mat4.create(),
	view_proj_inv: mat4.create()
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
	
	// Need this here to be able to use requestPointerLock instead of GameUpdateAndRender (Security restrictions)
	if(g_user_held_keys['b'])
	{
		var time_now = Date.now();
		const time_delta_last_b_ms = time_now - g_user_key_timers.last_b_press_time;
		
		if(time_delta_last_b_ms >= 1000)
		{
			g_user_key_timers.last_b_press_time = time_now;
			if (document.pointerLockElement === html_canvas) 
			{
				g_player_actor.movement_mode = g_player_actor_modes.BUILD;
				document.exitPointerLock();
			}
			else
			{
				g_player_actor.movement_mode = g_player_actor_modes.MOVE;
				html_canvas.requestPointerLock();
			}
		}
	}
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
	else
	{
		//calculate the view projection inverse of the camera
		//calculate the user mouse ray in world-space, collide with sphere surface to get S
		//find N such that dot(surface_normals[N], S) is min
		//calculate j = dot(change_of_base_j[N], S)
		//calculate k = dot(change_of_base_k[N], S)
		//calculate K = floor(8*k + 0.5);
		//calculate I = floor((j * (8-K)) + 0.5);
		//calculate n = k_offset[K] + I;
		
		if(g_player_actor.movement_mode == g_player_actor_modes.BUILD)
		{
			mat4.invert(g_player_camera.view_proj_inv, g_player_camera.view_proj);
			mat4.invert(g_moon_local.model_inv, g_moon_local.model);
			
			var ndc_mouse_x = (event.clientX / html_canvas.clientWidth) * 2 - 1;
			var ndc_mouse_y = -((event.clientY / html_canvas.clientHeight) * 2 - 1);
			
			var ray_dir_ndc = vec4.fromValues(ndc_mouse_x, ndc_mouse_y, 1.0, 1.0);
			var ray_origin_ndc = vec4.fromValues(ndc_mouse_x, ndc_mouse_y, -1.0, 1.0);
			
			var ray_origin_world = vec4.create();
			var ray_dir_world = vec4.create();
			
			vec4.transformMat4(ray_origin_world, ray_origin_ndc, g_player_camera.view_proj_inv);
			vec4.transformMat4(ray_dir_world, ray_dir_ndc, g_player_camera.view_proj_inv);
			
			vec4.scale(ray_origin_world, ray_origin_world, 1 / ray_origin_world[3]);
			vec4.scale(ray_dir_world, ray_dir_world, 1 / ray_dir_world[3]);
			
			vec3.subtract(ray_dir_world, ray_dir_world, ray_origin_world);
			vec3.normalize(ray_dir_world, ray_dir_world);
			
			var ray_origin_model = vec3.create();
			var ray_dir_model = vec3.create();
			
			var ray_end_world = vec3.create();
			vec3.add(ray_end_world, ray_origin_world, ray_dir_world);
			
			vec3.transformMat4(ray_origin_model, ray_origin_world, g_moon_local.model_inv);
			vec3.transformMat4(ray_end_world, ray_end_world, g_moon_local.model_inv);
			
			vec3.subtract(ray_dir_model, ray_end_world, ray_origin_model);
			
			vec3.normalize(ray_dir_model, ray_dir_model);

			const sphere_center_model = vec3.fromValues(0.0, 0.0, 0.0);
			const sphere_radius = 1.0;
			
			const oc = vec3.create();
			vec3.subtract(oc, sphere_center_model, ray_origin_model);
			
			const a = vec3.dot(ray_dir_model, ray_dir_model);
			const b = 2.0 * vec3.dot(oc, ray_dir_model); 
			const c = vec3.dot(oc, oc) - sphere_radius * sphere_radius;
			
			const discriminant = b * b - 4 * a * c;
			if (discriminant < 0) {
				//console.log('No collision(D < 0): D=', discriminant);
				return null;
			}
			
			const sqrt_discriminant = Math.sqrt(discriminant);
			const t0 = (-b - sqrt_discriminant) / (-2 * a);
			const t1 = (-b + sqrt_discriminant) / (-2 * a);
			
			let t = t1;
			if (t < 0) t = t0;
			if (t < 0)
			{
				//console.log('No collision(t miss): t0=', t0, ', t1=', t1);
				return null;
			}
			
			const intersect_point = vec3.create();
			vec3.scaleAndAdd(intersect_point, ray_origin_model, ray_dir_model, t);
			//console.log('Collided! x=', intersect_point[0], ', y=', intersect_point[1], ', z=', intersect_point[2]);
			
			var build_snap_type = g_buildings[g_player_actor.build_mode_selected_index].type;
			if(build_snap_type == g_building_type.Pt)
			{
				var closest_surface_index = -1;
				var highest_dot_product = -1.0;
				for(let i = 0; i < 20; i++)
				{
					var dot = vec3.dot(intersect_point, g_ico_collider.face_surface_normals[i]);
					if(dot > highest_dot_product)
					{
						closest_surface_index = i;
						highest_dot_product = dot;
					}
				}
				
				if(closest_surface_index != -1)
				{
					var bay_i = vec3.dot(intersect_point, g_ico_collider.face_change_of_base_i[closest_surface_index]);
					var bay_j = vec3.dot(intersect_point, g_ico_collider.face_change_of_base_j[closest_surface_index]);
					var bay_k = vec3.dot(intersect_point, g_ico_collider.face_change_of_base_k[closest_surface_index]);
					var closest_subface_key = 0;
					var closest_subface_index = 0;
					
					
					//g_ico_collider.face_index_buffer_view.setUint8(0, bay_i);
					//g_ico_collider.face_index_buffer_view.setUint8(1, bay_j);
					//g_ico_collider.face_index_buffer_view.setUint8(2, bay_k);
					
					//var closest_subface_key = g_ico_collider.face_index_buffer_view.getUint32(0, true);
					//var closest_subface_index = g_ico_collider.face_index_lookup.indexOf(closest_subface_key);
					
					//var closest_subface_key = bay_i + 8*bay_j + 64*bay_k;
					//var closest_subface_index = g_ico_collider.face_index_lookup.indexOf(closest_subface_key);
					
					//var bay_i_v = Clamp(Math.floor(vec3.dot(intersect_point, g_ico_collider.face_change_of_base_i[closest_surface_index]) * 8), 0, 7);
					//var bay_j_v = Clamp(Math.floor(vec3.dot(intersect_point, g_ico_collider.face_change_of_base_j[closest_surface_index]) * 8), 0, 7) << 3;
					//var bay_k_v = Clamp(Math.floor(vec3.dot(intersect_point, g_ico_collider.face_change_of_base_k[closest_surface_index]) * 8), 0, 7) << 6;
					//var closest_subface_index = g_ico_collider.face_index_lookup.indexOf(bay_i_v | bay_j_v | bay_k_v);
					console.log('V(', bay_i, ',', bay_j, ',', bay_k, ') -> ', closest_subface_key,'FC(', closest_surface_index, ',', closest_subface_index, ')');
					//console.log('FC(', closest_surface_index, ',', closest_subface_index, ')');
				}
				
				// Lines
				//var j = vec3.dot(intersect_point, g_ico_collider.change_of_base_j[closest_surface_index]);
				//var k = vec3.dot(intersect_point, g_ico_collider.change_of_base_k[closest_surface_index]);
				//var K = Math.floor(8*k + 0.5);
				//var I = Math.floor((j * (8-K)) + 0.5);
				//var n = g_ico_collider.k_offset[K] + I;
				//console.log('PT(', closest_surface_index, ',', n, ')');
			}
		}
	}
}
function CB_Mouse_Click(event)
{
	if(g_player_actor.movement_mode == g_player_actor_modes.MOVE)
	{
		html_canvas.requestPointerLock();
	}
}
function CB_Mouse_Wheel(event)
{
	g_user_mouse.wheel_delta_y_px += event.deltaY;
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
	
	g_ico_collider.face_index_buffer_view = new DataView(g_ico_collider.face_index_buffer);
	g_ico_collider.face_index_buffer_view.setUint8(3,0);
	
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
		console.log("Downloaded diffuse_6.png");
		g_load.texture_png_downloaded++;
		
		g_gpu.static_mesh.tex_diffuse = g_gl.createTexture();
		g_gl.bindTexture(g_gl.TEXTURE_2D, g_gpu.static_mesh.tex_diffuse);
		g_gl.pixelStorei(g_gl.UNPACK_FLIP_Y_WEBGL, true);
		g_gl.texImage2D(g_gl.TEXTURE_2D, 0, g_gl.RGBA, g_gl.RGBA, g_gl.UNSIGNED_BYTE, g_assets.diffuse_png_1);
		g_gl.generateMipmap(g_gl.TEXTURE_2D);
		g_gl.activeTexture(g_gl.TEXTURE0);
		g_gl.bindTexture(g_gl.TEXTURE_2D, g_gpu.static_mesh.tex_diffuse);
		
		console.log("Loaded diffuse_6.png");
		g_load.texture_png_loaded++;
		
		Check_Game_Is_Loaded();
	};
	g_assets.diffuse_png_1.src = 'diffuse_7.png';
	
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
	
	html_version.textContent = g_version;
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
  g_user_mouse.wheel_delta_y_px = 0.0;
  
  html_fovd.textContent = String(Math.floor(g_player_camera.fov_d * Math.pow(10, 1)) / Math.pow(10, 1));
  html_pitch.textContent = String(Math.floor(g_player_camera.actor_follow_pitch * Math.pow(10, 1)) / Math.pow(10, 1));
  html_zoom.textContent = String(Math.floor(g_player_camera.actor_follow_distance * Math.pow(10, 1)) / Math.pow(10, 1));
  
  if(g_frame_time.counter % 180 == 0)
  {
	  console.clear();
  }
}
function Game_Update_And_Render_SceneLoad(t_delta_t)
{
	
}

function Game_Update_And_Render_SceneGame(t_delta_t) 
{	
	g_player_camera.actor_follow_distance += g_user_mouse.wheel_delta_y_px * g_player_camera.actor_follow_distance_sensitivity;
	g_player_camera.actor_follow_distance = Clamp(g_player_camera.actor_follow_distance, g_player_camera.actor_follow_distance_min, g_player_camera.actor_follow_distance_max);
	
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
	
	var actor_follow_pitch_r = (Math.PI/180.0) * g_player_camera.actor_follow_pitch;
	const actor_sin_dist = Math.sin(actor_follow_pitch_r) * g_player_camera.actor_follow_distance;
	const actor_cos_dist = Math.cos(actor_follow_pitch_r) * g_player_camera.actor_follow_distance;
	
	g_player_camera.pos = vec3.fromValues(0.0, actor_sin_dist, actor_cos_dist);
	
	mat4.perspective(g_player_camera.proj, fov_r, proj_aspect, g_player_camera.near, g_player_camera.far);
	mat4.lookAt(g_player_camera.view, g_player_camera.pos, g_zero_vec3, g_player_camera.global_up_u);
	mat4.mul(g_player_camera.view_proj, g_player_camera.proj, g_player_camera.view);
	
	var camera_dir_u_inv = vec3.create();
	vec3.sub(g_player_camera.dir_u, g_zero_vec3, g_player_camera.pos);
	vec3.normalize(g_player_camera.dir_u, g_player_camera.dir_u);
	vec3.scale(camera_dir_u_inv, g_player_camera.dir_u, -1.0);
	
	vec3.cross(g_player_camera.right_u, g_player_camera.global_up_u, camera_dir_u_inv);
	vec3.normalize(g_player_camera.right_u, g_player_camera.right_u);
	vec3.cross(g_player_camera.local_up_u, camera_dir_u_inv, g_player_camera.right_u);
	
	// Update Actor
	var user_is_moving = false;
	var user_input_vec2 = vec2.fromValues(0.0, 0.0);
	
	if(g_user_held_keys['w'])
	{
		user_is_moving = true;
		vec2.add(user_input_vec2, user_input_vec2, g_yp_vec2);
	}
	if(g_user_held_keys['s'])
	{
		user_is_moving = true;
		vec2.add(user_input_vec2, user_input_vec2, g_yn_vec2);
	}
	if(g_user_held_keys['d'])
	{
		user_is_moving = true;
		vec2.add(user_input_vec2, user_input_vec2, g_xp_vec2);
	}
	if(g_user_held_keys['a'])
	{
		user_is_moving = true;
		vec2.add(user_input_vec2, user_input_vec2, g_xn_vec2);
	}
	
	if(g_user_held_keys['ArrowLeft'])
	{
		g_player_camera.fov_d += g_player_camera.fov_d_sensitivity;
		g_player_camera.fov_d = Clamp(g_player_camera.fov_d, g_player_camera.fov_d_min, g_player_camera.fov_d_max);
	}
	if(g_user_held_keys['ArrowRight'])
	{
		g_player_camera.fov_d -= g_player_camera.fov_d_sensitivity;
		g_player_camera.fov_d = Clamp(g_player_camera.fov_d, g_player_camera.fov_d_min, g_player_camera.fov_d_max);
	}
	if(g_user_held_keys['ArrowUp'])
	{
		g_player_camera.actor_follow_pitch += g_player_camera.actor_follow_pitch_sensitivity;
		g_player_camera.actor_follow_pitch = Clamp(g_player_camera.actor_follow_pitch, g_player_camera.actor_follow_pitch_min, g_player_camera.actor_follow_pitch_max);
	}
	if(g_user_held_keys['ArrowDown'])
	{
		g_player_camera.actor_follow_pitch -= g_player_camera.actor_follow_pitch_sensitivity;
		g_player_camera.actor_follow_pitch = Clamp(g_player_camera.actor_follow_pitch, g_player_camera.actor_follow_pitch_min, g_player_camera.actor_follow_pitch_max);
	}
	
	if(user_is_moving)
	{
		vec3.normalize(user_input_vec2, user_input_vec2);
		vec2.scale(user_input_vec2, user_input_vec2, g_player_actor.speed * t_delta_t);
	}
	
	g_player_actor.jump_velocity = g_player_actor.jump_velocity + g_player_actor.jump_acceleration * t_delta_t;
	g_player_actor.jump_height = Math.max(g_player_actor.jump_height + g_player_actor.jump_velocity * t_delta_t, 0.0);
	g_player_actor.jump_grounded = (g_player_actor.jump_height < 0.02);
	
	if(g_user_held_keys[' '])
	{
		if(g_player_actor.jump_grounded)
		{
			g_player_actor.jump_grounded = false;
			g_player_actor.jump_velocity = g_player_actor.jump_power;
		}
	}
	
	vec2.scale(g_player_actor.accel, g_player_actor.velocity, -g_player_actor.friction); 
	
	var delta_velocity_from_accel = vec2.create();
	vec2.scale(delta_velocity_from_accel, g_player_actor.accel, t_delta_t);
	vec2.add(g_player_actor.velocity, g_player_actor.velocity, delta_velocity_from_accel);
	
	var delta_velocity_from_impulse = vec2.create();
	vec2.scale(delta_velocity_from_impulse, user_input_vec2, g_player_actor.speed * t_delta_t);
	vec2.add(g_player_actor.velocity, g_player_actor.velocity, delta_velocity_from_impulse);
	
	var delta_pos = vec2.create();
	vec2.scale(delta_pos, g_player_actor.velocity, t_delta_t);
	vec2.add(g_player_actor.pos, g_player_actor.pos, delta_pos);
	
	var moon_scale = vec3.fromValues(g_moon_local.radius, g_moon_local.radius, g_moon_local.radius);
	var moon_translate = vec3.fromValues(0, -g_moon_local.radius, 0);
	
	let temp_quat = quat.create();
	quat.setAxisAngle(temp_quat, [1,0,0], delta_pos[1]);
	quat.multiply(g_moon_local.rotation_quat, temp_quat, g_moon_local.rotation_quat);
	
	quat.setAxisAngle(temp_quat, [0,1,0], dtheta);
	quat.multiply(g_moon_local.rotation_quat, temp_quat, g_moon_local.rotation_quat);
	
	quat.setAxisAngle(temp_quat, [0,0,1], delta_pos[0]);
	quat.multiply(g_moon_local.rotation_quat, temp_quat, g_moon_local.rotation_quat);
	
	var moon_mvp = mat4.create();
	var moon_mv = mat4.create();
	
	mat4.fromRotationTranslationScale(g_moon_local.model, g_moon_local.rotation_quat, moon_translate, moon_scale);
	mat4.mul(moon_mvp, g_player_camera.view_proj, g_moon_local.model);
	mat4.mul(moon_mv, g_player_camera.view, g_moon_local.model);
	
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
	
	var actor_mvp = mat4.create();
	var actor_mv = mat4.create();
	var actor_model = mat4.create();
	var actor_scale = vec3.fromValues(0.2, 0.4, 0.2);
	var actor_translate = vec3.fromValues(0, 0.3, 0);
	var actor_quat = quat.create();
	const actor_mvi = mat3.create();
	
	vec3.add(actor_translate, actor_translate, vec3.fromValues(0.0, g_player_actor.jump_height, 0.0));
	quat.setAxisAngle(actor_quat, [0,1,0], vec2.angle(g_player_actor.velocity, [1,0]));
	mat4.fromRotationTranslationScale(actor_model, actor_quat, actor_translate, actor_scale);
	mat4.mul(actor_mvp, g_player_camera.view_proj, actor_model);
	mat4.mul(actor_mv, g_player_camera.view, actor_model);
	mat3.normalFromMat4(actor_mvi, actor_mv);
	
	// Render
	
	g_gl.clear(g_gl.COLOR_BUFFER_BIT| g_gl.DEPTH_BUFFER_BIT);
	
	g_gl.uniform3fv(g_gpu.static_mesh.uniform_light_dir, local_light_dir);
	
	g_gl.uniformMatrix4fv(g_gpu.static_mesh.uniform_mvp, false, moon_mvp);
    g_gl.uniformMatrix3fv(g_gpu.static_mesh.uniform_mvi, false, moon_mvi);
	g_gl.drawElements(g_gl.TRIANGLES, g_assets.static_mesh_js_1.e_pooled_index_counts[1], g_gl.UNSIGNED_SHORT, 2*g_assets.static_mesh_js_1.e_pooled_index_offsets[1]);
	
	g_gl.uniformMatrix4fv(g_gpu.static_mesh.uniform_mvp, false, actor_mvp);
    g_gl.uniformMatrix3fv(g_gpu.static_mesh.uniform_mvi, false, actor_mvi);
	g_gl.drawElements(g_gl.TRIANGLES, g_assets.static_mesh_js_1.e_pooled_index_counts[0], g_gl.UNSIGNED_SHORT, 2*g_assets.static_mesh_js_1.e_pooled_index_offsets[0]);
}

Load();
Render_Loop();