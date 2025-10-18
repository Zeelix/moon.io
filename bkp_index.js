
import { rocket_modelData, rocket_modelIndexData_1, rocket_modelIndexData_2, rocket_modelIndexData_3 } from './assets.js';
import { star_modelData_1, star_modelData_2, star_modelIndexData } from './assets.js';

var gl;
var canvas_handle = document.getElementById("mview");
var timer = 30.0;

//  Avaliable Info
var general_controlsInfo;  var general_sceneInfo;
var rocket_programInfo;    var star_programInfo; 	var exhaust_programInfo;
var rocket_bufferInfo;     var star_bufferInfo;   	var exhaust_bufferInfo;
var art_scene1Info;

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
  
const fpsElem = document.querySelector("#fps");
var then = new Date();
var now;

function renderLoop(){
  now = new Date();
  const deltaTime = (now.getTime() - then.getTime()) / 1000.0;          // compute time since last frame
  then = now;                            // remember time for next frame
  const fps = 1 / deltaTime;             // compute frames per second
  if(timer % 10 == 0)
	fpsElem.textContent = fps.toFixed(1);  // update fps display
	
  timer++;
  requestAnimFrame( renderLoop );
  render(); 
}

function render() {
   gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

   var rotate_1 =  0.99; // -0.6 
   var rotate_2 = -0.6; // -0.6

  var modelMatrix_rocket = mat4.create();
    mat4.rotate(modelMatrix_rocket, 
			  modelMatrix_rocket, 
			  rotate_1, 
			  [0, 0, 1]);
	mat4.rotate(modelMatrix_rocket, 
			  modelMatrix_rocket, 
			  rotate_2, 
			  [1, 0, 0]);
  
  mat4.rotate(modelMatrix_rocket, 
			  modelMatrix_rocket, 
			  timer / 30.0, 
			  [0, 1, 0]);
			  
  var mat_quat4 = rotateModelByControl();
  mat4.mul(modelMatrix_rocket, mat_quat4, modelMatrix_rocket); 
  
  var viewMatrix = mat4.create();

  // Shake View
  mat4.translate(viewMatrix,                                                      
                 viewMatrix,                                                      
                 [0.012*Math.sin( timer/0.2 ), 0.012*Math.cos( timer/0.23 ), 0]);   

  //  Center Rocket
  mat4.translate(viewMatrix,                                                      
                 viewMatrix,                                                      
                 [-6.4, 1.2, -20.0]);                                                    
				 
  var MV_rocket = mat4.create();
  var MVP_rocket = mat4.create();
  mat4.mul(MV_rocket, viewMatrix, modelMatrix_rocket);
  mat4.mul(MVP_rocket, general_sceneInfo.proj, MV_rocket);
  
  var VI = mat3.create();
  var MVI_rocket = mat3.create();
  mat3.normalFromMat4(VI, viewMatrix);
  mat3.normalFromMat4(MVI_rocket, MV_rocket);

    var ldir = vec3.fromValues(art_scene1Info.lightDir[0],
        art_scene1Info.lightDir[1],
        art_scene1Info.lightDir[2]);

  vec3.normalize(ldir, ldir);
  vec3.transformMat3(ldir, ldir, VI);
  
   //  Draw Rocket
  {
	useShader("rocket", false);
	
    gl.uniform1f(
        rocket_programInfo.uniformLocations.toonNumBands,
        art_scene1Info.toonBands);
    gl.uniform1f(
        rocket_programInfo.uniformLocations.toonStride,
        art_scene1Info.toonStride);
    gl.uniform1f(
        rocket_programInfo.uniformLocations.lightAmb,
        art_scene1Info.lightAmb);
    gl.uniform3fv(
	    rocket_programInfo.uniformLocations.lightDir,
	    ldir);
    gl.uniformMatrix4fv(
        rocket_programInfo.uniformLocations.MVP,
        false,
        MVP_rocket);
    gl.uniformMatrix3fv(
        rocket_programInfo.uniformLocations.MVI,
        false,
        MVI_rocket);

    const offset = 0;
    var vertexCount;

    vertexCount = rocket_bufferInfo.index_1_size;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocket_bufferInfo.index_1);
	gl.uniform3f(
	  rocket_programInfo.uniformLocations.objectColor,
	  1.0, 1.0, 1.0);
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
	
    vertexCount = rocket_bufferInfo.index_2_size;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocket_bufferInfo.index_2);
	gl.uniform3f(
	  rocket_programInfo.uniformLocations.objectColor,
	  0.0, 0.635, 1.0);
	  //1.0, 0.0, 0.0);
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
	
    vertexCount = rocket_bufferInfo.index_3_size;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocket_bufferInfo.index_3);
	gl.uniform3f(
	  rocket_programInfo.uniformLocations.objectColor,
	  0.2, 0.2, 0.2);

    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
  }
  
  //  Draw Stars
  {
	useShader("star", false);
	gl.bindBuffer(gl.ARRAY_BUFFER, star_bufferInfo.vertex_1);
	
	var buffer_swap = art_scene1Info.numStars/2;
	for(let i = 0; i < art_scene1Info.numStars; i++) {
		if(i == buffer_swap)
			gl.bindBuffer(gl.ARRAY_BUFFER, star_bufferInfo.vertex_2);
		
		var v = art_scene1Info.starVelocities[i];
		var tau = (timer*v/art_scene1Info.starRange);
		var a = (tau - Math.floor(tau) - 0.5)*art_scene1Info.starRange; 
		var D = vec3.fromValues(0.0, 1.0, 0.0);
		var P_old = vec3.fromValues(art_scene1Info.starPositions[3*i  ],
									art_scene1Info.starPositions[3*i+1],
									art_scene1Info.starPositions[3*i+2]);
		
		vec3.scale(D, D, (-a));
		var P_new = vec3.create();
		vec3.add(P_new, P_old, D);
		
		var modelMatrix_star = mat4.create();
		
		mat4.rotate(modelMatrix_star, 
			  modelMatrix_star, 
			  rotate_1,
			  [0, 0, 1]);
		mat4.rotate(modelMatrix_star, 
			  modelMatrix_star, 
			  rotate_2, 
			  [1, 0, 0]);
		mat4.rotate(modelMatrix_star, 
			  modelMatrix_star, 
			  timer*v / 300.0, 
			  [0, 1, 0]);
		
		mat4.translate(	modelMatrix_star,                                                      
						modelMatrix_star,                                                      
						P_new); 
		mat4.scale( modelMatrix_star,
		modelMatrix_star,
		[0.045, 0.045, 0.045]);
		
		mat4.mul(modelMatrix_star, mat_quat4, modelMatrix_star); 
								
		var MV_star = mat4.create();
		var MVP_star = mat4.create();
		mat4.mul(MV_star, viewMatrix, modelMatrix_star);
		mat4.mul(MVP_star, general_sceneInfo.proj, MV_star);
		
		gl.uniformMatrix4fv(
    	  star_programInfo.uniformLocations.MVP,
    	  false,
    	  MVP_star);

		gl.uniform3f(
		  star_programInfo.uniformLocations.objectColor,
		  1.0, 1.0, 1.0);
		
		var offset = 0;
		var vertexCount = star_bufferInfo.index_size;
		
		gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
	}
  }
  
  //  Draw Exhaust
  {
	  useShader("exhaust", false);
	  
	  for(let i = 0; i < art_scene1Info.numExhaustFire; i++) {
		var theta = art_scene1Info.exhaustFireTheta[i];
	    var P_old = vec3.fromValues(0.0, -4.0, 0.0);
		var exhaust_scaler = theta / 10.0;
		var exhaust_sizeScaler = 1.2 - (theta / (Math.PI*1.67));
		
		var variance = 0.15;
	    var perturb = vec3.fromValues(Math.random() * variance, Math.random() * variance * 2.0, Math.random() * variance);
		
		vec3.add(P_old, P_old, vec3.fromValues(exhaust_scaler, -theta/1.5, exhaust_scaler));
		vec3.add(P_old, P_old, perturb);
		
	    var modelMatrix_exhaust = mat4.create();
		
	    mat4.rotate(modelMatrix_exhaust, 
		  	  modelMatrix_exhaust, 
		  	  rotate_1, //-0.6
		  	  [0, 0, 1]);
	    mat4.rotate(modelMatrix_exhaust, 
		  	  modelMatrix_exhaust, 
		  	  rotate_2,// -0.6 
		  	  [1, 0, 0]);
			  
		mat4.rotate(modelMatrix_exhaust, 
		  modelMatrix_exhaust, 
			theta, 
			[0, 1, 0]);
		mat4.rotate(modelMatrix_exhaust, 
		  modelMatrix_exhaust, 
			timer*theta / 5.0, 
			[0, 1, 0]);
		
	    mat4.translate(	modelMatrix_exhaust,                                                      
		  				modelMatrix_exhaust,                                                      
		  				P_old); 
	    mat4.mul(modelMatrix_exhaust, mat_quat4, modelMatrix_exhaust); 
	    mat4.scale( modelMatrix_exhaust,
		  modelMatrix_exhaust,
		  [exhaust_sizeScaler, exhaust_sizeScaler, exhaust_sizeScaler]);
	    
	    var MV_exhaust = mat4.create();
	    var MVP_exhaust = mat4.create();
	    mat4.mul(MV_exhaust, viewMatrix, modelMatrix_exhaust);
	    mat4.mul(MVP_exhaust, general_sceneInfo.proj, MV_exhaust);
	    
	    gl.uniformMatrix4fv(
          exhaust_programInfo.uniformLocations.MVP,
          false,
          MVP_exhaust);
	    
		var color_exhaust_first = vec3.fromValues(1.0, 0.807, 0.04);
		var color_exhaust_second = vec3.fromValues(1.0, 0.717, 0.0);
		var color_exhaust = vec3.create();
		vec3.lerp(color_exhaust, color_exhaust_first, color_exhaust_second, theta/2.0*Math.PI);
		
	    gl.uniform3fv(
	      exhaust_programInfo.uniformLocations.objectColor,
	      color_exhaust);
	    
	    var offset = 0;
	    var vertexCount = exhaust_bufferInfo.index_size;
	    
	    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
	  }
  }
}

