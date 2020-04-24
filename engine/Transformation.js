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
              matrix.fields[i][col]; // select all numbers on column

      }
      result.fields[row][col] = sum;
    }
  }
  return result;
}

Transformation.prototype.scale = function (scale) {
  var mat = new Transformation([
    [scale, 0, 0, 0],
    [0, scale, 0, 0],
    [0, 0, scale, 0],
    [0, 0, 0, 1]
  ]);

  return this.multiply(mat).fields;
}

Transformation.prototype.rotate = function(pitch = 0, yaw = 0, roll = 0) {

  var xAxis = new Transformation();
  if(pitch !== 0) {

    pitch = pitch * Math.PI / 180;

    var cp = Math.cos(pitch);
    var sp = Math.sin(pitch);

    xAxis.fields = [
      [1, 0,   0,  0],
      [0, cp, sp, 0],
      [0, -sp, cp,  0],
      [0, 0,  0,   1]
    ]
  }

  var yAxis = new Transformation();
  if(yaw !== 0) {

    yaw = yaw * Math.PI / 180;

    var cy = Math.cos(yaw);
    var sy = Math.sin(yaw);

    yAxis.fields = [
      [cy, 0, -sy, 0],
      [0,  1, 0,  0],
      [sy, 0, cy,0],
      [0, 0, 0,   1]
    ]

  }

  var zAxis = new Transformation();
  if(roll !== 0) {

    roll = roll * Math.PI / 180;

    var cr = Math.cos(roll);
    var sr = Math.sin(roll);

    zAxis.fields = [
      [cr, sr, 0, 0],
      [-sr, cr,  0, 0],
      [0,  0,   1, 0],
      [0,  0,   0, 1]
    ]

  }



  var finalrot = zAxis.multiply(yAxis.multiply(xAxis));

  return this.multiply(finalrot).fields;


  var mat = new Transformation([
    [cy, 0, -sy, 0],
    [sy * sp, cp, cy * sp, 0],
    [sy * cp, -sp, cp * cy, 0],
    [0, 0, 0, 1]
  ]);





  return this.multiply(mat).fields;
}

Transformation.prototype.rotate2 = function(pitch = 0, yaw = 0) {


    pitch = pitch * Math.PI / 180;

     cp = Math.cos(pitch);
     sp = Math.sin(pitch);


    yaw = yaw * Math.PI / 180;

     cy = Math.cos(yaw);
     sy = Math.sin(yaw);


  var mat = new Transformation([
    [cy, 0, sy, 0],
    [sp *sy, cp, -sp*cy, 0],
    [-sy * cp, sp, cp * cy, 0],
    [0, 0, 0, 1]
  ]);
  return mat.multiply(this).fields;
}

Transformation.prototype.translate = function(x = 0, y = 0, z = 0) {
  var translation = new Transformation([
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ]);
  return this.multiply(translation).fields;
}


/**
*
* Multiply this Matrix4 with a Vector3 column major order vector
*/

Transformation.prototype.multMatrixVec3 = function(vector){
  try {
    result = new Vector3(1,1,1);

    for(var row = 0; row < 4; row++) {
      var sum = 0;
      for(var i = 0; i < 4; i++) {
        sum += this.fields[row][i] * vector.position[i];
      }
      result.position[row] = sum;
    }
    return result;
  }
  catch(error) {
    console.log(error);
    console.log(this);
  }
}

Transformation.prototype.multVec3Matrix = function(vector){
  result = new Vector3(1,1,1);

  for(var row = 0; row < 3; row++) {
    var sum = 0;
    for(var i = 0; i < 3; i++) {
      sum += this.fields[i][row] * vector.position[i];
    }
    result.position[row] = sum;
  }

  return result;
}








Transformation.prototype.inverse = function matrix_invert(){
    // I use Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows

    //if the this.atrix isn't square: exit (error)
    if(this.fields.length !== this.fields[0].length){console.log("error"); return;}

    //create the identity this.atrix (I), and a copy (C) of the original
    var i=0, ii=0, j=0, dim=this.fields.length, e=0, t=0;
    var I = [], C = [];
    for(i=0; i<dim; i+=1){
        // Create the row
        I[I.length]=[];
        C[C.length]=[];
        for(j=0; j<dim; j+=1){

            //if we're on the diagonal, put a 1 (for identity)
            if(i==j){ I[i][j] = 1; }
            else{ I[i][j] = 0; }

            // Also, make the copy of the original
            C[i][j] = this.fields[i][j];
        }
    }

    // Perform elementary row operations
    for(i=0; i<dim; i+=1){
        // get the element e on the diagonal
        e = C[i][i];

        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if(e==0){
            //look through every row below the i'th row
            for(ii=i+1; ii<dim; ii+=1){
                //if the ii'th row has a non-0 in the i'th col
                if(C[ii][i] != 0){
                    //it would make the diagonal have a non-0 so swap it
                    for(j=0; j<dim; j++){
                        e = C[i][j];       //temp store i'th row
                        C[i][j] = C[ii][j];//replace i'th row by ii'th
                        C[ii][j] = e;      //repace ii'th by temp
                        e = I[i][j];       //temp store i'th row
                        I[i][j] = I[ii][j];//replace i'th row by ii'th
                        I[ii][j] = e;      //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if(e==0){console.log("error"); return;}
        }

        // Scale this row down by e (so we have a 1 on the diagonal)
        for(j=0; j<dim; j++){
            C[i][j] = C[i][j]/e; //apply to original matrix
            I[i][j] = I[i][j]/e; //apply to identity
        }

        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for(ii=0; ii<dim; ii++){
            // Only apply to other rows (we want a 1 on the diagonal)
            if(ii==i){continue;}

            // We want to change this element to 0
            e = C[ii][i];

            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for(j=0; j<dim; j++){
                C[ii][j] -= e*C[i][j]; //apply to original matrix
                I[ii][j] -= e*I[i][j]; //apply to identity
            }
        }
    }

    //we've done all operations, C should be the identity
    //matrix I should be the inverse
    return new Transformation(I);
}
