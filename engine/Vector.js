function Vector3(x,y,z) {
  this.position = [x || 0, y || 0, z || 0, 1];
}

Vector3.prototype.copy = function() {
  var result = new Vector3();
  result.position[0] = this.position[0];
  result.position[1] = this.position[1];
  result.position[2] = this.position[2];
  return result;
}

Vector3.prototype.absolute = function() {
  var result = new Vector3();
  result.position[0] = Math.abs(this.position[0]);
  result.position[1] = Math.abs(this.position[1]);
  result.position[2] = Math.abs(this.position[2]);
  return result;

}
Vector3.prototype.translate = function (x,y,z) {
  this.position[0] += x;
  this.position[1] += y;
  this.position[2] += z;
  return this;
  //return new Vector(this.x + x, this.position[1] + y, this.position[2] + z);
}

Vector3.prototype.dot = function(vector) {
  var sum = 0;
  sum += this.position[0] * vector.position[0];
  sum += this.position[1] * vector.position[1];
  sum += this.position[2] * vector.position[2];

  return sum;
}

Vector3.prototype.cross = function(vector) {
  var result = new Vector3();
  result.position[0] = (this.position[1] * vector.position[2]) - (vector.position[1] * this.position[2]);
  result.position[1] = (this.position[2] * vector.position[0]) - (vector.position[2] * this.position[0]) ;
  result.position[2] = (this.position[0] * vector.position[1]) - (vector.position[0] * this.position[1]);

  return result;
}

Vector3.prototype.normalize = function() {
  var length = Math.sqrt( (this.position[0] **2) + (this.position[1] ** 2) + (this.position[2] **2) );
  this.position[0] /= length;
  this.position[1] /= length;
  this.position[2] /= length;
  return this;
}

Vector3.prototype.length = function() {
  return Math.sqrt( (this.position[0] **2) + (this.position[1] ** 2) + (this.position[2] **2) );
}

Vector3.prototype.multiplyVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] * vector.position[0];
  result.position[1] = this.position[1] * vector.position[1];
  result.position[2] = this.position[2] * vector.position[2];
  return result;
}

Vector3.prototype.divideVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] / vector.position[0];
  result.position[1] = this.position[1] / vector.position[1];
  result.position[2] = this.position[2] / vector.position[2];
  return result;
}
Vector3.prototype.subtractVector = function(vector, w) {
  var result = new Vector3();
  result.position[0] = this.position[0] - vector.position[0];
  result.position[1] = this.position[1] - vector.position[1];
  result.position[2] = this.position[2] - vector.position[2];
  if(w) {
    result.position[3] = this.position[3] - vector.position[3];
  }
  return result;
}

Vector3.prototype.addVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] + vector.position[0];
  result.position[1] = this.position[1] + vector.position[1];
  result.position[2] = this.position[2] + vector.position[2];
  result.position[3] = this.position[3] + vector.position[3];

  return result;
}

Vector3.prototype.multiplyScalar = function(scalar, w) {
  var result = new Vector3();
  result.position[0] = this.position[0] * scalar;
  result.position[1] = this.position[1] * scalar;
  result.position[2] = this.position[2] * scalar;
  if(w) {
    result.position[3] = this.position[3] * scalar;
  }
  else {
    result.position[3] = this.position[3];
  }

  return result;
}

Vector3.prototype.divideScalar = function(scalar) {
  var result = new Vector3();
  result.position[0] = this.position[0] / scalar;
  result.position[1] = this.position[1] / scalar;
  result.position[2] = this.position[2] / scalar;
  result.position[3] = this.position[3];
  return result;

}



Vector3.prototype.interpolateTo = function(vector, alpha) {
  var result = new Vector3();


  result = this.addVector(vector.subtractVector(this, true).multiplyScalar(alpha, true));

  return result;
}

function Vector2(x,y) {
  this.position = [x || 0, y || 0];
}

Vector2.prototype.addScalar = function(scalar, position) {
  var result = new Vector2();
  if(position) {
    result.position[position] += scalar;
  }
  else {
    result.position[0] += scalar;
    result.position[1] += scalar;
  }

  return result;
}

Vector2.prototype.addVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] + vector.position[0];
  result.position[1] = this.position[1] + vector.position[1];
  return result;
}

Vector2.prototype.divideScalar = function(scalar) {
  var result = new Vector2();
  result.position[0] = this.position[0] / scalar;
  result.position[1] = this.position[1] / scalar;
  return result;
}

Vector2.prototype.subtractScalar = function(scalar, axis) {
  var result = new Vector2();
  if(axis) {
    result.position[axis] = this.position[axis] - scalar;
  }
  else {
    result.position[0] = this.position[0] - scalar;
    result.position[1] = this.position[1] - scalar;
  }
  return result;
}

Vector2.prototype.multiplyScalar = function(scalar) {
  var result = new Vector2();
  result.position[0] = this.position[0] * scalar;
  result.position[1] = this.position[1] * scalar;
  return result;
}

Vector2.prototype.subtractVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] - vector.position[0];
  result.position[1] = this.position[1] - vector.position[1];
  return result;
}

Vector2.prototype.divideVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] / vector.position[0];
  result.position[1] = this.position[1] / vector.position[1];
  return result;
}

Vector2.prototype.multiplyVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] * vector.position[0];
  result.position[1] = this.position[1] * vector.position[1];
  return result;
}

Vector2.prototype.interpolateTo = function(vector, alpha) {
  return this.addVector(vector.subtractVector(this).multiplyScalar(alpha));
}
