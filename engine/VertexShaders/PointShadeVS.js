
function PointShadeVS(renderer) {
  this.lightPosition = new Vector3(0,0,5   );
  this.pos = new Transformation();
  this.color = new Vector3(1, 1, 1);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.10,0.12,0.1);

  this.attenuationA = 0.00619
  this.attenuationB = 0.01382;
  this.attenuationC = 0.1;

  //Load a sphere model for the point light
  var sphereReq = mdlLoad.loadObject("models/smallcube.obj");
  sphereReq.then(result => {
    result.id = 'pl1';
    this.setIndicator(result)
    delete result.uvs;
    renderer.models.push(result);
    renderer.setVertexShader(this);

  });

  this.pl_flag = false;
}

//The point shader should be associated with a model, preferably a sphere. Light will be emanated from this object
PointShadeVS.prototype.setIndicator = function(model) {

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

PointShadeVS.prototype.newModel = function(newModel) {
  if(newModel.id === 'pl1') {
    this.pl_flag = true;
  }
  else {
    this.pl_flag = false;
  }

}

PointShadeVS.prototype.move = function(x,y,z) {
  this.pos.fields = this.pos.translate(x,y,z);

  this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);

  for(var i = 0; i < this.indicator.positions.length; i++) {
    this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);
  }

  this.pos = new Transformation();
}


PointShadeVS.prototype.getVertex = function(vertex_in, camera_inverse) {


  if(this.pl_flag === false) {
    // var lightPosition = camera_inverse.multMatrixVec3(this.lightPosition);
    var lightPosition = this.lightPosition;
    var vertex_to_light = lightPosition.subtractVector(vertex_in.worldPos);

    var distance = vertex_to_light.length();

    var direction = vertex_to_light.divideScalar(distance);

    //Distance attenuation,  1 / Ad^2 + Bd + c,   simplified: 1/ d(Ad + B +C)
    var attenuation = 1 / ( (this.attenuationA * (distance)**2) + (this.attenuationB * (distance)) + this.attenuationC);


    var d = this.diffuse.multiplyScalar( attenuation  *  Math.max(0, vertex_in.normal.dot(direction)) );
    vertex_in.light = d.addVector(this.ambient);
    //console.log(vertex_in.light.position[0] + " " + vertex_in.light.position[1] + " " + vertex_in.light.position[2]);
    // var c = this.color.multiplyVector( d.addVector(this.ambient) ).multiplyScalar(255);
    //
    // c.position[0] = Math.min(255, c.position[0]);
    // c.position[1] = Math.min(255, c.position[1]);
    // c.position[2] = Math.min(255, c.position[2]);
    //
    //
    // vertex_in.color = c;
    return vertex_in;

  }
  else {
    vertex_in.color = new Vector3(255,255,255,255);
    //console.log(vertex_in)
    return vertex_in;

  }
}
