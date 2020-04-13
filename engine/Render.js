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

}


/**
Draws a Uint8ClampedArray to the canvas
This array holds 4 elements for each pixel: R G B and A, values are between 0 and 255
**/
Render.prototype.draw = function(imageArray) {

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

Render.prototype.drawPixel = function(imgArray, x, y, r, g, b, a) {
  var pixel = ((x * 4) + (this.screenWidth * y * 4));

  //console.log(pixel);
  if(pixel > 10000) {
    //console.log(pixel);
  }
  this.imgArray[pixel] = r;
  this.imgArray[pixel + 1] = g;
  this.imgArray[pixel + 2] = b;
  this.imgArray[pixel + 3] = a;

}


/**
*
* Main rendering function
* In the future, it should take an array of modelGeometry
**/
Render.prototype.render = function(modelGeometry, camera_inverse, object_transform, camera) {

  //this.ctx.clearRect(0,0, this.screenWidth, this.screenHeight);
  var screenWidth = this.screenWidth;
  this.imgArray = new Uint8ClampedArray(4 * this.screenWidth * this.screenHeight);



  // The virtual image plane
  var canvasWidth = 1;
  var canvasHeight =  1;


  //imgArray = this.renderVertices(imgArray, modelGeometry.positions, camera_inverse, object_transform);
  //var imgArray = this.renderFaces(imgArray, modelGeometry, camera_inverse, object_transform);
  //var raster_pixels = this.renderVertices(modelGeometry.positions, camera_inverse, object_transform);
  var vertexCount = modelGeometry.positions.length;
  var pixels = []
  for(var i = 0; i < vertexCount; i++) {
    pixels.push(this.vertToRaster(modelGeometry.positions[i], camera_inverse, object_transform));
  }


  //Coloring triangles
  if(globalState.face === true) {
    var faceCount = modelGeometry.faces.length;
    for (var i = 0; i < faceCount; i++) {

      var face = modelGeometry.faces[i];

      var vertices = [];
      var uvs = [];
      //We take each index specified in the face, and push them to the vertices array.
      //The vertices in the array are to be drawn to the screen
      var complete = true;
      for(var j = 0; j < 3; j++) {
          var currentVertex = face.vertices[j];
          var vertexIndex = currentVertex.id;
          // console.log(vertexIndex);
          // console.log(pixels[vertexIndex]);

          if(pixels[vertexIndex] ===  -1) {
            complete = false;
            //Triangle is not rendered completely, so ignore this one for now
            break;
          }

          //Get the pixel of the vertex
          currentVertex.position = pixels[vertexIndex];
          //console.log(currentVertex);

          //Get the uv coordinates belonging to the vertex
      }

      if(!complete || !this.backFaceCull(face, camera_inverse)) {
        continue;
      }

      //console.log("current id: " + face.vertices[0].id);
      //console.log(face.vertices[0].uv.position[0] + " " + face.vertices[0].uv.position[1])

      this.renderFace(imgArray, face, modelGeometry.texture, i);

      //Wireframe mode
      // if(globalState.wireFrame === true) {
      //   this.renderWireFrame(pixels, modelGeometry.edges);
      // }
    }

  }


  //Actually draw the image array on the canvas
  this.draw(imgArray);
}

//Draw a face
Render.prototype.renderFace = function(imgArray, face, texture, c) {
  //We are going to color the Triangle
  var color = "blue";
  //console.log(c);
  if(c % 2 == 0) {
    color = "red";
  }

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

    this.renderFlatTopFace([face.vertices[set[0]],
                            face.vertices[set[1]],
                            face.vertices[set[2]]],
                            color, texture);
  }

  //Flat bottom
  else if(face.vertices[set[0]].position.position[1] === face.vertices[set[2]].position.position[1]) {
    //Now, we should sort the bottom vertices by their x values  ASC
    if(face.vertices[set[1]].position.position[0] > face.vertices[set[2]].position.position[0]) {
      var temp = set[1];
      set[1] = set[2];
      set[2] = temp;
    }


    this.renderFlatBottomFace([face.vertices[set[0]],
                               face.vertices[set[1]],
                               face.vertices[set[2]]],
                               [0,0,255], texture);
  }

  //General
  else {
    this.renderGeneralFace([face.vertices[set[0]],
                            face.vertices[set[1]],
                            face.vertices[set[2]] ],
                            color, texture);
  }

  return imgArray;
}

