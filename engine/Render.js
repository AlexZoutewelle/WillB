/**
Draw holds a reference to the context of the canvas
**/
function Render(screenWidth, screenHeight) {
  this.canvas = document.getElementById('screen');

  this.ctx = this.canvas.getContext('2d');
  this.canvas.requestPointerLock();


  //console.log(this.ctx);
  this.screenWidth = screenWidth;
  this.screenHeight = screenHeight;
  this.imageData = this.ctx.getImageData(0,0, screenWidth, screenHeight);
  this.buf = new ArrayBuffer(this.imageData.data.length);
  this.buf8 = new Uint8ClampedArray(this.buf);
  this.buf32 = new Uint32Array(this.buf);


  this.ZBuffer = new ZBuffer(screenWidth, screenHeight);

  //List of Models
  this.models = [];

  //A list of pixel shaders
  this.pixelShaders = [];
  this.activePixelShader = 0;

  //A list of vertex shaders
  this.vertexShaders = [];
  this.activeVertexShader = 0;
}

//Set a new pixelShader in the array of pixelshaders
Render.prototype.setPixelShader = function(pixelShader) {

  //For now we remove one and add one, so that we always have 1 pixel shader.
  this.pixelShaders.push( pixelShader );
}

Render.prototype.setVertexShader = function(vertexShader) {
  this.vertexShaders.push(vertexShader);
}

Render.prototype.clear = function() {

  for(var y = 0; y < this.screenHeight; ++y) {
    for(var x = 0; x < this.screenWidth; ++x) {
      this.buf32[y * this.screenWidth + x] =
        (255 << 24) |
        (0   << 16) |
        (0   <<  8) |
        0;
    }
  }
}
/**
Draws a Uint8ClampedArray to the canvas
This array holds 4 elements for each pixel: R G B and A, values are between 0 and 255
**/
Render.prototype.draw = function() {
  this.imageData.data.set(this.buf8);
  this.ctx.putImageData(this.imageData, 0, 0);
}


//milimeters
var focalLength = 15;
var filmWidth = 21.023;
var filmHeight = 21.023;

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

Render.prototype.drawPixel = function(x, y, color) {
  //console.log(color.position[0] + " " + color.position[1] + " " + color.position[2] + " " + color.position[3]);
  var pixel = (y * this.screenWidth + x);
  this.buf32[pixel] =
    (color.position[3] << 24)  |   //A
    (color.position[2] << 16)  |   //B
    (color.position[1] << 8)   |   //G
    (color.position[0]);           //R
}


Render.prototype.newModel = function(model) {
  var pixelShader_count = this.pixelShaders.length;
  for(var i = 0; i < pixelShader_count; i++) {
    this.pixelShaders[i].newModel(model);
  }

  var vertexShader_count = this.vertexShaders.length;
  for(var i = 0; i < vertexShader_count; i++) {
    this.vertexShaders[i].newModel(model);
  }
}


/**
*
* Main rendering function
**/
Render.prototype.render = function(camera_inverse, camera) {


  this.ZBuffer.clear();

  this.clear();

  //this.pixelShaders[0].rasterize();


  // The virtual image plane
  var canvasWidth = 1;
  var canvasHeight =  1;

  //Loop over all models currently in the scene
  for(var m = 0; m < this.models.length; m++) {
    var models = this.models;
    var modelGeometry = models[m];

    //Let our pixel shaders know that we are working with a new model
    this.newModel(models[m]);

    var vertexCount = modelGeometry.vertexIds.length;

    //Vertex Transformation
    var verticesOut = []
    for(var i = 0; i < vertexCount; i++) {

      //Assemble vertex
      var vertexIds = modelGeometry.vertexIds[i];
      var vertex_in = new Vertex();

      vertex_in.position = modelGeometry.positions[vertexIds.pos];
      if(typeof(modelGeometry.uvs) !== "undefined") {
        vertex_in.uv = modelGeometry.uvs[vertexIds.uv];
      }
      vertex_in.normal = modelGeometry.normals[vertexIds.norm];

      verticesOut.push(this.vertexTransformer(vertex_in, camera_inverse, object_transform));

    }

    //Triangle assembly
    var faceCount = modelGeometry.faces.length;
    for (var i = 0; i < faceCount; i++) {

      var face = modelGeometry.faces[i];
      var v0 = verticesOut[face.vertices[0]];
      var v1 = verticesOut[face.vertices[1]];
      var v2 = verticesOut[face.vertices[2]];
      if(!this.backFaceCull(v0, v1, v2, camera)) {
        continue;
      }
      this.processFace(v0, v1, v2, modelGeometry.texture);
    }

    //Wireframe mode
    // if(globalState.wireFrame === true) {
    //   this.renderWireFrame(pixels, modelGeometry.edges);
    // }
  }


  //Actually draw the image array on the canvas



  this.draw();
}
var n = 1;
var f = 100;
var w = 1.5;
//  console.log(vertex.position.position[3]);

