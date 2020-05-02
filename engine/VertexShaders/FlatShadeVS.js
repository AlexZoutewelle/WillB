function FlatShadeVS(renderer) {
  this.lightDirection = new Vector3(1,0,0);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.2, 0.2, 0.2);
  this.color = new Vector3(0.7, 0.7, 0.5);
  this.rot = new Transformation();

  renderer.setVertexShader(this);
}

FlatShadeVS.prototype.newModel = function(newModel) {

}

FlatShadeVS.prototype.move = function(x,y,z) {
    this.rot.fields = this.rot.rotate(z*8, x*8, y*8);


  this.lightDirection = this.rot.multMatrixVec3(this.lightDirection);
  this.rot = new Transformation();
}

FlatShadeVS.prototype.getVertex = function(vertex_in, camera_inverse) {


  var d =  this.diffuse.multiplyScalar(Math.max(0, this.lightDirection.dot(vertex_in.normal)));

  var light = (d.addVector(this.ambient));


  vertex_in.light = light

  return vertex_in;
}
