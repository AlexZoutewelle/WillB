function FlatShadeVS() {
  this.lightDirection = new Vector3(0,0,1);
  this.diffuse = new Vector3(1,1,1);
  this.ambient = new Vector3(0.1, 0.1, 0.1);
  this.color = new Vector3(0.8, 0.85, 1);
}

FlatShadeVS.prototype.newModel = function(newModel) {

}

FlatShadeVS.prototype.getVertex = function(vertex_in) {

  var d =  this.diffuse.multiplyScalar(-this.lightDirection.dot(vertex_in.normal));
  var color = this.color.multiplyVector(d.addVector(this.ambient)).multiplyScalar(255);

  vertex_in.color = color;
  return vertex_in;
}
