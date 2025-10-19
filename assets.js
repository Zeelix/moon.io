const asset_sm_cube_vertices_raw = [
1.0,1.0,1.0,0.0,0.0,0.0,0.0,0.0,
1.0,1.0,-1.0,0.0,0.0,0.0,0.0,0.0,
1.0,-1.0,1.0,0.0,0.0,0.0,0.0,0.0,
1.0,-1.0,-1.0,0.0,0.0,0.0,0.0,0.0,
-1.0,1.0,1.0,0.0,0.0,0.0,0.0,0.0,
-1.0,1.0,-1.0,0.0,0.0,0.0,0.0,0.0,
-1.0,-1.0,1.0,0.0,0.0,0.0,0.0,0.0,
-1.0,-1.0,-1.0,0.0,0.0,0.0,0.0,0.0
];

const asset_sm_cube_indices_raw = [
6,0,4,2,0,6,
6,4,7,4,5,7,
4,0,5,5,0,1,
7,5,3,5,1,3,
3,6,7,2,6,3,
1,2,3,0,2,1
];

export const e_asset_sm_cube_vertices = new Float32Array(asset_sm_cube_vertices_raw);
export const e_asset_sm_cube_indices = new Uint16Array(asset_sm_cube_indices_raw);