var projection = new Transformation([
  [2 * n / w, 0,      0,              0],
  [0,         2* n/w, 0,              0],
  [0,         0,      f / (f - n),    -1],
  [0,         0,      n * f/(f - n), 0]
]);

//Transformation matrices
Render.prototype.vertexTransformer = function(vertex, camera_inverse) {

  //Vertex shaders
  //Save a copy of the world position
  vertex.worldPos = vertex.position.copy();

  //Transform to camera coordinate system
  vertex.position = camera_inverse.multMatrixVec3(vertex.position);
  var n = 1;
  var f = 1000;
  var w = 2;
//  console.log(vertex.position.position[3]);



  vertex.position = projection.multMatrixVec3(vertex.position);
  //console.log(vertex.position.position[2]);
  vertex_out = this.invokeVertexShaders(vertex, camera_inverse)

  return vertex_out;
}

Render.prototype.invokeVertexShaders = function(vertex_in, camera_inverse) {
  for(var i = 0; i < this.vertexShaders.length; i++) {
    vertex_in = this.vertexShaders[i].getVertex(vertex_in);
  }
  return vertex_in;
}


Render.prototype.backFaceCull = function(v0, v1, v2, camera_inverse) {
  //console.log(v0);
  //Dot product, back culling
  //renderVertices will do all the transformations and conversion to raster_coordinates
  //It returns the indices of the imgArray it should be drawn on

  //To do backface culling: We need the face's normal.
  //We can only compute this by creaing 2 vectors of the vertices of the face, and crossing them.
  //Then, we do a dot product with our viewing vector, which is the difference between the camera's position and the normal vector
  //If the dot product results in 0 or less, it means the normal is pointing away from us.
  var line1 = new Vector3(
      v1.position.position[0] - v0.position.position[0],
      v1.position.position[1] - v0.position.position[1],
      v1.position.position[2] - v0.position.position[2]
    );
  var line2 = new Vector3(
      v2.position.position[0] - v0.position.position[0],
      v2.position.position[1] - v0.position.position[1],
      v2.position.position[2] - v0.position.position[2]
  );

  // console.log(line1);
  // console.log(line2);
  var normal = line1.cross(line2);

  //
  // var view_vec = new Vector3(
  //   0 - face.vertices[1].position.position[0],
  //   0 - face.vertices[1].position.position[1],
  //   0 - face.vertices[1].position.position[2]
  // )

  var dot_result = v0.position.dot(normal);
  //var dot_result = normal.dot(face.vertices[0].position);
  if(dot_result >= 0) {
    return false;
  }

  return true;
}


Render.prototype.processFace = function(v0, v1, v2, texture) {

  //Fustrum Cull test
  //We need to check if a triangle is completely out of the visible fustrum. If it is, we return immediately: we cull this triangle.

  //Z-plane clipping
  //The Z-Plane clipper outputs 1 or more triangles as a result of clipping the original triangle
  console.log(v0.position.position[2] + " " + v0.position.position[3]);

  if(v0.position.position[0] > v0.position.position[3] &&
     v1.position.position[0] > v1.position.position[3] &&
     v2.position.position[0] > v2.position.position[3]) {
       console.log("true1");
      return;
    }
    if(v0.position.position[0] < -v0.position.position[3] &&
       v1.position.position[0] < -v1.position.position[3] &&
       v2.position.position[0] < -v2.position.position[3]) {
         console.log("true2");

        return;
    }
    if(v0.position.position[1] > v0.position.position[3] &&
       v1.position.position[1] > v1.position.position[3] &&
       v2.position.position[1] > v2.position.position[3]) {
         console.log("true3");

        return;
      }
      if(v0.position.position[1] < -v0.position.position[3] &&
         v1.position.position[1] < -v1.position.position[3] &&
         v2.position.position[1] < -v2.position.position[3]) {
           console.log("true3");

          return;
        }
  if(v0.position.position[2] > v0.position.position[3] &&
     v1.position.position[2] > v1.position.position[3] &&
     v2.position.position[2] > v2.position.position[3]) {
       console.log("true4");

      return;
  }
  if(v0.position.position[2] < 0 &&
     v1.position.position[2] < 0 &&
     v2.position.position[2] < 0) {
       console.log("true5");

      return;
  }
  this.postProcessFace(v0, v1, v2, texture);
}

Render.prototype.postProcessFace = function(v0, v1, v2, texture) {

  //this.renderFace(v0, v1, v2, texture);
  v0 = this.vertexToRaster(v0);
  v1 = this.vertexToRaster(v1);
  v2 = this.vertexToRaster(v2);
  this.drawFace(v0, v1, v2 )
}



