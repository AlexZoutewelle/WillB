function Vertex() {

}

//Operations between vertices
Vertex.prototype.subtract = function(v2) {

  var newV = this.copy();
  var v1 = this;

  Object.keys(v1).forEach(function (key, index) {

    var result = Reflect.getOwnPropertyDescriptor(v1, key).value.subtractVector(Reflect.getOwnPropertyDescriptor(v2, key).value);

    Reflect.set(newV, key, result)

  });


  return newV;
}

Vertex.prototype.add = function(v2) {
  var newV = this.copy();
  var v1 = this;

  Object.keys(v1).forEach(function (key, index) {

    var result = Reflect.getOwnPropertyDescriptor(v1, key).value.addVector(Reflect.getOwnPropertyDescriptor(v2, key).value);

    Reflect.set(newV, key, result)

  });


  return newV;

}

Vertex.prototype.divide = function(v2) {
  var newV = this.copy();
  var v1 = this;

  Object.keys(v1).forEach(function (key, index) {

    var result = Reflect.getOwnPropertyDescriptor(v1, key).value.divideVector(Reflect.getOwnPropertyDescriptor(v2, key).value);

    Reflect.set(newV, key, result)

  });


  return newV;

}

Vertex.prototype.multiply = function(v2) {
  var newV = this.copy();
  var v1 = this;

  Object.keys(v1).forEach(function (key, index) {

    var result = Reflect.getOwnPropertyDescriptor(v1, key).value.multiplyVector(Reflect.getOwnPropertyDescriptor(v2, key).value);

    Reflect.set(newV, key, result)

  });


  return newV;

}

Vertex.prototype.interpolateTo = function(v2, alpha) {
  var newV = this.copy();
  var v1 = this;

  // Object.keys(v1).forEach(function (key, index) {
  //   //console.log(key);
  // //   if(key !== 'id' && key !== 'normal') {
  // //
  // //   var result = Reflect.getOwnPropertyDescriptor(v1, key).value.interpolateTo(Reflect.getOwnPropertyDescriptor(v2, key).value, alpha);
  // //   }
  // //   Reflect.set(newV, key, result)
  // //
  // // });
  // //
  // //
  // // return newV;


  var result = this.copy();
  result.position = this.position.interpolateTo(v2.position, alpha);
  result.uv = this.uv.interpolateTo(v2.uv, alpha);
  return result;
}

Vertex.prototype.divideScalar = function(scalar) {
  var newV = this.copy();
  var v1 = this;

  Object.keys(v1).forEach(function (key, index) {


    var result = Reflect.getOwnPropertyDescriptor(v1, key).value.divideScalar(scalar);

    Reflect.set(newV, key, result)

  });


  return newV;
}

Vertex.prototype.multiplyScalar = function(scalar) {
  var newV = this.copy();
  var v1 = this;

  Object.keys(v1).forEach(function (key, index) {
    if(key === 'normal' || key === 'color') {
    }
    else {
      var result = Reflect.getOwnPropertyDescriptor(v1, key).value.multiplyScalar(scalar);

      Reflect.set(newV, key, result)
    }


  });


  return newV;
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
