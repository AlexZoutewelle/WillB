function DefaultVS(renderer) {
  renderer.setVertexShader(this);

}

DefaultVS.prototype.newModel = function(newModel) {

}


DefaultVS.prototype.getVertex = function(vertex_in, camera_inverse) {
  // if(typeof(vertex_in.uv) !== "undefined" ) {
  //   delete vertex_in.uv;
  // }
  //
  // if(typeof(vertex_in.normal) !== "undefined") {
  //   delete vertex_in.normal;
  // }
  vertex_in.position = camera_inverse.multMatrixVec3(vertex_in.position);

  return vertex_in;
}
