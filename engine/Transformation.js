/*
* This is for all transformations
* [1 0 0 0
*  0 1 0 0
*  0 0 1 0
*  0 0 0 1]
*
2. objects must be able to transform in world coordinates
*   it must be able to move around
*
*   it must be able to rotate around z, y, and x
*
*   it must be able to scale
*
*
*
*/

function Transformation(fields) {
  if(typeof(fields) !== "undefined") {
    this.fields = fields;
  }
  else {
    this.fields = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
}

/**
* Get a row from a matrix.
* Remember, we are working with 4x4 matrices.
**/
Transformation.prototype.getRow = function(i) {
  return [
    this.fields[i * 4],
    this.fields[i * 4 + 1],
    this.fields[i * 4 + 2],
    this.fields[i * 4 + 3]
  ];
}

/**
* Get a column from a matrix
* Rememeber, we are working with 4x4 matrices
**/
Transformation.prototype.getColumn = function(i) {
  return [
    this.fields[i],
    this.fields[i + (4 * 1)],
    this.fields[i + (4 * 2)],
    this.fields[i + (4 * 3)]
  ];
}

/**
* Multiply this (a Transformation matrix) with another one
**/
Transformation.prototype.multiply = function(matrix) {
  var result = new Transformation();
  for(var row = 0; row < 4; row++){
    for(var col = 0; col < 4; col++) {
      var sum = 0;

      for( var i = 0; i < 4; i++) {
          sum +=
              this.fields[(row * 4) + i]   //select all numbers on row
              *
              matrix.fields[col + (4 * i)]; // select all numbers on column
      }
      result.fields[row * 4 + col] = sum;
    }
  }

  return result;
}

/**
* Return the inverse of a matrix
*
* 1 5 9  13
* 2 6 10 14
* 3 7 11 15
* 4 8 12 16
**/
Transformation.prototype.inverse = function() {

  //Make a copy so we don't lose data
  var copy = new Transformation(this.fields);

  //Do the inverse
  for(var col = 0; col < 4; col++) {
    for(var i = 0; i < 4; i++) {
      this.fields[(col * 4) + i] = copy.fields[(i * 4) + col]
    }
  }

  return this;
}


/**
*
* Multiply this Matrix4 with a Vector3
*/

Transformation.prototype.multVec3 = function(vector){
  result = new Vector3(1,1,1);

  for(var row = 0; row < 3; row++) {
    var sum = 0;
    for(var i = 0; i < 3; i++) {
      sum += this.fields[(row * 4) + i] * result.fields[row];
    }
    result.fields[row] = sum;
  }

  return result;
}
