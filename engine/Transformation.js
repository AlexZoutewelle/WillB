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
    this.fields = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  }
}

/**
* Get a row from a matrix.
**/
Transformation.prototype.getRow = function(i) {
  return [
    this.fields[i],
  ];
}

/**
* REWORK:   2D ARRAY
**/
Transformation.prototype.multiply = function(matrix) {
  var result = new Transformation();
  for(var row = 0; row < 4; row++){
    for(var col = 0; col < 4; col++) {
      var sum = 0;

      for( var i = 0; i < 4; i++) {
          sum +=
              this.fields[row][i]   //select all numbers on row
              *
              matrix.fields[col][4]; // select all numbers on column
      }
      result.fields[row][col] = sum;
    }
  }

  return result;
}

/**
* Return the inverse of a matrix
*
* 4 8 12 16     0   i = 0     i * 5           /delen door 4   1 2 3 4     * 2 = 2 , 4, 6, 8
* 2 6 10 14     5   i = 1     i * 5 = 5
* 3 7 11 15     10  i = 2     i * 5 = 10
* 1 5 9  13     15  i = 3     i * 5 = 15
**/
Transformation.prototype.inverse = function() {

  var result = new Transformation();

  //The goal is: turn this into an identity matrix.
  //But, at the same time, do those operations on an already existing identity matrix (called result here)
  //That transformed identity matrix (result) will be our inversion (it's called result for a reason)

  //First: check if the current matrix is invertable at all. We must constantly do that, otherwise we might run into an error

  for(var i = 0; i < 4; i++) {
    for(var j = 0; j < 4; j++) {
      if( j != i ) {
        var temp =  this.fields[j][i] / this.fields[i][i];     //i * 5  is the pivot index
        if(!isFinite(temp)){
          temp = 0;
        }
        //temp = 2/4
        //so  2 - 2/4 * 2
        //and 6 - 2/4 * 2
        for(var k = 0; k < 4; k++) {
          // console.log("original value: " + this.fields[j][k] + " index: " + j + "," + k);
          // console.log("value we multiply: " + this.fields[i][k]  + " index: " + i + "," + k);
          // console.log("multiplication: " + (this.fields[i][k]) * temp);
          this.fields[j][k] = this.fields[j][k] - (this.fields[i][k] * temp)
          result.fields[j][k] = result.fields[j][k] - (result.fields[i][k] * temp);
                        //2             4             2/4
                        //6             8             2/4
                        //10            12            2/4
                        //14            16            2/4
        }
      }
    }
    // console.log("i: "  + i + " is done");
    // console.log(this.fields[0] + "\n" + this.fields[1] + "\n" + this.fields[2] + "\n" + this.fields[3]);
  }

  //DIVISION! We now only have the diagonals. To make it an identity matrix, we must divide them too.
  for(var i = 0; i < 4; i++) {
    var leftOver = this.fields[i][i];
    for(var j = 0; j < 4; j++) {
      this.fields[i][j] = this.fields[i][j] / leftOver;
      result.fields[i][j] = result.fields[i][j] / leftOver;
    }
  }

  // console.log("inverse: ");
  // console.log(result);
  return result;
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
      sum += this.fields[row][i] * vector.fields[row];
    }
    result.fields[row] = sum;
  }

  return result;
}