//  Data
function fillBuffers() {
    //  Rocket
    useShader("rocket", true);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(rocket_modelData),
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocket_bufferInfo.index_1);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(rocket_modelIndexData_1),
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocket_bufferInfo.index_2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(rocket_modelIndexData_2),
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocket_bufferInfo.index_3);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(rocket_modelIndexData_3),
        gl.STATIC_DRAW);

    rocket_bufferInfo.vertex_size = rocket_modelData.length;
    rocket_bufferInfo.index_1_size = rocket_modelIndexData_1.length;
    rocket_bufferInfo.index_2_size = rocket_modelIndexData_2.length;
    rocket_bufferInfo.index_3_size = rocket_modelIndexData_3.length;

    //  Star
    useShader("star", true);
	gl.bindBuffer(gl.ARRAY_BUFFER, star_bufferInfo.vertex_1);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(star_modelData_1),
        gl.STATIC_DRAW);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, star_bufferInfo.vertex_2);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(star_modelData_2),
        gl.STATIC_DRAW);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(star_modelIndexData),
        gl.STATIC_DRAW);

    star_bufferInfo.vertex_1_size = star_modelData_1.length;
	star_bufferInfo.vertex_2_size = star_modelData_2.length;
    star_bufferInfo.index_size = star_modelIndexData.length;
	
	//  Exhaust
	useShader("exhaust", true);
	gl.bindBuffer(gl.ARRAY_BUFFER, exhaust_bufferInfo.vertex);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(star_modelData_1),
        gl.STATIC_DRAW);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(star_modelIndexData),
        gl.STATIC_DRAW);

    exhaust_bufferInfo.vertex_size = star_modelData_1.length;
    exhaust_bufferInfo.index_size = star_modelIndexData.length;
}
function setAllScenes() {

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    general_sceneInfo = {
        FOV: fieldOfView,
        aspectRatio: aspect,
        near: zNear,
        far: zFar,
        proj: projectionMatrix
    };

    var scene1_lightDir = [0.6, -1.0, -1.0];
    var scene1_toonBands = 3.0;
    var scene1_toonStride = 0.05;
    var scene1_lightAmb = 0.09;
	
	const scene1_starRange = 30.0;
	const scene1_starPositions = [
	    //  Fast Stars [close]
	    1.81448,1.10645,-2.06717,-2.26341,-0.692312,1.15436,2.41386,3.7994,2.46757,-1.95791,1.41926,1.46809,4.33256,1.0567,-3.12128,0.583972,3.48964,-4.89319,-2.94092,2.36747,3.21528,4.54802,1.34053,-3.66054,-3.03552,-2.03696,2.12241,-4.14701,-1.97714,0.46495,
	    
		//  Slow Stars [far]
	    0.314341,-1.86102,15.8031,-8.43715,11.5244,-10.5759,3.83374,-8.11731,7.09189,-16.1583,5.11185,10.7834,-6.79403,4.0144,8.19666,13.3055,-17.4303,-11.6684,8.40053,2.05145,-18.2299,13.8548,-15.9032,-6.75375,-11.9028,10.8432,-1.88299,17.5573,-7.93298,-19.8144,-9.53215,6.93564,1.90252,-15.0291,8.63002,8.72768,6.21296,7.43858,1.68157,-11.7075,
     	11.1252,-17.4194,4.50636,-18.6084,-11.876,19.6362,-1.67913,17.5939,-11.1557,2.70821,-6.20685,15.9374,-16.9433,-18.2006,-17.0299,-5.87848,-3.88012,-14.5347,-13.6973,-7.54356,-17.8747,-13.6351,0.98941,13.8255,9.00967,10.9568,-3.1074,-19.0844,-8.15638,4.57717,6.29841,11.9749,-9.39177,3.16965,13.7413,16.3073,-11.3523,-17.102,12.1604,-9.18424,
     	8.08435,18.8977,11.6367,18.7964,-1.56438,4.42213,6.95639,-7.76696,-5.30473,1.63152,10.2536,18.8916,-18.9062,-4.72976,-5.02518,15.3954,-3.16355,0.477921,17.4352,7.5924,0.0286884,16.0057,2.18696,-0.579241,-13.939,14.0562,17.4767,11.55,-3.30149,18.0322,7.02841,-8.97061,-3.88501,19.4104,4.4026,-6.78304,10.1437,-14.9901,-3.81664,17.2021,
     	-15.0328,-14.088,-19.7497,16.0118,1.52043,19.2529,-14.6348,-17.1715,-18.1579,-5.82965,-1.64617,-5.53179,3.62987,13.1394,5.0972,-6.62313,-0.748924,19.9365,11.6196,-10.6027,-4.55031,-14.4859,11.4902,-17.4596,-9.98016,-16.9958,5.81011,8.03797,-18.3337,3.10617,2.02826,4.89456,9.32829,-18.872,17.8295,-10.7822,-2.79611,6.91733,16.3524,-6.44368,
     	-18.2702,-11.08,-1.00528,13.5081,-3.24168,-16.3561,-17.9687,-17.1618,-6.80624,-18.2434,3.32835,18.3764,-10.6735,2.07587,5.35966,-4.09375,-11.8711,4.69192,-19.1687,18.3483,17.7416,-5.50005,-12.8831,-2.56661,-8.57997,-13.646,15.7701,-9.83856,-16.8065,3.11838,3.37107,-8.73989,15.4552,17.8613,9.95209,-17.0788,-5.22538,11.4389,11.2449,-16.953,
     	12.1592,16.7187,11.0117,13.2591,4.00342,0.691549,-0.298471,7.93176,-9.97894,15.7323,-14.3126,-14.5177,4.35255,-8.76553,-14.6727,-16.8151,16.1364,-3.08908,-1.89154,-3.25877,-4.21339,-11.0434,13.115,-14.1282,-16.7785,-9.62371,-6.92709,-12.8257,-5.70879,-3.3137,2.23579,-4.5027,-18.3386,-1.7365,-15.6737,15.0743,6.40217,10.593,-3.16965,-18.3264
	];
	const scene1_starVelocities = [
	    //  Fast Stars [close]
		1.10898,0.83545,0.813855,1.09557,1.12845,0.809656,0.984881,0.927433,1.1207,0.801343,
		1.00836,1.14962,1.11151,1.0514,1.00723,1.05671,0.826637,0.953752,0.885757,0.877602,
		1.15464,0.917264,1.19416,1.0314,0.829017,0.968853,0.969073,0.855934,1.09268,1.01054,
		
		//  Slow Stars [far]
		0.309113,0.362313,0.368307,0.276873,0.101782,0.184304,0.4374,0.458837,0.204544,0.480981,0.480297,0.488488,0.369552,0.23737,0.217032,0.180032,0.430918,0.320905,0.136146,0.195474,
		0.220121,0.384994,0.433946,0.27658,0.119813,0.257659,0.498303,0.243449,0.118336,0.228031,0.499585,0.271892,0.227506,0.442808,0.451048,0.362203,0.126307,0.225431,0.301239,0.311921,
		0.4927,0.3305,0.420994,0.104846,0.286309,0.145717,0.447362,0.429185,0.444383,0.454076,0.247221,0.436839,0.25352,0.168618,0.162807,0.456847,0.459667,0.452538,0.301752,0.375045,
		0.178884,0.236625,0.434263,0.192752,0.471532,0.147206,0.259709,0.2768,0.441954,0.456493,0.405429,0.213517,0.326716,0.468224,0.319758,0.179019,0.233561,0.150868,0.22244,0.138575
	];

	const scene1_exhaustFireTheta = [
	  0.308531,0.565098,0.326556,3.6297,1.68781,2.39634,0.107574,0.599038,4.2807,3.96565,4.08665,3.21034,0.626267,3.43315,5.62413,1.88283,4.28914,2.49701,1.26078,5.23046,
      4.14552,6.08434,1.85541,1.14956,3.36125,0.454839,1.66595,0.095685,0.308531,4.95088,2.96163,6.01377,4.30045,0.448128,2.11408,2.30315,6.22393,5.67341,3.33593,5.63429,
      3.23239,3.91426,3.71657,4.8132,3.86364,3.84849,3.15588,0.878039,5.92614,6.13764,1.69759,3.32328,5.47168,2.43047,0.160498,3.85348,4.06019,4.61762,4.26977,2.47803,
      3.5204,4.78559,4.20535,0.530965,5.68146,1.94208,5.16756,4.01455,6.27321,2.24831,5.47744,2.11274,0.475549,3.15971,4.09432,1.97583,1.87784,0.162032,3.18771,2.93977,
      4.36393,1.37276,5.95989,3.84408,1.78407,0.723678,0.490314,2.01763,1.21035,1.8161,5.19824,2.19117,0.123489,5.46191,3.32922,0.192904,1.55665,2.73555,5.42643,3.66613
	];

    art_scene1Info = {
        lightDir: scene1_lightDir,
        toonBands: scene1_toonBands,
        toonStride: scene1_toonStride,
        lightAmb: scene1_lightAmb,
		starPositions: scene1_starPositions,
		starVelocities: scene1_starVelocities,
		numStars: scene1_starVelocities.length,
		starRange: scene1_starRange,
		exhaustFireTheta: scene1_exhaustFireTheta,
		numExhaustFire: scene1_exhaustFireTheta.length,
    };
}
function setControls() {
    var scene1_lastPosCursor = [0.0, 0.0, 0.0];
    var scene1_rocketQuat = quat.create();
    var scene1_rocketAxis = [1.0, 0.0, 0.0]
    var scene1_rocketAngle = 0.1;

    general_controlsInfo = {
        lastPosCursor: scene1_lastPosCursor,
        rocketQuat: scene1_rocketQuat,
        rocketAxis: scene1_rocketAxis,
        rocketAngle: scene1_rocketAngle,
    };
}

