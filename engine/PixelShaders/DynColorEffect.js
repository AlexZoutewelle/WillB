function DynColorEffect(renderer) {
  this.screenWidth = 640;
  this.screenHeight = 480;

  renderer.setPixelShader(this);
}

DynColorEffect.prototype.newModel = function(model) {
}

DynColorEffect.prototype.getColor = function(vert_in) {
  var zInv = 1 / vert_in.position.position[2]

  var color = vert_in.color;
  // color.position[0] < 0 ? color.position[0] = 0 : color.position[0] = color.position[0];
  // color.position[1] < 0 ? color.position[1] = 0 : color.position[1] = color.position[1];
  // color.position[2] < 0 ? color.position[2] = 0 : color.position[2] = color.position[2];

  var position = vert_in.position;

  var max = color.position[0];
  if(color.position[1] >= color.position[0] && color.position[1] >= color.position[2]){
    max = color.position[1];
  }
  if(color.position[2] >= color.position[0] && color.position[2] >= color.position[0]) {
    max = color.position[2];
  }



  //cos for x and y. You get a ratio for the R
  var posX = position.position[0];
  var posY = position.position[1];
  var posZ = zInv;

  if(posX < 0) {posX = 0}
  if(posX > this.screenWidth) {posX = this.screenWidth}
  if(posY < 0) {posY = 0}
  if(posY > this.screenHeight) {posY = this.screenHeight}
  if(posZ < 0) {posX = 0}



  var r_v = -(1/this.screenWidth) * posX + 1;
  var r = Math.trunc(r_v * max);
  if(r < 0) {r = 0;}

  var g_v = -(1/this.screenHeight) * posY + 1;
  var g = Math.trunc(g_v * max);
  if(g < 0) {g =0;}

  var b_v = -(1/this.screenHeight) * posZ + 1;
  var b = Math.trunc(max - posZ);
  if(b < 0) {b = 0;}

  return [r ,
          g,
          b,
          255];
}
