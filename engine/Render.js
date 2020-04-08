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
var focalLength = 15;
var filmWidth = 21.023;
var filmHeight = 21.328;

var Znear = 1;
var Zfar = 1000;

// var angleOfView = 90;
//var canvasSize = 2 * Math.atan(angleOfView * 0.5) * Znear;

//Canvas dimensions
var ctop = (filmHeight * 0.5 / focalLength) * Znear ;
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
Render.prototype.render = function(modelGeometry, camera_inverse, object_transform, camera) {

  //console.log(modelGeometry);
  this.ctx.clearRect(0,0, this.screenWidth, this.screenHeight);
  var screenWidth = this.screenWidth;
  var imgArray = new Uint8ClampedArray(4 * this.screenWidth * this.screenHeight);

  // The virtual image plane
  var canvasWidth = 1;
  var canvasHeight =  1;


  //imgArray = this.renderVertices(imgArray, modelGeometry.positions, camera_inverse, object_transform);
  //var imgArray = this.renderFaces(imgArray, modelGeometry, camera_inverse, object_transform);
  //var raster_pixels = this.renderVertices(modelGeometry.positions, camera_inverse, object_transform);
  var vertexCount = modelGeometry.positions.length;
  var pixels = []
  for(var i = 0; i < vertexCount; i++) {
    pixels.push( this.renderVertices(imgArray, modelGeometry.positions[i], camera_inverse, object_transform));
  }

  var faceCount = modelGeometry.faces.length;
  for (var i = 0; i < faceCount; i++) {
    this.renderFaces(imgArray, modelGeometry.faces[i], pixels, camera_inverse, object_transform, camera);
  }
  // for(var i = 0; i < modelGeometry.faces.length; i++) {
  //
  // }
  //
  // this.renderWireFrame(pixels, modelGeometry.edges);


  //Actually draw the image array on the canvas
  //this.draw(imgArray);
}


Render.prototype.backFaceCull = function(face, vertices, pixels, camera_inverse) {
  if(vertices.length < 3) {
    //We cant render the triangle, so we can't cull.
    return;
  }

  //Dot product, back culling
  //renderVertices will do all the transformations and conversion to raster_coordinates
  //It returns the indices of the imgArray it should be drawn on

  //To do backface culling: We need the face's normal.
  //We can only compute this by creaing 2 vectors of the vertices of the face, and crossing them.
  //Then, we do a dot product with our viewing vector, which is the difference between the camera's position and the normal vector
  //If the dot product results in 0 or less, it means the normal is pointing away from us.
  var line1 = new Vector3(
      vertices[0].fields[0] - vertices[1].fields[0],
      vertices[0].fields[1] - vertices[1].fields[1],
      vertices[0].fields[2] - vertices[1].fields[2]
    );
  var line2 = new Vector3(
      vertices[0].fields[0] - vertices[2].fields[0],
      vertices[0].fields[1] - vertices[2].fields[1],
      vertices[0].fields[2] - vertices[2].fields[2]
  );
  var normal = line1.cross(line2);

  var view_vec = new Vector3(
    camera_inverse.fields[0][3] - vertices[1].fields[0],
    camera_inverse.fields[1][3] - vertices[1].fields[1],
    camera_inverse.fields[2][3] - vertices[1].fields[2]
  )

  view_vec.normalize();
  normal.normalize();

  var dot_result = view_vec.dot(normal);

  if(dot_result < 0) {
    face.culled = true;
    return false;
  }

  return true;
}

Render.prototype.renderWireFrame = function(pixels, edges) {

  for(var vId = 0; vId < pixels.length;  vId++) {
    //vId is the id of the current vertex. We get all the ids of the vertices that are adjacent to it
      var adjacentList = edges[vId];

      //If we want to draw a wireframe, we draw the lines connecting these pixels now
      //For now, we use html5 canvas methods. In the near future, we'll use Bresenham instead

      //Triangle idea is:   start at pixel 0. Move to pixel 1, draw.
      //               go to pixel 1. Move to pixel 2, draw.
      //               go to pixel 2. Move to pixel 3, draw.
      //               go to pixel 3. Move to pixel 1, draw

      for(var k = 0; k < adjacentList.length; k++) {

        var adjId = adjacentList[k];
        if(pixels[adjId] && pixels[vId]) {
          this.ctx.beginPath();

          this.ctx.moveTo(pixels[vId].fields[0], pixels[vId].fields[1])


          this.ctx.lineTo(pixels[adjId].fields[0], pixels[adjId].fields[1]);
          this.ctx.strokeStyle= "red";
          this.ctx.stroke();
        }
      }
  }
}