//  Shaders
function compileAllShaders() {

    const rocket_vsSource = `
        attribute vec4 aVertexPosition;
  	    attribute vec3 aVertexNormal;
	    
        uniform mat4 uMVP;
	    uniform mat3 uMVI;
	    
	    varying highp vec3 vVertexNormal;
	    
        void main() {
          gl_Position = uMVP * aVertexPosition;
	      vVertexNormal = uMVI * aVertexNormal;
        }
    `;
    const rocket_fsSource = `
	    precision highp float;

	    uniform float uToonNumBands;
	    uniform float uToonStride;
	    
	    uniform vec3  uObjectColor;
	    uniform vec3  uLightDir;
	    uniform float uLightAmb;
  
	    varying highp vec3 vVertexNormal;
  
        float toonify(float value) {
	    	float x = clamp(value, uToonStride, 1.0 - uToonStride - 0.001);
	    	float bandlen = (1.0 - 2.0*uToonStride) / uToonNumBands;
	        return uToonStride + bandlen*(floor((x - uToonStride)/bandlen) + 0.5);
	    }
        void main() {
	      float intensity = clamp(dot(uLightDir, vVertexNormal),0.0,1.0) + uLightAmb;
	      gl_FragColor = vec4(uObjectColor * toonify(intensity), 1.0);
	      float I = clamp(dot(uLightDir, vVertexNormal),0.0,1.0);
        }
    `;
    const rocket_shaderProgram = initShaderProgram(rocket_vsSource, rocket_fsSource);

    const star_vsSource = `
        attribute vec4 aVertexPosition;
	    
        uniform mat4 uMVP;
	    
        void main() {
          gl_Position = uMVP * aVertexPosition;
        }
    `;
    const star_fsSource = `
  	    precision highp float;

	    uniform vec3  uObjectColor;

        void main() {
	      gl_FragColor = vec4(uObjectColor, 1.0);
        }
    `;
    const star_shaderProgram = initShaderProgram(star_vsSource, star_fsSource);

	const exhaust_vsSource = `
        attribute vec4 aVertexPosition;
	    
        uniform mat4 uMVP;
	    
        void main() {
          gl_Position = uMVP * aVertexPosition;
        }
    `;
    const exhaust_fsSource = `
  	    precision highp float;

	    uniform vec3  uObjectColor;

        void main() {
	      gl_FragColor = vec4(uObjectColor, 0.1);
        }
    `;
    const exhaust_shaderProgram = initShaderProgram(exhaust_vsSource, exhaust_fsSource);

    rocket_programInfo = {
        program: rocket_shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(rocket_shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(rocket_shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            toonNumBands: gl.getUniformLocation(rocket_shaderProgram, 'uToonNumBands'),
            toonStride: gl.getUniformLocation(rocket_shaderProgram, 'uToonStride'),
            objectColor: gl.getUniformLocation(rocket_shaderProgram, 'uObjectColor'),
            lightAmb: gl.getUniformLocation(rocket_shaderProgram, 'uLightAmb'),
            lightDir: gl.getUniformLocation(rocket_shaderProgram, 'uLightDir'),
            MVP: gl.getUniformLocation(rocket_shaderProgram, 'uMVP'),
            MVI: gl.getUniformLocation(rocket_shaderProgram, 'uMVI'),
        }
    };
    star_programInfo = {
        program: star_shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(star_shaderProgram, 'aVertexPosition')
        },
        uniformLocations: {
            objectColor: gl.getUniformLocation(star_shaderProgram, 'uObjectColor'),
            MVP: gl.getUniformLocation(star_shaderProgram, 'uMVP')
        }
    };
	exhaust_programInfo = {
		program: exhaust_shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(exhaust_shaderProgram, 'aVertexPosition')
        },
        uniformLocations: {
            objectColor: gl.getUniformLocation(exhaust_shaderProgram, 'uObjectColor'),
            MVP: gl.getUniformLocation(exhaust_shaderProgram, 'uMVP')
        }
	};
}
function useShader(shader, init) {
    if (shader == "rocket") {
        gl.useProgram(rocket_programInfo.program);

        if (init) {
            const rocket_modelVertexBuffer  = gl.createBuffer();
            const rocket_modelIndexBuffer_1 = gl.createBuffer();
            const rocket_modelIndexBuffer_2 = gl.createBuffer();
            const rocket_modelIndexBuffer_3 = gl.createBuffer();

            rocket_bufferInfo = {
                vertex:  rocket_modelVertexBuffer,  vertex_size:  -1,
                index_1: rocket_modelIndexBuffer_1, index_1_size: -1,
                index_2: rocket_modelIndexBuffer_2, index_2_size: -1,
                index_3: rocket_modelIndexBuffer_3, index_3_size: -1,
            };
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, rocket_bufferInfo.vertex);

        //##  Positions
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 2 * 3 * (4);
            const offset = 0;

            gl.vertexAttribPointer(
                rocket_programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                rocket_programInfo.attribLocations.vertexPosition);
        }
        //##  Normals
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 2 * 3 * (4);
            const offset = 3 * (4);

            gl.vertexAttribPointer(
                rocket_programInfo.attribLocations.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                rocket_programInfo.attribLocations.vertexNormal);
        }
    }
    else if (shader == "star") {
        gl.useProgram(star_programInfo.program);

        if (init) {
            const star_modelVertexBuffer_1 = gl.createBuffer();
			const star_modelVertexBuffer_2 = gl.createBuffer();
            const star_modelIndexBuffer    = gl.createBuffer();

            star_bufferInfo = {
                vertex_1: star_modelVertexBuffer_1, vertex_1_size: -1,
				vertex_2: star_modelVertexBuffer_2, vertex_2_size: -1,
                index:    star_modelIndexBuffer,    index_size:    -1,
            };
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, star_bufferInfo.index);

        //##  Positions
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.vertexAttribPointer(
                star_programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                star_programInfo.attribLocations.vertexPosition);
        }
    }
	else if (shader == "exhaust") {
        gl.useProgram(exhaust_programInfo.program);

        if (init) {
            const exhaust_modelVertexBuffer = gl.createBuffer();
            const exhaust_modelIndexBuffer  = gl.createBuffer();

            exhaust_bufferInfo = {
                vertex: exhaust_modelVertexBuffer, vertex_size: -1,
                index:  exhaust_modelIndexBuffer,  index_size:  -1,
            };
        }
		gl.bindBuffer(gl.ARRAY_BUFFER, exhaust_bufferInfo.vertex);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, exhaust_bufferInfo.index);

        //##  Positions
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.vertexAttribPointer(
                star_programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                star_programInfo.attribLocations.vertexPosition);
        }
    }
}
function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

