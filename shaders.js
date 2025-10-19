export const e_sm_vs_code = `
attribute vec3 in_pos;
attribute vec3 in_nrm;

uniform mat4 u_mvp;
uniform mat3 u_mvi;

varying highp vec3 out_nrm;

void main() {
	gl_Position = u_mvp * vec4(in_pos, 1.0);
	out_nrm = u_mvi * in_nrm;
}`;

export const e_sm_fs_code = `
precision highp float;

varying highp vec3 out_nrm;

void main() {
	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;