Render.prototype.drawFace = function(v0, v1, v2, texture) {

  //Bounding box
  var minX = getMin3(v0.position.position[0], v1.position.position[0], v2.position.position[0]);
  var maxX = getMax3(v0.position.position[0], v1.position.position[0], v2.position.position[0]);

  var minY = getMin3(v0.position.position[1], v1.position.position[1], v2.position.position[1]);
  var maxY = getMax3(v0.position.position[1], v1.position.position[1], v2.position.position[1]);

  //2d clipping
  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  maxX = Math.min(this.screenWidth - 1, maxX);
  maxY = Math.min(this.screenHeight - 1, maxY);

  //Setting up constants for the edge function. A is the unit step on the x-axis. B is the unit step on the y-axis
  //v1, v2, p
  var A12 = v1.position.position[1] - v2.position.position[1];
  var B12 = v2.position.position[0] - v1.position.position[0];

  //v2, v0, p
  var A20 = v2.position.position[1] - v0.position.position[1];
  var B20 = v0.position.position[0] - v2.position.position[0];

  //v0, v1, p
  var A01 = v0.position.position[1] - v1.position.position[1];
  var B01 = v1.position.position[0] - v0.position.position[0];

  //Face area
  var area = EdgeFunction(v0.position,v1.position,v2.position);

  var currentP = new Vector3(minX, minY, 1);
  //Set up barycentric coordinates at minX and minY


  var w0_in = EdgeFunction(v1.position, v2.position, currentP);
  var w1_in = EdgeFunction(v2.position, v0.position, currentP);
  var w2_in = EdgeFunction(v0.position, v1.position, currentP);

  //loop over bounding box
  for(currentP.position[1] = minY; currentP.position[1] < maxY; currentP.position[1] += 1){

    //Barycentric coordinates at the start of the current row
    var w0 = w0_in;
    var w1 = w1_in;
    var w2 = w2_in;

    for(currentP.position[0] = minX; currentP.position[0] < maxX; currentP.position[0] += 1) {
      if((w0 | w1 | w2) >= 0) {

          //barycentric coordinates
          var w0_current =  w0 / area;
          var w1_current =  w1 / area;
          var w2_current =  w2 / area;

          //z-buffer test

          //The vertices' Z is saved as 1 / z. So, to get the true Z, we should take its reciprocal once more after interpolating
          currentP.position[2] = 1 / (v0.position.position[2] + (w1_current * (v1.position.position[2] - v0.position.position[2]) ) + (w2_current * (v2.position.position[2] - v0.position.position[2])));

          if(this.ZBuffer.Ztest(currentP.position[0], currentP.position[1], currentP.position[2])) {

            //Assemble Vertex
            var p = new Vertex();
            p.position = currentP;


            //draw
            //Get the color that the vertex must output
            var outputColor = this.invokePixelShaders(p, w0_current, w1_current, w2_current, v0, v1, v2);
            this.drawPixel(p.position.position[0], p.position.position[1], outputColor);
          }
      }
      //One unit step on the x-axis
      w0 += A12;
      w1 += A20;
      w2 += A01;

    }
    //One unit step on the y-axis
    w0_in += B12;
    w1_in += B20;
    w2_in += B01;

  }


}

//Invoke all our pixels shaders on a given vertex
//Each one will return a color.
//Right now, they will override eachothers output.
Render.prototype.invokePixelShaders = function(vertex, w0, w1, w2, v0, v1, v2) {
  for(var i = 0; i < this.pixelShaders.length; i++) {
    vertex = this.pixelShaders[i].getVertex(vertex, w0, w1, w2, v0, v1, v2);
  }

  if(typeof(vertex.color) === "undefined") {
    vertex.color = new Vector3(255,255,255);
    vertex.color.position[3] = 255;
  }
  return vertex.color;
}



Render.prototype.renderWireFrame = function(pixels, edges) {

  for(var vId = 0; vId < pixels.length;  vId++) {
    //vId is the id of the current vertex. We get all the ids of the vertices that are adjacent to it
      var adjacentList = edges[vId];

      //If we want to draw a wireframe, we draw the lines connecting these pixels now

      //Triangle idea is:   start at pixel 0. Move to pixel 1, draw.
      //               go to pixel 1. Move to pixel 2, draw.
      //               go to pixel 2. Move to pixel 3, draw.
      //               go to pixel 3. Move to pixel 1, draw

      for(var k = 0; k < adjacentList.length; k++) {

        var adjId = adjacentList[k];
        if(pixels[adjId] && pixels[vId]) {

          this.bresenham(this.imgArray, pixels[vId].position[0] ,pixels[vId].position[1] ,pixels[adjId].position[0], pixels[adjId].position[1], [255, 0, 0, 255]);
        }
      }
  }
}