//  Utility
function getSphereCords(ex, ey, h, w, x0, y0) {
    var x = (2.0 * (ex - x0) - w) / w;
    var y = (h - 2.0 * (ey - y0)) / h;

    var d = Math.sqrt(x * x + y * y);
    var z = Math.cos((Math.PI / 2.0) * ((d < 1.0) ? d : 1.0));
    var a = 1.0 / Math.sqrt(x * x + y * y + z * z);
    x *= a; y *= a; z *= a;

    return [x, y, z];
}
function rotateModelByControl() {
    var quat_iter = quat.create();
    var quat_iter_conj = quat.create(); // TAG CONJUGATE BEFORE SETAXISANGLE
    quat.conjugate(quat_iter_conj, quat_iter);
    quat.setAxisAngle(quat_iter, general_controlsInfo.rocketAxis, 1.2*general_controlsInfo.rocketAngle);
    

    quat.mul(general_controlsInfo.rocketQuat, quat_iter, general_controlsInfo.rocketQuat);
    quat.mul(general_controlsInfo.rocketQuat, general_controlsInfo.rocketQuat, quat_iter_conj);
    general_controlsInfo.rocketAngle = 0;

    var quat_mat4 = mat4.create();
    mat4.fromQuat(quat_mat4, general_controlsInfo.rocketQuat);
    return quat_mat4;
}

