function PPLightingPS(renderer) {
  this.lightPosition = new Vector3(-4,1,0);
  this.pos = new Transformation();
  this.color = new Vector3(1, 1, 1);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.01,0.01,0.01);

  this.attenuationA = 0.00619;
  this.attenuationB = 0.21382;
  this.attenuationC = 0.5;

  this.pl_flag = true;

  renderer.setPixelShader(this);
  this.renderer = renderer;

  //Load a sphere model for the point light
  var sphereReq = mdlLoad.loadObject("models/smallcube.obj");
  sphereReq.then(result => {
    result.id = 'pl1';
    this.setIndicator(result)

    renderer.models.push(result);
    renderer.setVertexShader(this);

  });


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
    this.pl_flag = false;
  }
  else {
    this.pl_flag = true;
  }
}

PPLightingPS.prototype.move = function(x, y, z) {

  this.pos.fields = this.pos.translate(x,y,z);

  this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);

  for(var i = 0; i < this.indicator.positions.length; i++) {
    this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);
  }

  this.pos = new Transformation();
}


PPLightingPS.prototype.getColor = function(vertex_in, w0, w1, w2, v0, v1, v2) {
  //Interpolation
  var normal = new Vector3(0,0,0);
  normal.position[0] = v0.normal.position[0] + (w1 * (v1.normal.position[0] - v0.normal.position[0]) ) + (w2 * (v2.normal.position[0] - v0.normal.position[0]));
  normal.position[1] = v0.normal.position[1] + (w1 * (v1.normal.position[1] - v0.normal.position[1]) ) + (w2 * (v2.normal.position[1] - v0.normal.position[1]));
  normal.position[2] = v0.normal.position[2] + (w1 * (v1.normal.position[2] - v0.normal.position[2]) ) + (w2 * (v2.normal.position[2] - v0.normal.position[2]));
  vertex_in.normal = normal.multiplyScalar(vertex_in.position.position[2]).normalize();
  //p.normal = normal.normalize();


  var worldPos = new Vector3(0,0,0);
  worldPos.position[0] = v0.worldPos.position[0] + (w1 * (v1.worldPos.position[0] - v0.worldPos.position[0]) ) + (w2 * (v2.worldPos.position[0] - v0.worldPos.position[0]));
  worldPos.position[1] = v0.worldPos.position[1] + (w1 * (v1.worldPos.position[1] - v0.worldPos.position[1]) ) + (w2 * (v2.worldPos.position[1] - v0.worldPos.position[1]));
  worldPos.position[2] = v0.worldPos.position[2] + (w1 * (v1.worldPos.position[2] - v0.worldPos.position[2]) ) + (w2 * (v2.worldPos.position[2] - v0.worldPos.position[2]));
  vertex_in.worldPos = worldPos.multiplyScalar(vertex_in.position.position[2]);


  var worldPos = vertex_in.worldPos;
  if(this.pl_flag === true) {

    var vertex_to_light = this.lightPosition.subtractVector(vertex_in.worldPos);

    var distance = vertex_to_light.length();

    if(distance <= 1000) {

      var direction = vertex_to_light.divideScalar(distance);

      var intensity = vertex_in.normal.dot(direction);

      if(intensity !== 0 ) {
        //Distance attenuation,  1 / Ad^2 + Bd + c,   simplified: 1/ (d(Ad + B) +C)
        var attenuation = ( (this.attenuationA * (distance * distance)) + (this.attenuationB * (distance)) + this.attenuationC);

        var d = this.diffuse.multiplyScalar(Math.max(0, intensity) / attenuation );
        var c = this.color.multiplyVector( d.addVector(this.ambient) ).multiplyScalar(255);

        return [Math.min(c.position[0], 255), Math.min(c.position[1], 255), Math.min(c.position[2], 255), 255];
      }
    }

    //Ambient should be the vertex' color?
    var c = this.ambient.multiplyScalar(255);

    return [c.position[0],c.position[1],c.position[2],255];

  }

  return [255,255,255,255];


}
