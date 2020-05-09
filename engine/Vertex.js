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

 function interpolateTo(v0, v1, v2, alpha) {
  var v0Pos = v0.position;
  var v1Pos = v1.position;
  var v2Pos = v2.position;
  Object.keys(v1).forEach(function (key, index) {

    //Use this for vertex attributes, except for ID and Position. If you want to interpolate positions using the interpolateTo functionality,
    //use its Vector3 counterpart
    if(key !== 'id' && key !== 'position') {

        //Recover perspective corrected attributes, by undoing the division by w
        var v2Attribute = Reflect.getOwnPropertyDescriptor(v2, key).value.multiplyScalar(v2Pos.position[3]);
        var v1Attribute = Reflect.getOwnPropertyDescriptor(v1, key).value.multiplyScalar(v1Pos.position[3]);

        var result = v1Attribute.interpolateTo(v2Attribute, alpha);

        //Redo perspective correction, by dividing by the v0's w
        result = result.multiplyScalar(1/v0Pos.position[3]);

      }
    Reflect.set(v0, key, result)

  });

  v0.position = v0Pos;
  return v0;
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
