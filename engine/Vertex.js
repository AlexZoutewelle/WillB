function Vertex(id, normal, uv) {
  this.id = id || 0;
  this.position = new Vector3();
  this.normal = normal || new Vector3();
  this.uv = uv || new Vector2();
}

//Operations between vertices
Vertex.prototype.subtract = function(vertex) {
  this.position = this.position.subtractVector(vertex.position);
  this.uv = this.uv.subtractVector(vertex.uv);
  return this;
}

Vertex.prototype.add = function(vertex) {
  this.position = this.position.addVector(vertex.position);
  this.uv = this.uv.addVector()(vertex.uv);
}

Vertex.prototype.divide = function(vertex) {
  this.position = this.position.divideVector(vertex.position);
  this.uv = this.position.divideVector(vertex.uv);
}

Vertex.prototype.multiply = function(vertex) {
  this.position = this.position.multiplyVector(vertex.position);
  this.uv = this.uv.multiplyVector(vertex.uv);
}

Vertex.prototype.interpolateTo = function(vertex, alpha) {
  var result = new Vertex();
  result.position = this.position.interpolateTo(vertex.position, alpha);
  result.uv = this.uv.interpolateTo(vertex.uv, alpha);
  return result;
}
