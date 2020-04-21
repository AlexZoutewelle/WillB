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
  console.log(screenWidth);
  console.log(screenHeight);

  this.ZBuffer = new ZBuffer(screenWidth, screenHeight);

}


/**
Draws a Uint8ClampedArray to the canvas
This array holds 4 elements for each pixel: R G B and A, values are between 0 and 255
**/
Render.prototype.draw = function() {

  //console.log(imgArray);
  var imageData = new ImageData(this.imgArray, this.screenWidth, this.screenHeight);

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

Render.prototype.drawPixelAlt = function(x, y, r, g, b, a) {
  var pixel = ((x * 4) + (this.screenWidth * y * 4));


  this.imgArray[pixel] = r;
  this.imgArray[pixel + 1] = g;
  this.imgArray[pixel + 2] = b;
  this.imgArray[pixel + 3] = a;

}

Render.prototype.drawPixel = function(x, y, color) {
  var pixel = ((x * 4) + (this.screenWidth * y * 4));

  this.imgArray[pixel] = color[0];
  this.imgArray[pixel + 1] = color[1];
  this.imgArray[pixel + 2] = color[2];
  this.imgArray[pixel + 3] = color[3];
}

/**
*
* Main rendering function
**/
Render.prototype.render = function(models, camera_inverse, object_transform, camera) {
  this.ZBuffer.clear();
  var screenWidth = this.screenWidth;
  this.imgArray = new Uint8ClampedArray(4 * this.screenWidth * this.screenHeight);

  // The virtual image plane
  var canvasWidth = 1;
  var canvasHeight =  1;

  //Loop over all models currently in the scene
  for(var m = 0; m < models.length; m++) {
    var modelGeometry = models[m];

    var vertexCount = modelGeometry.positions.length;

    //Vertex Transformation
    var pixels = []
    for(var i = 0; i < vertexCount; i++) {
      pixels.push(this.vertexTransformer(modelGeometry.positions[i], camera_inverse, object_transform));
    }



    //Trangle assembly
      var faceCount = modelGeometry.faces.length;
      for (var i = 0; i < faceCount; i++) {

        var face = modelGeometry.faces[i];

        face.vertices[0].position = pixels[face.vertices[0].id];
        face.vertices[1].position = pixels[face.vertices[1].id];
        face.vertices[2].position = pixels[face.vertices[2].id];

        if(!this.backFaceCull(face, camera)) {
          continue;
        }

        this.processFace(face, modelGeometry.texture);
      }

    //Wireframe mode
    // if(globalState.wireFrame === true) {
    //   this.renderWireFrame(pixels, modelGeometry.edges);
    // }
  }


  //Actually draw the image array on the canvas
  this.draw();
}

Render.prototype.processFace = function(face, texture) {
  v0 = this.vertexToRaster(face.vertices[0]);
  v1 = this.vertexToRaster(face.vertices[1]);
  v2 = this.vertexToRaster(face.vertices[2]);

  var face2 = new Face([v0,v1,v2]);
  this.postProcessFace(face2, texture);
}

Render.prototype.postProcessFace = function(face, texture) {

  this.renderFace(face, texture);
}


//Triangle rasterizer
Render.prototype.renderFace = function(face, texture) {
  var color = "blue";

  //First, we have to sort the triangles based on their Y values DESC, to determine the case
  var set = [0,1,2];

  for(var i = 0; i < 3; i++) {
    var current = i;
    var next = i + 1;
    if(current === 2) {
      current = 0;
      next = 1;
    }

    if(face.vertices[set[current]].position.position[1] < face.vertices[set[next]].position.position[1]) {
        var temp = set[current];
        set[current] = set[next];
        set[next] = temp;
    }
  }


  //Flat top
  if(face.vertices[set[0]].position.position[1] === face.vertices[set[1]].position.position[1]) {
    //Now, we should sort the top vertices by their x values ASC
    if(face.vertices[set[0]].position.position[0] > face.vertices[set[1]].position.position[0]) {
      var temp = set[0];
      set[0] = set[1];
      set[1] = temp;
    }
    this.renderFlatTopFace( face.vertices[set[0]],
                            face.vertices[set[1]],
                            face.vertices[set[2]],
                            color, texture);
  }

  //Flat bottom
  else if(face.vertices[set[1]].position.position[1] === face.vertices[set[2]].position.position[1]) {
    //Now, we should sort the bottom vertices by their x values  ASC
    if(face.vertices[set[1]].position.position[0] > face.vertices[set[2]].position.position[0]) {
      var temp = set[1];
      set[1] = set[2];
      set[2] = temp;
    }

    this.renderFlatBottomFace( face.vertices[set[0]],
                               face.vertices[set[1]],
                               face.vertices[set[2]],
                               [0,0,255], texture);
  }

  //General
  else {
    //Interpolate vertices
    var alpha = (face.vertices[set[1]].position.position[1] - face.vertices[set[0]].position.position[1]) /
                (face.vertices[set[2]].position.position[1] - face.vertices[set[0]].position.position[1]);
    var vi =  face.vertices[set[0]].interpolateTo(face.vertices[set[2]], alpha);


    //major right
    if(vi.position.position[0] > face.vertices[set[1]].position.position[0]) {

      this.renderFlatBottomFace(face.vertices[set[0]], face.vertices[set[1]], vi , color, texture);
      this.renderFlatTopFace(face.vertices[set[1]], vi, face.vertices[set[2]], color, texture);
    }
    //major left
    if(vi.position.position[0] < face.vertices[set[1]].position.position[0]) {

      this.renderFlatBottomFace(face.vertices[set[0]], vi, face.vertices[set[1]], color, texture);
      this.renderFlatTopFace(vi, face.vertices[set[1]], face.vertices[set[2]], color, texture);
    }
  }

}

Render.prototype.renderFlatBottomFace = function(v0, v1, v2, color, texture) {
  var dy = (v0.position.position[1] - v2.position.position[1]);

  //dv0 and dv1 are the edge steps
  var dv0 = v1.subtract(v0).divideScalar(dy);
  var dv1 = v2.subtract(v0).divideScalar(dy);

  //Right edge interpolant    //Maybe make a copying function for vertices?
  var itEdge1 = v0;

  this.drawFace(v0, v1, v2, texture, dv0, dv1, itEdge1 )
}

Render.prototype.renderFlatTopFace = function(v0, v1, v2, color, texture) {

  var dy = (v2.position.position[1] - v0.position.position[1]);

  //dv0 and dv1 are the edge raster_pixels
  var dv0 = v0.subtract(v2).divideScalar(dy);
  var dv1 = v1.subtract(v2).divideScalar(dy);

  var itEdge1 = v1;

  this.drawFace(v0,v1, v2, texture, dv0, dv1, itEdge1);
}

Render.prototype.drawFace = function(v0, v1, v2, texture, dv0, dv1, itEdge1) {

  //left edge interpolant is always the same, no matter the case.
  var itEdge0 = v0;

  var yStart = Math.ceil(v0.position.position[1] - 0.5);
  var yEnd = Math.ceil(v2.position.position[1] - 0.5);


  if(yStart < 0) {
    yStart = 0;
  }

  if(yEnd > this.screenHeight) {
    yEnd = this.screenHeight ;
  }

  itEdge0 = itEdge0.add(dv0.multiplyScalar(yStart + 0.5 - v0.position.position[1]));
  itEdge1 = itEdge1.add(dv1.multiplyScalar(yStart + 0.5 - v0.position.position[1]));


  //uv texture coords clamp
  var texture_width = texture.width;
  var texture_height = texture.height;
  var tex_clamp_x = texture_width;
  var tex_clamp_y = texture_height;




  for(var y = yStart; y > yEnd; y--) {

    var xStart = Math.ceil(itEdge0.position.position[0] - 0.5);
    var xEnd = Math.ceil(itEdge1.position.position[0] - 0.5);

    if(xStart < 0) {
      //console.log("xStart: " + xStart + " xEnd: " + xEnd);

      xStart = 0;
    }
    if(xEnd > this.screenWidth) {
      //console.log("xStart: " + xStart + " xEnd: " + xEnd);

      xEnd = this.screenWidth ;
    }


    var tc = itEdge0;

    //UV only now, we got our x's  and y's already.
    var tcScanStep = itEdge1.subtract(tc).divideScalar(itEdge1.position.position[0] - itEdge0.position.position[0]);


    tc = itEdge0.add(tcScanStep.multiplyScalar(xStart + 0.5 - itEdge0.position.position[0]));



    for(var x = xStart; x < xEnd; x++) {

      //Get the original z value. Use it to get the 'real' texture coordinates.
      var z = 1 / tc.position.position[2];
      var ptc = tc.multiplyScalar(-z);


      var textureX = Math.max(Math.min(Math.trunc(ptc.uv.position[0] * texture_width), tex_clamp_x), 0);
      if(textureX < 0) {
        textureX = 0;
      }
      var textureY = Math.max(Math.min(Math.trunc(ptc.uv.position[1] * texture_height), tex_clamp_y), 0);
      if(textureY < 0) {
        textureY = 0;
      }
      //console.log(textureX + " " + textureY);

      var pos = (textureX * 4) + (texture_width * textureY * 4);
      //console.log(pos);
        if(this.ZBuffer.Ztest(x,y,z)) {
          //this.drawPixel(x,y, pixelShader.get(ptc))
          this.drawPixel(x, y,
                        [texture.data[pos],
                        texture.data[pos + 1],
                        texture.data[pos + 2],
                        texture.data[pos + 3]]);
        }

      tc = tc.add(tcScanStep);
    }

      itEdge0 = itEdge0.add(dv0);
      itEdge1 = itEdge1.add(dv1);
  }
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


//Transformation matrices
Render.prototype.vertexTransformer = function(vertex, camera_inverse, object_transform) {


      //local to world

      var point = object_transform.multMatrixVec3(vertex)
      //world to camera
      var point = camera_inverse.multMatrixVec3(point);




  return point;
}

//Perspective_divide, ndc, raster space
//We multiply the entire vertex with the inverse of the Z position. Then, we do the normal raster conversion on the positions

Render.prototype.vertexToRaster = function(vertex_orig) {

  var vertex = vertex_orig;
  var zInv = (1/vertex.position.position[2]);
  //console.log(zInv);

  vertex = vertex.multiplyScalar(-zInv);

  //persp_divide. Only need to multiply with ZNear now, since we already multiplied by the inverse of Z
  vertex.position.position[0] = (vertex.position.position[0] )  * Znear;
  vertex.position.position[1] = (vertex.position.position[1] ) * Znear;
  vertex.position.position[2] = zInv;
  // console.log(point_pd.position[0] + " " +  point_pd.position[1] + " " + point_pd.position[2]);
  // console.log(cleft + " " +  cright + " " + ctop + " " + cbottom + " " + Znear);
  //console.log("new");
  //console.log(point_pd.position[0] + " < " + (cleft - 10) + "?: " + (point_pd.position[0] < (cleft - 10)) );

  //ndc (range of [0,1])
  vertex.position.position[0] = (vertex.position.position[0] + cright) / (2 * cright);       //x + canvas_width * 0.5    / canvas_width
  vertex.position.position[1] = (vertex.position.position[1] + ctop ) / (2 * ctop);       //y + canvas_height * 0.5 / canvas_height

  //raster coords (pixels)
  vertex.position.position[0] = ((vertex.position.position[0] * this.screenWidth) ) | 0;
  vertex.position.position[1] = (((1 - vertex.position.position[1] ) * this.screenHeight) ) | 0;

  return vertex;
}

Render.prototype.backFaceCull = function(face, camera_inverse) {
  //Dot product, back culling
  //renderVertices will do all the transformations and conversion to raster_coordinates
  //It returns the indices of the imgArray it should be drawn on

  //To do backface culling: We need the face's normal.
  //We can only compute this by creaing 2 vectors of the vertices of the face, and crossing them.
  //Then, we do a dot product with our viewing vector, which is the difference between the camera's position and the normal vector
  //If the dot product results in 0 or less, it means the normal is pointing away from us.
  var line1 = new Vector3(
      face.vertices[1].position.position[0] - face.vertices[0].position.position[0],
      face.vertices[1].position.position[1] - face.vertices[0].position.position[1],
      face.vertices[1].position.position[2] - face.vertices[0].position.position[2]
    );
  var line2 = new Vector3(
      face.vertices[2].position.position[0] - face.vertices[0].position.position[0],
      face.vertices[2].position.position[1] - face.vertices[0].position.position[1],
      face.vertices[2].position.position[2] - face.vertices[0].position.position[2]
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

  var dot_result = face.vertices[0].position.dot(normal);
  //var dot_result = normal.dot(face.vertices[0].position);
  if(dot_result >= 0) {
    return false;
  }

  return true;
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
