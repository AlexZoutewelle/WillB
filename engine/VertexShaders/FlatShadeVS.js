function FlatShadeVS(renderer) {
  this.lightDirection = new Vector3(1,0,0);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.1, 0.0, 0.1);
  this.color = new Vector3(0.7, 0.7, 0.5);
  this.rot = new Transformation();

  renderer.setVertexShader(this);
}

FlatShadeVS.prototype.newModel = function(newModel) {

}

FlatShadeVS.prototype.move = function(x,y,z) {
    this.rot.fields = this.rot.rotate(x*8, y*8, z*8);


  this.lightDirection = this.rot.multMatrixVec3(this.lightDirection);
  this.rot = new Transformation();
}

FlatShadeVS.prototype.getVertex = function(vertex_in, camera_inverse) {


  var d =  this.diffuse.multiplyScalar(Math.max(0, this.lightDirection.dot(vertex_in.normal)));

  var color = this.color.multiplyVector(d.addVector(this.ambient)).multiplyScalar(255);

  // color.position[0] = Math.trunc(color.position[0]);
  // color.position[1] = Math.trunc(color.position[1]);
  // color.position[2] = Math.trunc(color.position[2]);


  vertex_in.color = color;
  vertex_in.position = camera_inverse.multMatrixVec3(vertex_in.position);

  return vertex_in;
}