//  Events
function canvasMouseMove(e) {
    var pc = canvas_handle.getBoundingClientRect();
    var cords = getSphereCords(e.clientX, e.clientY, canvas_handle.clientHeight, canvas_handle.clientWidth, pc.left, pc.top);

    var last_pos = general_controlsInfo.lastPosCursor;

    var dx = cords[0] - last_pos[0];
    var dy = cords[1] - last_pos[1];
    var dz = cords[2] - last_pos[2];

    general_controlsInfo.rocketAngle = 1.5 * Math.sqrt(dx * dx + dy * dy + dz * dz);

    var rocket_axis = [
        last_pos[1] * cords[2] - last_pos[2] * cords[1],
        last_pos[2] * cords[0] - last_pos[0] * cords[2],
        last_pos[0] * cords[1] - last_pos[1] * cords[0]
    ];
    var n = Math.sqrt(rocket_axis[0] * rocket_axis[0] +
        rocket_axis[1] * rocket_axis[1] +
        rocket_axis[2] * rocket_axis[2]);
    if (n != 0) {
        rocket_axis[0] /= n; rocket_axis[1] /= n; rocket_axis[2] /= n;
    }
    general_controlsInfo.rocketAxis = rocket_axis;
    general_controlsInfo.lastPosCursor = cords;
}
document.getElementById("mview").addEventListener("mousedown", function(e){
    var pc = canvas_handle.getBoundingClientRect();
    general_controlsInfo.lastPosCursor = getSphereCords(e.clientX, e.clientY, canvas_handle.clientHeight, canvas_handle.clientWidth, pc.left, pc.top);
    canvasMouseMove(e); 
    this.addEventListener("mousemove", canvasMouseMove);
});
document.getElementById("mview").addEventListener("mouseup", function(e){
    this.removeEventListener("mousemove", canvasMouseMove);
});

//  Core
function main() {
    const canvas = document.querySelector('#glcanvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    compileAllShaders();
    fillBuffers();
    setAllScenes();
    setControls();

    renderLoop();
}
main();
