function WireFramePS(renderer) {
  renderer.setPixelShader(this);
}

WireFramePS.prototype.newModel = function(model) {
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
WireFramePS.prototype.getVertex = function(vert_in, w0, w1, w2, v0, v1, v2) {
  //console.log(w0);
  w0 = w0 - Math.floor(w0);
  w1 = w1 - Math.floor(w1);
  w2 = w2 - Math.floor(w2);

  //console.log(w0 + " " + w1 + "  " + w2);
  if(w0 < 0.01 || w1 < 0.01 || w2 < 0.01) {
    vert_in.color = new Vector3(255,255,255);
    vert_in.color.position[3] = 255;
  }

  return vert_in;
}
