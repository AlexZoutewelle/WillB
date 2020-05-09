function FlatColorEffect(renderer) {
  renderer.setPixelShader(this);
  this.renderer = renderer;
}

FlatColorEffect.prototype.newModel = function(model) {
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
FlatColorEffect.prototype.getVertex = function(vert_in, w0, w1, w2, v0, v1, v2) {

  //interpolation

  var color = new Vector3(0,0,0);
  color.position[0] = v0.color.position[0] + (w1 * (v1.color.position[0] - v0.color.position[0]) ) + (w2 * (v2.color.position[0] - v0.color.position[0]));
  color.position[1] = v0.color.position[1] + (w1 * (v1.color.position[1] - v0.color.position[1]) ) + (w2 * (v2.color.position[1] - v0.color.position[1]));
  color.position[2] = v0.color.position[2] + (w1 * (v1.color.position[2] - v0.color.position[2]) ) + (w2 * (v2.color.position[2] - v0.color.position[2]));
  vert_in.color = color

  vert_in.color = vert_in.color.multiplyScalar(vert_in.position.position[3]);
  vert_in.color.position[3] = 255;

  if(color.position[0] > 255 || color.position[1] > 255 || color.position[2] > 255) {
  }
  if(color.position[0] < 0 || color.position[1] < 0 || color.position[2] < 0) {
  }


  // if(typeof(vert_in.color) !== 'undefined') {
  //   return [vert_in.color.position[0] ,
  //           vert_in.color.position[1] ,
  //           vert_in.color.position[2] ,
  //           255];
  // }

  return vert_in;

}
