/**
Draw holds a reference to the context of the canvas
**/
function Render(screenWidth, screenHeight) {
  this.canvas = document.getElementById('screen');

  this.ctx = this.canvas.getContext('2d');
  this.canvas.requestPointerLock();


  console.log(this.ctx);
  this.screenWidth = screenWidth;
  this.screenHeight = screenHeight;
}


/**
Draws a Uint8ClampedArray to the canvas
This array holds 4 elements for each pixel: R G B and A, values are between 0 and 255
**/
Render.prototype.draw = function(imageArray) {

  //console.log(imageArray);
  var imageData = new ImageData(imageArray, this.screenWidth, this.screenHeight);
  this.ctx.putImageData(imageData, 0, 0);
}

//milimeters
var focalLength = 35;
var filmWidth = 21.023;
var filmHeight = 21.328;

var Znear = 10;
var Zfar = 1000;

// var angleOfView = 90;
//var canvasSize = 2 * Math.atan(angleOfView * 0.5) * Znear;

//Canvas dimensions
var ctop = (filmHeight * 0.5 / focalLength) * Znear;
var cbottom = -ctop;
var cright = (filmWidth * 0.5 / focalLength) * Znear;
var cleft = -cright;

console.log(ctop + " "  + cbottom + " " + cright + " "  + cleft);

Render.prototype.drawPixel = function(imgArray, x, y) {
  var pixel = ((x * 4) + (this.screenWidth * y * 4));
  imgArray[pixel] = 255;
  imgArray[pixel + 1] = 0;
  imgArray[pixel + 2] = 0;
  imgArray[pixel + 3] = 255;
}



/**
*
* Main rendering function
* In the future, it should take an array of modelGeometry
**/
Render.prototype.render = function(modelGeometry, camera_inverse, object_transform) {

  //console.log(modelGeometry);
  var screenWidth = this.screenWidth;
  var imgArray = new Uint8ClampedArray(4 * this.screenWidth * this.screenHeight);

  // The virtual image plane
  var canvasWidth = 1;
  var canvasHeight =  1;




  //imgArray = this.renderVertices(imgArray, modelGeometry.positions, camera_inverse, object_transform);
  imgArray = this.renderFaces(imgArray, modelGeometry, camera_inverse, object_transform);

  //Actually draw the image array on the canvas
  this.draw(imgArray);
}

//Only renders points
Render.prototype.renderVertices = function(imgArray, vertices, camera_inverse, object_transform) {
  //console.log(vertices);
  var vertexCount = vertices.length;
  for(var i = 0; i < vertexCount; i++) {
      var position = vertices[i];

      //local to world

      var point = object_transform.multMatrixVec3(position)

      //world to camera
      point = camera_inverse.multMatrixVec3(point);
      var rgba = [255, 0, 0, 255];

      //perspective_divide.
      var point_pd = new Vector3(0,0,0);
      point_pd.fields[0] = ((point.fields[0] )/ (-point.fields[2]) ) * Znear;
      point_pd.fields[1] = ((point.fields[1] ) / (-point.fields[2]) ) * Znear;
      point_pd.fields[2] = point.fields[2];



      //ndc (range of [0,1])
      var point_ndc = new Vector3(0,0,0);
      point_ndc.fields[0] = (point_pd.fields[0] + cright) / (2 * cright);       //x + canvas_width * 0.5    / canvas_width
      point_ndc.fields[1] = (point_pd.fields[1] + ctop ) / (2 * ctop);       //y + canvas_height * 0.5 / canvas_height

      //raster coords (pixels)
      var point_raster = new Vector3(0,0,0);
      point_raster.fields[0] = ((point_ndc.fields[0] * this.screenWidth) ) | 0;
      point_raster.fields[1] = (((1 - point_ndc.fields[1] ) * this.screenHeight) ) | 0;

      if(point_pd.fields[2] < Znear || point_pd.fields[0] < cleft || point_pd.fields[0] > cright || point_pd.fields[1] < cbottom || point_pd.fields[1] > ctop) {

        continue;

        //If you want to draw all the pixels that should not be visible, but with a different color (for debugging purposes)
        //Remove the continue statement, and change the rgba values
        // rgba = [0,255,0,255];

      }

      //'Draw' the point in the image array:  separate RGBA indices
      var pixel = ((point_raster.fields[0]) * 4) + ((screenWidth * (point_raster.fields[1])) * 4);

      imgArray[pixel] = rgba[0];
      imgArray[pixel + 1] = rgba[1];
      imgArray[pixel + 2] = rgba[2];
      imgArray[pixel + 3] = rgba[3];
  }

  return imgArray;
}

//Render a wireframe for now
Render.prototype.renderFaces = function(imgArray, modelGeometry, camera_inverse, object_transform) {
  var facesCount = modelGeometry.faces.length;
  //console.log(facesCount);
  for(var i = 0; i < facesCount; i++) {
    //For each face, get the corresponding vertexIndices
    var currentFaceVerts = modelGeometry.faces[i].vertices;
    //console.log(currentFaceVerts);
    var faceLength = currentFaceVerts.length;
    var vertices = [];
    for(var j = 0; j < faceLength; j++) {
        //console.log("push");
        vertices.push(modelGeometry.positions[currentFaceVerts[j] - 1]);

    }

    //console.log(vertices);
    imgArray = this.renderVertices(imgArray, vertices, camera_inverse, object_transform);
  }

  return imgArray;
}
