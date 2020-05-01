//My first pixel pixelShader
//What this does: It gets a vertex as input. It contains all kinds of information.
//With this information, it will look up a specific spot on a texture image, and return the color of that spot

//So, it must hold a reference to a texture.
function TextureEffect(renderer) {
  renderer.setPixelShader(this);
}

TextureEffect.prototype.setTexture = function(texture) {
  this.texture = texture;
  //uv texture coords clamp
  this.texture_width = texture.width;
  this.texture_height = texture.height;
  this.tex_clamp_x = texture.width;
  this.tex_clamp_y = texture.height ;
  this.array_width = texture.width * 4;
}

TextureEffect.prototype.newModel = function(model) {
  this.setTexture(model.texture);
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
TextureEffect.prototype.getColor = function(vertex, w0, w1, w2, v0, v1, v2) {

  var uv = new Vector3(0,0,0);
  uv.position[0] = v0.uv.position[0] + (w1 * (v1.uv.position[0] - v0.uv.position[0]) ) + (w2 * (v2.uv.position[0] - v0.uv.position[0]));
  uv.position[1] = v0.uv.position[1] + (w1 * (v1.uv.position[1] - v0.uv.position[1]) ) + (w2 * (v2.uv.position[1] - v0.uv.position[1]));
  uv.position[2] = v0.uv.position[2] + (w1 * (v1.uv.position[2] - v0.uv.position[2]) ) + (w2 * (v2.uv.position[2] - v0.uv.position[2]));
  vertex.uv = uv;

  //Perspective correction: multiply all the uv coordinates by the vertex' Z position
  vertex.uv = vertex.uv.multiplyScalar(vertex.position.position[2]);


  var textureX = Math.max(Math.min(Math.trunc(vertex.uv.position[0] * this.texture_width), this.tex_clamp_x), 0);
  if(textureX < 0) {
    textureX = 0;
  }
  var textureY = Math.max(Math.min(Math.trunc(vertex.uv.position[1] * this.texture_height), this.tex_clamp_y), 0);
  if(textureY < 0) {
    textureY = 0;
  }

  var pos = (textureX * 4) + (this.array_width * textureY);
  return [this.texture.data[pos],
          this.texture.data[pos + 1],
          this.texture.data[pos + 2],
          255];
}
