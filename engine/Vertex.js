function Vertex(position, normal, uv) {
  this.position = position || new Vector3();
  this.normal = normal || new Vector3();
  this.uv = uv || new Vector2();
}

//Operations between vertices
Vertex.prototype.subtract = function(vertex) {
  var result = this.copy();
  result.position = this.position.subtractVector(vertex.position);
  result.uv = this.uv.subtractVector(vertex.uv);
  return result;
}

Vertex.prototype.add = function(vertex) {
  var result = this.copy();

  result.position = this.position.addVector(vertex.position);
  result.uv = this.uv.addVector(vertex.uv);
  return result;

}

Vertex.prototype.divide = function(vertex) {
  var result = this.copy();

  result.position = this.position.divideVector(vertex.position);
  result.uv = this.uv.divideVector(vertex.uv);
  return result;

}

Vertex.prototype.multiply = function(vertex) {
  var result = this.copy();

  result.position = this.position.multiplyVector(vertex.position);
  result.uv = this.uv.multiplyVector(vertex.uv);
  return result;

}

Vertex.prototype.interpolateTo = function(vertex, alpha) {
  var result = this.copy();
  result.position = this.position.interpolateTo(vertex.position, alpha);
  result.uv = this.uv.interpolateTo(vertex.uv, alpha);
  return result;
}

Vertex.prototype.divideScalar = function(scalar) {
  var result = this.copy();

  result.position = this.position.divideScalar(scalar);
  result.uv = this.uv.divideScalar(scalar);
  return result;
}

Vertex.prototype.multiplyScalar = function(scalar) {
  var result = this.copy();

  result.position = this.position.multiplyScalar(scalar);
  result.uv = this.uv.multiplyScalar(scalar);
  return result;
}

Vertex.prototype.copy = function() {
  var newV = new Vertex();
  var orig = this;
  Object.keys(orig).forEach(function (key, index) {
    Reflect.defineProperty(newV, key, Reflect.getOwnPropertyDescriptor(orig, key));
    // console.log (key + " " + index);
  });

  return newV;
}
