function TextureVS(renderer) {
  renderer.setVertexShader(this);
}

TextureVS.prototype.newModel = function(newModel) {

}


TextureVS.prototype.getVertex = function(vertex_in, camera_inverse) {

  //Perspective correction
  if(typeof(vertex_in.uv) === "undefined") {
    return vertex_in;
  }

  vertex_in.uv = vertex_in.uv.multiplyScalar(1/vertex_in.position.position[3]);
  return vertex_in;
}