//Renders a set of vertices?   It is right now more just a conversion function.
//Right now, the vertices used in this function is from a single face
Render.prototype.renderVertices = function(imgArray, vertex, camera_inverse, object_transform) {


      //local to world

      var point = object_transform.multMatrixVec3(vertex)

      //world to camera
      point = camera_inverse.multMatrixVec3(point);
      var rgba = [255, 0, 0, 255];

      //perspective_divide.
      var point_pd = new Vector3(0,0,0);
      point_pd.fields[0] = ((point.fields[0] )/ (-point.fields[2]) ) * Znear;
      point_pd.fields[1] = ((point.fields[1] ) / (-point.fields[2]) ) * Znear;
      point_pd.fields[2] = point.fields[2];

      if(point_pd.fields[2] < Znear  || point_pd.fields[0] < (cleft - 10) || point_pd.fields[0] > (cright + 10) || point_pd.fields[1] < (cbottom - 10) || point_pd.fields[1] > (ctop + 10)) {

        return 0;

        //If you want to draw all the pixels that should not be visible, but with a different color (for debugging purposes)
        //Remove the continue statement, and change the rgba values
        // rgba = [0,255,0,255];
      }


      //ndc (range of [0,1])
      var point_ndc = new Vector3(0,0,0);
      point_ndc.fields[0] = (point_pd.fields[0] + cright) / (2 * cright);       //x + canvas_width * 0.5    / canvas_width
      point_ndc.fields[1] = (point_pd.fields[1] + ctop ) / (2 * ctop);       //y + canvas_height * 0.5 / canvas_height

      //raster coords (pixels)
      var point_raster = new Vector3(0,0,0);
      point_raster.fields[0] = ((point_ndc.fields[0] * this.screenWidth) ) | 0;
      point_raster.fields[1] = (((1 - point_ndc.fields[1] ) * this.screenHeight) ) | 0;




      //Now that we have the raster coordinates, we could choose to just draw the pixel on the screen:
      //this.drawPixel(imgArray, point_raster.fields[0], point_raster.fields[1]);


      //Or we can push this pixel to the array of pixels that belong to the face
      //Here we compute the index that the pixel is associated with within the imgArray
      var pixel = ((point_raster.fields[0]) * 4) + ((screenWidth * (point_raster.fields[1])) * 4);







  // for(var k = 0; k < pixel_array.length; k++) {
    //this.drawPixel(imgArray, point_raster.fields[0], point_raster.fields[1]);
  // }

  return point_raster;

  //This is JS: everything is a pointer. So, no need to return the imgArray
  //return imgArray;
}

//Loop over all faces, and get their corresponding set of vertices
Render.prototype.renderFaces = function(imgArray, face, pixels, camera_inverse, object_transform, camera) {
  //store the rasterized_pixels in here
    //For each face, get the corresponding vertexIndices
    var currentFaceVerts = face.vertices;
    var faceLength = currentFaceVerts.length;

    var vertices = [];
    //We take each index specified in the face, and push them to the vertices array.
    //The vertices in the array are to be drawn to the screen
    for(var j = 0; j < faceLength; j++) {
        //console.log("push");
        //Remember, .obj consider themselves starting at index 1. So, we must subtract 1
        var vertexIndex = currentFaceVerts[j] - 1;
        if(pixels[vertexIndex]) {
          vertices.push(pixels[vertexIndex]);

        }
    }

    if(!this.backFaceCull(face, vertices, pixels, camera_inverse)) {
      return;
    }

    //If we want to draw a wireframe, we draw the lines connecting these pixels now
    //For now, we use html5 canvas methods. In the near future, we'll use Bresenham instead

    //Triangle idea is:   start at pixel 0. Move to pixel 1, draw.
    //               go to pixel 1. Move to pixel 2, draw.
    //               go to pixel 2. Move to pixel 3, draw.
    //               go to pixel 3. Move to pixel 1, draw

    for(var k = 0; k < vertices.length; k++) {
      this.ctx.beginPath();

      this.ctx.moveTo(vertices[k].fields[0], vertices[k].fields[1])

      var next = 0;
      if(!(k === vertices.length - 1)) {
        next = k + 1;
      }
      this.ctx.lineTo(vertices[next].fields[0], vertices[next].fields[1]);
      this.ctx.strokeStyle= "red";
      this.ctx.stroke();

    }
  return imgArray;
}

//Bresenham algorithm to draw lines
Render.prototype.bresenham = function(x1, y1, x2, y2) {

}
