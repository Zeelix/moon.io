export const vs_code = `
attribute vec3 in_pos;
attribute vec2 in_tex;
attribute vec3 in_nrm;

uniform mat4 u_mvp;
uniform mat3 u_mvi;

varying highp vec2 out_tex;
varying highp vec3 out_nrm;

void main() {
	gl_Position = u_mvp * vec4(in_pos, 1.0);
	out_nrm = u_mvi * in_nrm;
	out_tex = in_tex;
}`;

export const fs_code = `
precision highp float;

uniform float u_toon_num_bands;
uniform float u_toon_stride;

uniform vec3  u_object_color;
uniform vec3  u_light_dir;
uniform float u_light_amb;

uniform sampler2D u_diffuse;

varying highp vec2 out_tex;
varying highp vec3 out_nrm;

float toonify(float value) {
	float x = clamp(value, u_toon_stride, 1.0 - u_toon_stride - 0.001);
	float bandlen = (1.0 - 2.0*u_toon_stride) / u_toon_num_bands;
    return u_toon_stride + bandlen*(floor((x - u_toon_stride)/bandlen) + 0.5);
}
void main() {
  float intensity = clamp(dot(u_light_dir, out_nrm) + 0.4,0.0,1.0) + u_light_amb;
  //gl_FragColor = vec4(u_object_color * toonify(intensity), 1.0);
  
  //float intensity = clamp(dot(u_light_dir, out_nrm) + 0.4,0.0,1.0) + u_light_amb;
  //gl_FragColor = vec4(u_object_color * intensity, 1.0);
  
  //float intensity = clamp(dot(u_light_dir, out_nrm) + 0.4,0.0,1.0) + u_light_amb;
  gl_FragColor = vec4(texture2D(u_diffuse, out_tex).rgb * intensity, 1.0);
}`;