Render.prototype.renderFlatBottomFace = function(vertices, color, texture) {
  console.log("flat bottom");
  var positions = [vertices[0].position, vertices[1].position, vertices[2].position];
  var uvs = [vertices[0].uv, vertices[1].uv, vertices[2].uv];

  var yStart = Math.ceil(positions[0].position[1] - 0.5);
  var yEnd = Math.ceil(positions[2].position[1] - 0.5);

  var dx1 = (positions[1].position[0] - positions[0].position[0]);
  var dy1 = (positions[1].position[1] - positions[0].position[1]);
  var slope1 = dx1 / dy1;

  var dx2 = ( positions[2].position[0] - positions[0].position[0] );
  var dy2 = (positions[2].position[1] - positions[0].position[1]);
  var slope2 = dx2 / dy2;


                      //UV
    var txEdgeL = new Vector2(uvs[0].position[0], uvs[0].position[1]);
    var txEdgeR = new Vector2(uvs[0].position[0], uvs[0].position[1]);
    var txEdgeBL = new Vector2(uvs[2].position[0], uvs[2].position[1]);
    var txEdgeBR = new Vector2(uvs[1].position[0], uvs[1].position[1]);

    // console.log(positions[0].position[0] + " " + positions[0].position[1]);
    // console.log(positions[1].position[0] + " " + positions[1].position[1]);
    // console.log(positions[2].position[0] + " " + positions[2].position[1]);
    //
    // console.log(txEdgeL.position[0] + " " + txEdgeL.position[1]);
    // console.log(txEdgeR.position[0] + " " + txEdgeR.position[1]);
    // console.log(txEdgeBL.position[0] + " " + txEdgeBL.position[1]);
    // console.log(txEdgeBR.position[0] + " " + txEdgeBR.position[1]);


  //unit steps
  var txEdgeStepR = (txEdgeBL.subtractVector(txEdgeL)).divideScalar(dy1);
  var txEdgeStepL = (txEdgeBR.subtractVector(txEdgeR)).divideScalar(dy2);

  console.log(txEdgeStepL.position[0] + " " + txEdgeStepL.position[1]);
  console.log(txEdgeStepR.position[0] + " " + txEdgeStepR.position[1]);

  //prestep
  txEdgeL = txEdgeL.addVector( txEdgeStepL.multiplyScalar( yStart - positions[0].position[1] + 0.5));
  txEdgeR = txEdgeR.addVector( txEdgeStepR.multiplyScalar( yStart - positions[0].position[1] + 0.5));
  console.log(txEdgeL.position[0] + " " + txEdgeL.position[1]);
  console.log(txEdgeR.position[0] + " " + txEdgeR.position[1]);

  //uv texture coords clamp
  var texture_width = texture.width;
  var texture_height = texture.height;
  var tex_clamp_x = texture_width - 1.0;
  var tex_clamp_y = texture_height - 1.0;

  var counter = 0;
  for(var y = yStart; y > yEnd; y--) {


    var px0 = slope1 * (y - positions[0].position[1] + 0.5) + positions[0].position[0];
    var px1 = slope2 * (y - positions[0].position[1] + 0.5) + positions[0].position[0]

    var xStart = Math.floor(px0 - 0.5);
    var xEnd = Math.floor(px1 - 0.5);

    if(xStart < 0) {
      xStart = 0;
    }
    if(xEnd > this.screenWidth) {
      xEnd = this.screenWidth;
    }

    var tcScanStep = txEdgeR.subtractVector(txEdgeL).divideScalar(px1 - px0);

    var tc = new Vector2();
    tc = txEdgeL.addVector(tcScanStep.multiplyScalar(xStart - 0.5 - px0))

    for(var x = xStart; x < xEnd; x++) {
      //console.log(tc.position[0] + " " + tc.position[1]);
      var textureX = Math.trunc(tc.position[0] * texture_width);
      var textureY = Math.trunc(tc.position[1] * texture_height);
      //console.log(textureX + " " + textureY);

      var pos = (textureX * 4)+(texture_width * textureY * 4);

      if(counter < 9) {
        this.drawPixel(this.imgArray,
                      x, y,
                      color[0],
                      color[1],
                      color[2],
                      255);
      }
      else {
        this.drawPixel(this.imgArray,
                      x, y,
                      texture.data[pos],
                      texture.data[pos + 1],
                      texture.data[pos + 2],
                      texture.data[pos + 3]);
      }


      tc = tc.addVector(tcScanStep);
    }

      counter += 1;
      txEdgeL = txEdgeL.subtractVector(txEdgeStepL);
      txEdgeR = txEdgeR.subtractVector(txEdgeStepR);
  }
}

