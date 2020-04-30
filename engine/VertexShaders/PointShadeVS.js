var moveSpeed = 0.0025;

function PointShadeVS() {
  this.lightPosition = new Vector3(0,1,0);
  this.pos = new Transformation();
  this.color = new Vector3(0.4, 0.8, 0.7);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.50,0.5,0.1);

  this.attenuationA = 0.1
  this.attenuationB = 0.519;
  this.attenuationC = 1;

  //Load a sphere model for the point light
  var sphereReq = mdlLoad.loadObject("models/smallcube.obj");
  sphereReq.then(result => {
    result.id = 'pl1';
    this.setIndicator(result)

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

PointShadeVS.prototype.movePointLight = function() {
  if(playerState.input.i === true) {
    this.pos.fields = this.pos.translate(0, 0, moveSpeed);
    for(var i = 0; i < this.indicator.positions.length; i++) {
      this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);

    }

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.j === true) {
    this.pos.fields = this.pos.translate(-moveSpeed, 0 , 0);
    for(var i = 0; i < this.indicator.positions.length; i++) {
      this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);

    }

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.k === true) {
    this.pos.fields = this.pos.translate(0, 0, -moveSpeed);
    for(var i = 0; i < this.indicator.positions.length; i++) {
      this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);

    }

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.l === true) {
    this.pos.fields = this.pos.translate(moveSpeed, 0, 0 );
    for(var i = 0; i < this.indicator.positions.length; i++) {
      this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);

    }

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.u === true) {
    this.pos.fields = this.pos.translate(0, moveSpeed, 0 );
    for(var i = 0; i < this.indicator.positions.length; i++) {
      this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);

    }

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }
  if(playerState.input.o === true) {
    this.pos.fields = this.pos.translate(0, -moveSpeed, 0 );
    for(var i = 0; i < this.indicator.positions.length; i++) {
      this.indicator.positions[i] = this.pos.multMatrixVec3(this.indicator.positions[i]);

    }

    this.lightPosition = this.pos.multMatrixVec3(this.lightPosition);
  }

  this.pos = new Transformation();
}


PointShadeVS.prototype.getVertex = function(vertex_in, camera_inverse) {

  this.movePointLight();

  if(this.pl_flag === false) {
    // var lightPosition = camera_inverse.multMatrixVec3(this.lightPosition);
    var lightPosition = this.lightPosition;
    var vertex_to_light = lightPosition.subtractVector(vertex_in.position);

    var distance = vertex_to_light.length();

    if(distance > 10) {
      //console.log(true)
    }
    var direction = vertex_to_light.divideScalar(distance);

    //Distance attenuation,  1 / Ad^2 + Bd + c,   simplified: 1/ d(Ad + B +C)
    var attenuation = 1 / ( (this.attenuationA * (distance/100)**2) + (this.attenuationB * (distance/10)) + this.attenuationC);


    var d = this.diffuse.multiplyScalar( attenuation  *  Math.max(0, vertex_in.normal.dot(direction)) );
    var c = this.color.multiplyVector( d.addVector(this.ambient) ).multiplyScalar(255);

    vertex_in.color = c;

  }
  else {
    vertex_in.color = new Vector3(255,255,255,255);
  }

  vertex_in.position = camera_inverse.multMatrixVec3(vertex_in.position);


  return vertex_in;

}