//Perspective_divide, ndc, raster space
//We multiply the entire vertex with the inverse of the Z position. Then, we do the normal raster conversion on the positions

Render.prototype.vertexToRaster = function(vertex_orig) {
  var vertex = vertex_orig;
  var zInv = (1/vertex.position.position[2]);



  //vertex = vertex.multiplyScalar(-zInv);

  //persp_divide. Only need to multiply with ZNear now, since we already multiplied by the inverse of Z
  vertex.position.position[0] = (vertex.position.position[0] )  * Znear / vertex.position.position[2];
  vertex.position.position[1] = (vertex.position.position[1] ) * Znear / vertex.position.position[2];
  // console.log(cleft + " " +  cright + " " + ctop + " " + cbottom + " " + Znear);
  //console.log("new");
  //console.log(point_pd.position[0] + " < " + (cleft - 10) + "?: " + (point_pd.position[0] < (cleft - 10)) );

  //ndc (range of [0,1])
  vertex.position.position[0] = (vertex.position.position[0] + cright) / (2 * cright);       //x + canvas_width * 0.5    / canvas_width
  vertex.position.position[1] = (vertex.position.position[1] + ctop ) / (2 * ctop);       //y + canvas_height * 0.5 / canvas_height

  //raster coords (pixels)
  vertex.position.position[0] = ((vertex.position.position[0] * this.screenWidth) ) | 0;
  vertex.position.position[1] = (((1 - vertex.position.position[1] ) * this.screenHeight) ) | 0;
  vertex.position.position[2] = zInv;
  return vertex;
}

//Bresenham algorithm to draw lines
Render.prototype.bresenham = function(imgArray, x1, y1, x2, y2, color) {
  //First check cases
  var dx = x2 - x1;
  var dy = y2 - y1;

  if(Math.abs(dy) > Math.abs(dx)) {
    //Y is the driving axis, because dy is smaller than dx.

    //bresenhamPlotLineHigh

    //Lastly, we need to check the direction of the driving axis: y
    if(y1 > y2) {
      //We go downwards, so we should take point 2 as the starting point here.
      this.bresenhamPlotLineHigh(imgArray, x2, y2, x1, y1, color);
    }

    else {
        //We go upwards, so we should take point 1 as the starting point_pd
        this.bresenhamPlotLineHigh(imgArray, x1, y1, x2, y2, color);
    }


  }

  else {
    //Here X is the driving axis, because dx is smaller than dy.
    if(x1 > x2) {
      //We go from right to left here. So, we should take point 2 as the starting point.
      this.bresenhamPlotLineLow(imgArray, x2, y2, x1, y1, color);
    }

    else {
      //Here we go from left to right, so we should do as normal
      this.bresenhamPlotLineLow(imgArray, x1, y1, x2, y2, color);
    }
  }

}


Render.prototype.bresenhamPlotLineHigh = function(imgArray, x1, y1, x2, y2, color) {
  var dx = x2 - x1;
  var dy = y2 - y1;

  var xi = 1;
  if(dx < 0) {
    xi = -1;
    dx = -dx;
  }

  var P = 2*dx - dy;
  var x = x1;

  if(x1 < 0) {
    x1 = 0;
  }

  for(var y = y1; y <= y2; y++) {

    if(x > 0 && x < this.screenWidth) {
      this.drawPixel(imgArray, x, y, color[0], color[1], color[2], color[3]);
    }

    if(P > 0) {
      x = x + xi;
      P = P - 2*dy;
    }

      P = P + 2*dx;

  }
}

Render.prototype.bresenhamPlotLineLow = function(imgArray, x1, y1, x2, y2, color)  {

  var dx = x2 - x1;
  var dy = y2 - y1;

  //The value to increment the non-driving axis
  var yi = 1;
  if(dy < 0) {
    //Non driving axis goes from top to bottom. (so point 1 is bigger than point 2)
    yi = -1;
    dy = -dy;
  }

  //Decision variable.  P = 2*dy - dx, for non-driving axis y.    P = 2*dx - dy   for non-driving axis x
  var P = 2 * dy - dx;
  var y = y1;


  for(var x = x1; x <= x2; x++) {
    if(x > 0 && x < this.screenWidth) {
      this.drawPixel(imgArray, x, y, color[0], color[1], color[2], color[3])
    }


    //Decision variable. If P > 0, it means that the distance to the upper pixel was smaller than the distance to the lower pixel
    //Meaning, we can increment y.
    if (P > 0) {
      y = y + yi;
      P = P - 2*dx
    }

      P = P + 2*dy;
  }
}
