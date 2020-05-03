function VertexPositionPS(renderer) {
  renderer.setPixelShader(this);
}

VertexPositionPS.prototype.newModel = function(model) {
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
VertexPositionPS.prototype.getVertex = function(vert_in, w0, w1, w2, v0, v1, v2) {
  if(vert_in.position.position[0] === v0.position.position[0] || vert_in.position.position[0] === v1.position.position[0] || vert_in.position.position[0] === v2.position.position[0]) {
    if(vert_in.position.position[1] === v0.position.position[1] || vert_in.position.position[1] === v1.position.position[1] || vert_in.position.position[1] === v2.position.position[1]) {
      vert_in.color = new Vector3(255,0,0);
      vert_in.color.position[3] = 255;
    }
  }

  return vert_in;
}