Render.prototype.renderFlatTopFace = function(vertices, color, texture) {
  //console.log(texture);
  var positions = [vertices[0].position, vertices[1].position, vertices[2].position];
  var uvs = [vertices[0].uv, vertices[1].uv, vertices[2].uv];

  //initiate values to loop over entire face's y range. Subtracting 0.5 to find the correct pixel to start on
  var yStart = Math.ceil(positions[2].position[1] + 0.5);
  var yEnd = Math.ceil(positions[0].position[1] + 0.5);

                                        //UV
  //Get the slopes of the lines. We'll use this to compute the start and end x's for each line we'll draw
  //These are inverted so as to not get inf values
  var dx1 = (positions[2].position[0] - positions[0].position[0] );
  var dy1 = (positions[2].position[1] - positions[0].position[1] ) ;
  var slope1 = dx1 /  dy1;

  var dx2 = (positions[2].position[0] - positions[1].position[0] );
  var dy2 = (positions[2].position[1] - positions[1].position[1] );
  var slope2 = dx2 /  dy2;

                                //UV
  //These are the edges of our texture coordinates.
  //We have to create a new vector for this, to avoid JS standard referencing
  var txEdgeL = new Vector2(uvs[0].position[0], uvs[0].position[1]);
  var txEdgeR = new Vector2(uvs[1].position[0], uvs[1].position[1]);
  var txEdgeB = new Vector2(uvs[2].position[0], uvs[2].position[1]);

  //Now we need to compute the unit steps for the texture coordinates.
  //This must have a vector as result. Meaning: for each step of y we go down, what must be the unit vector step for the UV coords?
  var txEdgeStepL = txEdgeB.subtractVector(txEdgeL).divideScalar(dy1);
  var txEdgeStepR = txEdgeB.subtractVector(txEdgeR).divideScalar(dy2);


  //Now, we need to do the prestep. Since we're working with centers of pixels, the uv coordinates must reflect that as well
  //Since this is a flat top, we can use either v0 or v1 for the offset


  txEdgeL = txEdgeL.addVector( txEdgeStepL.multiplyScalar( yStart - positions[0].position[1] + 0.5 ));
  txEdgeR = txEdgeR.addVector( txEdgeStepR.multiplyScalar( yStart - positions[0].position[1] + 0.5 ));
  //console.log(txEdgeR.position[0] + " " + txEdgeL.position[1])

  //Now, we need to make sure we can clamp our uv coordinates later on when we draw them
  var texture_width = texture.width;
  var texture_height = texture.height;
  var tex_clamp_x = texture_width - 1.0;
  var tex_clamp_y = texture_height - 1.0;

  //This is the vector we will use to actually get the pixel color from the texture. This vector holds the texture coordinates

                        //UV coordinates

  for(var y = yStart; y < yEnd; y++) {
    //y = a(x - x0) + y0
    // y - y0 = a(x - x0)
    // (y - y0)*a + x0 = x      We work with pixel-centers however, so we need to subtract 0.5 from y

    //console.log(txEdgeL.position[0] + " "  + txEdgeL.position[1]);
    var px0 = slope1 * (y - positions[0].position[1] - 0.5) + positions[0].position[0];
    var px1 = slope2 * (y - positions[1].position[1] - 0.5) + positions[1].position[0]

    //We need to subtract 0.5 from the x values as well
    var xStart = Math.ceil(px0 - 0.5);
    if(xStart < 0) {xStart = 0;}
    var xEnd = Math.ceil(px1 - 0.5);
    if(xEnd > this.screenWidth) {
      xEnd = this.screenWidth;
    }
    //console.log(txEdgeR.position[0] + " " + txEdgeL.position[1])

                      //UV coordinates
    //We need to do the same for the UV coordinates: foreach x in pixel coordinates, what is the x in UV coordinates?
    var tcScanStep = txEdgeR.subtractVector(txEdgeL).divideScalar(px1 - px0);

    //prestep 18:56
    var tc = new Vector2();
    tc = txEdgeL.addVector(tcScanStep.multiplyScalar(Math.floor(xStart - 0.5 - px0)))
    for(var x = xStart; x < xEnd; x++) {
      //Finally, we need to read the color from the texture image
      var textureX = Math.trunc(tc.position[0] * texture_width) ;
      var textureY = Math.trunc(tc.position[1] * texture_height) ;

      var pos = (textureX * 4)+(texture_width * textureY * 4);


      this.drawPixel(this.imgArray,
                    x, y,
                    texture.data[pos],
                    texture.data[pos + 1],
                    texture.data[pos + 2],
                    texture.data[pos + 3]);

      tc = tc.addVector(tcScanStep);
    }

    txEdgeL = txEdgeL.addVector(txEdgeStepL);
    txEdgeR = txEdgeR.addVector(txEdgeStepR);
  }
}

