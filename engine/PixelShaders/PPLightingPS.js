function PPLightingPS(renderer) {
  this.lightPosition = new Vector3(-4,1,0);
  this.pos = new Transformation();
  this.color = new Vector3(1, 1, 1);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.01,0.1,0.1);

  this.attenuationA = 1.00619;
  this.attenuationB = 2.1382;
  this.attenuationC = 0.5;

  this.pl_flag = false;

  renderer.setPixelShader(this);
}

PPLightingPS.prototype.setIndicator = function(model) {
  var object_transform = new Transformation();
  object_transform.fields = object_transform.translate(
                                                      this.lightPosition.position[0],
                                                      this.lightPosition.position[1],
                                                      this.lightPosition.position[2]);

  for(var i = 0; i < model.positions.length; i++) {
    model.positions[i] = object_transform.multMatrixVec3(model.positions[i]);
  }

  this.indicator = model;
}

PPLightingPS.prototype.newModel = function(newModel) {
  if(newModel.id === 'pl1') {
    this.pl_flag = true;
  }
  else {
    this.pl_flag = false;
  }
}


PPLightingPS.prototype.move = function(x, y, z) {

  this.pos.fields = this.pos.translate(x,y,z);

  this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);


  this.pos = new Transformation();
}


PPLightingPS.prototype.getColor = function(vertex_in) {
  // this.movePointLight();
  var worldPos = vertex_in.worldPos;
  if(this.pl_flag === false) {

    var vertex_to_light = this.lightPosition.subtractVector(vertex_in.worldPos);

    var distance = vertex_to_light.length();
    if(distance <= 5) {
      var direction = vertex_to_light.divideScalar(distance);

      //Distance attenuation,  1 / Ad^2 + Bd + c,   simplified: 1/ (d(Ad + B) +C)
      var attenuation = 1 / ( (this.attenuationA * (distance * distance)) + (this.attenuationB * (distance)) + this.attenuationC);

      var d = this.diffuse.multiplyScalar( attenuation  *  Math.max(0, vertex_in.normal.dot(direction)) );
      var c = this.color.multiplyVector( d.addVector(this.ambient) ).multiplyScalar(255);

      return [Math.min(c.position[0], 255), Math.min(c.position[1], 255), Math.min(c.position[2], 255), 255];
    }
  }

  //Ambient should be the vertex' color?
  var c = this.ambient.multiplyScalar(255);

  return [c.position[0],c.position[1],c.position[2],255];
}
