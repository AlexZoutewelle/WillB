function LightBlendPS(renderer) {
  renderer.setPixelShader(this);
}

LightBlendPS.prototype.newModel = function(model) {

}
LightBlendPS.prototype.getVertex = function(vertex, w0, w1, w2, v0, v1, v2) {
  var light = new Vector3(0,0,0);
  light.position[0] = v0.light.position[0] + (w1 * (v1.light.position[0] - v0.light.position[0]) ) + (w2 * (v2.light.position[0] - v0.light.position[0]));
  light.position[1] = v0.light.position[1] + (w1 * (v1.light.position[1] - v0.light.position[1]) ) + (w2 * (v2.light.position[1] - v0.light.position[1]));
  light.position[2] = v0.light.position[2] + (w1 * (v1.light.position[2] - v0.light.position[2]) ) + (w2 * (v2.light.position[2] - v0.light.position[2]));
  vertex.light = light;

  //console.log(vertex);
  vertex.color = vertex.color.multiplyVector(vertex.light);
  if(vertex.color.position[0] > 255) {vertex.color.position[0] = 255;}
  if(vertex.color.position[1] > 255) {vertex.color.position[1] = 255;}
  if(vertex.color.position[2] > 255) {vertex.color.position[2] = 255;}

  vertex.color.position[3] = 255;

  return vertex;
}