//Divide and conquer: split the general face into 2 smaller faces: a flatTop and a flatbottom
Render.prototype.renderGeneralFace = function(vertices, color, texture) {
  var positions = [vertices[0].position, vertices[1].position, vertices[2].position];
  var uvs = [vertices[0].uv, vertices[1].uv, vertices[2].uv];

  //Find the vertex that will split this general face into a FlatBottom and FlatTop using interpolation
  var alpha = (positions[1].position[1] - positions[0].position[1]) /
              (positions[2].position[1] - positions[0].position[1]);

  var vi = new Vertex();
  //vi = v0*(1 - a) + v2*a
  //interpolate positions to get vi's position
  vi.position.position[0] = positions[0].position[0] + alpha * (positions[2].position[0] - positions[0].position[0]);
  vi.position.position[1] = positions[0].position[1] + alpha * (positions[2].position[1] - positions[0].position[1]);

  //We also need to interpolate UV's for vi
  vi.uv.position[0] = vertices[0].uv.position[0] + alpha * (vertices[2].uv.position[0] - vertices[0].uv.position[0]);
  vi.uv.position[1] = vertices[0].uv.position[1] + alpha * (vertices[2].uv.position[1] - vertices[0].uv.position[1]);

  //Major Right
  if(vi.position.position[0] > positions[1].position[0] ) {

    this.renderFlatBottomFace([vertices[0], vertices[1], vi ], [255,0,0], texture);
    this.renderFlatTopFace([vertices[1], vi, vertices[2]], color, texture);
  }
  //Major Left
  if(vi.position.position[0] < positions[1].position[0]) {
    this.renderFlatBottomFace([vertices[0], vi, vertices[1]], [0,255,0], texture);
    this.renderFlatTopFace([vi, vertices[1], vertices[2]], color, texture);
  }
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

          this.ctx.moveTo(pixels[vId].position[0], pixels[vId].position[1])


          this.ctx.lineTo(pixels[adjId].position[0], pixels[adjId].position[1]);
          this.ctx.strokeStyle= "black";
          this.ctx.stroke();
        }
      }
  }
}


//Renders a set of vertices?   It is right now more just a conversion function.
//Right now, the vertices used in this function is from a single face
Render.prototype.vertToRaster = function(vertex, camera_inverse, object_transform) {


      //local to world

      var point = object_transform.multMatrixVec3(vertex)
      //world to camera
      point = camera_inverse.multMatrixVec3(point);

      var rgba = [255, 0, 0, 255];

      //perspective_divide.
      var point_pd = new Vector3(0,0,0);
      point_pd.position[0] = ((point.position[0] )/ (-point.position[2]) ) * Znear;
      point_pd.position[1] = ((point.position[1] ) / (-point.position[2]) ) * Znear;
      point_pd.position[2] = point.position[2];

      // console.log(point_pd.position[0] + " " +  point_pd.position[1] + " " + point_pd.position[2]);
      // console.log(cleft + " " +  cright + " " + ctop + " " + cbottom + " " + Znear);
      //console.log("new");
      //console.log(point_pd.position[0] + " < " + (cleft - 10) + "?: " + (point_pd.position[0] < (cleft - 10)) );






      //ndc (range of [0,1])
      var point_ndc = new Vector3(0,0,0);
      point_ndc.position[0] = (point_pd.position[0] + cright) / (2 * cright);       //x + canvas_width * 0.5    / canvas_width
      point_ndc.position[1] = (point_pd.position[1] + ctop ) / (2 * ctop);       //y + canvas_height * 0.5 / canvas_height

      //raster coords (pixels)
      var point_raster = new Vector3(0,0,0);
      point_raster.position[0] = ((point_ndc.position[0] * this.screenWidth) ) | 0;
      point_raster.position[1] = (((1 - point_ndc.position[1] ) * this.screenHeight) ) | 0;

  return point_raster;
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
      face.vertices[0].position.position[0] - face.vertices[1].position.position[0],
      face.vertices[0].position.position[1] - face.vertices[1].position.position[1],
      face.vertices[0].position.position[2] - face.vertices[1].position.position[2]
    );
  var line2 = new Vector3(
      face.vertices[0].position.position[0] - face.vertices[2].position.position[0],
      face.vertices[0].position.position[1] - face.vertices[2].position.position[1],
      face.vertices[0].position.position[2] - face.vertices[2].position.position[2]
  );

  // console.log(line1);
  // console.log(line2);
  var normal = line1.cross(line2);

  var view_vec = new Vector3(
    camera_inverse.fields[0][3] - face.vertices[1].position.position[0],
    camera_inverse.fields[1][3] - face.vertices[1].position.position[1],
    camera_inverse.fields[2][3] - face.vertices[1].position.position[2]
  )

  var dot_result = view_vec.dot(normal);
  if(dot_result < 0) {
    //face.culled = true;
    return false;
  }

  return true;
}

//Bresenham algorithm to draw lines
Render.prototype.bresenham = function(x1, y1, x2, y2) {

}
