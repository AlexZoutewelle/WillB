function FlatColorVS(renderer) {
  renderer.setVertexShader(this);

  this.color = new Vector3(0, 120, 214);
}

FlatColorVS.prototype.newModel = function(newModel) {

}


FlatColorVS.prototype.getVertex = function(vertex_in, camera_inverse) {
  // if(typeof(vertex_in.uv) !== "undefined" ) {
  //   delete vertex_in.uv;
  // }
  //
  // if(typeof(vertex_in.normal) !== "undefined") {
  //   delete vertex_in.normal;
  // }
  vertex_in.color = this.color;
  // vertex_in.position = camera_inverse.multMatrixVec3(vertex_in.position);

  return vertex_in;
}
