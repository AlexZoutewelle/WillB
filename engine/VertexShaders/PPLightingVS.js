function PPLightingVS(renderer) {
  renderer.setVertexShader(this);

}


PPLightingVS.prototype.newModel = function(model) {

}

PPLightingPS.prototype.movePointLight = function() {
  var moveSpeed = 0.000005;
  if(playerState.input.i === true) {
    this.pos.fields = this.pos.translate(0, 0, moveSpeed);


    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.j === true) {
    this.pos.fields = this.pos.translate(-moveSpeed, 0 , 0);


    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.k === true) {
    this.pos.fields = this.pos.translate(0, 0, -moveSpeed);

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.l === true) {
    this.pos.fields = this.pos.translate(moveSpeed, 0, 0 );

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.u === true) {
    this.pos.fields = this.pos.translate(0, moveSpeed, 0 );


    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.o === true) {
    this.pos.fields = this.pos.translate(0, -moveSpeed, 0 );


    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }

  this.pos = new Transformation();
}

PPLightingVS.prototype.getVertex = function(vertex_in, camera_inverse) {

  //We'll need to interpolate the vertex normal, and its position in the world.
  //This means we need to preserve the current position
  vertex_in.worldPos = vertex_in.position.copy();

  //Take the inverse of the camera
  vertex_in.position = camera_inverse.multMatrixVec3(vertex_in.position);

  //Now, prepare the relevant attributes for interpolation by dividing by the z position
  vertex_in.worldPos = vertex_in.worldPos.divideScalar(vertex_in.position.position[2]);
  vertex_in.normal = vertex_in.normal.divideScalar(vertex_in.position.position[2]);

  return vertex_in;

}
