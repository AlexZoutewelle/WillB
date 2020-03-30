/*
* This is for all transformations
* [1 0 0 0
*  0 1 0 0
*  0 0 1 0
*  0 0 0 1]
*
*1. model is in world coordinates
*   we must transform to camera coordinates
*     Transformation.prototype.inverse (matrix)  for the cameraToWorld transformations
*
*
*
*
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

function Transformation() {
  this.fields = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
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
* Multiply this (a Transformation matrix) another one
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
