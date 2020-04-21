//My first pixel pixelShader
//What this does: It gets a vertex as input. It contains all kinds of information.
//With this information, it will look up a specific spot on a texture image, and return the color of that spot

//So, it must hold a reference to a texture.
function TextureEffect() {

}

TextureEffect.prototype.setTexture = function(texture) {
  this.texture = texture;
  //uv texture coords clamp
  this.texture_width = texture.width;
  this.texture_height = texture.height;
  this.tex_clamp_x = texture.width - 1.0;
  this.tex_clamp_y = texture.height -1.0;
}

TextureEffect.prototype.newModel = function(model) {
  this.setTexture(model.texture);
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
TextureEffect.prototype.getColor = function(vert_in) {

  var z = 1 / vert_in.position.position[2];
  var vertex = vert_in.multiplyScalar(-z);

  var textureX = Math.max(Math.min(Math.trunc(vertex.uv.position[0] * this.texture_width), this.tex_clamp_x), 0);
  if(textureX < 0) {
    textureX = 0;
  }
  var textureY = Math.max(Math.min(Math.trunc(vertex.uv.position[1] * this.texture_height), this.tex_clamp_y), 0);
  if(textureY < 0) {
    textureY = 0;
  }

  var pos = (textureX * 4) + (this.texture_width * textureY * 4);

  return [this.texture.data[pos],
          this.texture.data[pos + 1],
          this.texture.data[pos + 2],
          this.texture.data[pos + 3]];
}
