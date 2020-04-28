function TextureVS() {
}

TextureVS.prototype.newModel = function(newModel) {

}


TextureVS.prototype.getVertex = function(vertex_in) {

  //Perspective correction
  vertex_in.uv = vertex_in.uv.divideScalar(vertex_in.position.position[2]);

  return vertex_in;
}
