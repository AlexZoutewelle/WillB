
//Used for rasterization:

  //milimeters
  var focalLength = 15;
  var filmWidth = 21.023;
  var filmHeight = 21.023;

  var Znear = 1;
  var Zfar = 10000;

  // var angleOfView = 90;
  //var canvasSize = 2 * Math.atan(angleOfView * 0.5) * Znear;

  //Canvas dimensions
  var ctop = (filmHeight * 0.5 / focalLength) * Znear ;
  var cbottom = -ctop;
  var cright = (filmWidth * 0.5 / focalLength) * Znear;
  var cleft = -cright;

console.log(ctop + " "  + cbottom + " " + cright + " "  + cleft);

var aspect_ratio = 1.33333;
var hfov = 1.333;
var vfov = hfov / aspect_ratio;


//w, h, n f
//hfov, aspect_ratio, 0.2, 6.0

console.log(cright - cleft)
console.log(filmWidth/2);

var projectionMatrix = new Transformation([
  [(Znear * 2) / (hfov),     0,                                       0,                                   0],
  [0,                                  (Znear * 2)/(aspect_ratio),            0,                                  0],
  [0,                                   0,                                      (Zfar ) /(Zfar - Znear),      1],
  [0,                                   0,                                ((-Znear * Zfar) / (Zfar - Znear)),   0]
]);

projectionMatrix = projectionMatrix.transpose();



function Render(screenWidth, screenHeight) {
  this.canvas = document.getElementById('screen');

  this.ctx = this.canvas.getContext('2d');
  this.canvas.requestPointerLock();
  console.log(this);

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


Render.prototype.drawPixel = function(x, y, color, z) {
  //console.log(color.position[0] + " " + color.position[1] + " " + color.position[2] + " " + color.position[3]);
  var pixel = (y * this.screenWidth + x);
  this.buf32[pixel] =
    (color.position[3] << 24)  |   //A
    (color.position[2] << 16)  |   //B
    (color.position[1] << 8)   |   //G
    (color.position[0]);           //R



    if(z) {
      this.ZBuffer.Ztest(x, y, 0.000001)
    }
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

  // console.log('new loop');
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
      vertex_in.id = i;


      vertex_in.position = modelGeometry.positions[vertexIds.pos];
      if(typeof(modelGeometry.uvs) !== "undefined") {
        vertex_in.uv = modelGeometry.uvs[vertexIds.uv];
      }
      vertex_in.normal = modelGeometry.normals[vertexIds.norm];

      //console.log(vertex_in);
      verticesOut.push(this.vertexTransformer(vertex_in, camera_inverse));

    }

    //Triangle assembly
    var cullCount = 0;
    var faceCount = modelGeometry.faces.length;
    for (var i = 0; i < faceCount; i++) {

      var face = modelGeometry.faces[i];
      var v0 = verticesOut[face.vertices[0]];
      // v0.color = new Vector3(255, 0, 0);
      // v0.color.position[3] = 255;
      var v1 = verticesOut[face.vertices[1]];
      // v1.color = new Vector3(0, 255, 0);
      // v1.color.position[3] = 255;
      var v2 = verticesOut[face.vertices[2]];
      // v2.color = new Vector3(0, 0, 255);
      // v2.color.position[3] = 255;


      if(!this.backFaceCull(v0, v1, v2, camera)) {
        cullCount = cullCount + 1;
        //console.log('culled: ' +  v0.id + ' ' + v1.id + ' ' + v2.id)
        continue;
      }


      this.processFace(v0, v1, v2, modelGeometry.texture);
    }
  }
  // console.log('cullCount: ' + cullCount);

  //Actually draw the image array on the canvas
  this.draw();
}

Render.prototype.vertexTransformer = function(vertex, camera_inverse) {

  //Vertex shaders
  //Save a copy of the world position

  vertex.worldPos = vertex.position.copy();

  //Transform to camera coordinate system
  vertex.position = camera_inverse.multMatrixVec3(vertex.position);


  vertex.position = projectionMatrix.multMatrixVec3(vertex.position);


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
      v1.position.position[3] - v0.position.position[3]
    );
  var line2 = new Vector3(
      v2.position.position[0] - v0.position.position[0],
      v2.position.position[1] - v0.position.position[1],
      v2.position.position[3] - v0.position.position[3]
  );

  var normal = line1.cross(line2).normalize();

  var view_vec = new Vector3(
      -v0.position.position[0] ,
      -v0.position.position[1] ,
      -v0.position.position[3]
  )

  var dot_result = normal.dot(view_vec);
  if(dot_result < 0) {

    return false;
  }
  if(renderNormalBool) {
    this.renderNormal(v0,v1,v2, normal);
  }

  return true;
}

Render.prototype.renderNormal = function(v0c,v1c,v2c, normal) {
  //We want to get a position vector that is exactly in the middle of v0, v1 and v2
  //var area = EdgeFunction(v0,v1,v2);
  v0 = v0c.copy();
  v1 = v1c.copy();
  v2 = v2c.copy();


  var w0_current =  1/3 ;
  var w1_current =  1/3 ;
  var w2_current =  1/3 ;


  var vmiddle = new Vertex();
  vmiddle.position = new Vector3();

  vmiddle.position.position[0] =  (v0.position.position[0] +
                            (w1_current * (v1.position.position[0] - v0.position.position[0]) ) +
                            (w2_current * (v2.position.position[0] - v0.position.position[0])));
  vmiddle.position.position[1] =  (v0.position.position[1] +
                            (w1_current * (v1.position.position[1] - v0.position.position[1]) ) +
                            (w2_current * (v2.position.position[1] - v0.position.position[1])));
  vmiddle.position.position[2] =  (v0.position.position[2] +
                            (w1_current * (v1.position.position[2] - v0.position.position[2]) ) +
                            (w2_current * (v2.position.position[2] - v0.position.position[2])));
  vmiddle.position.position[3] =  (v0.position.position[3] +
                            (w1_current * (v1.position.position[3] - v0.position.position[3]) ) +
                            (w2_current * (v2.position.position[3] - v0.position.position[3])));




  var vnend = new Vertex();

  vnend.position = projectionMatrix.multMatrixVec3(normal);


  var nendPos = vmiddle.position.addVector(vnend.position)
  vnend.position = nendPos;

  var green = new Vector3(255,0,0);
  green.position[3] = 255;

  v0 = this.vertexToRaster(v0);
  v1 = this.vertexToRaster(v1);
  v2 = this.vertexToRaster(v2);
  vmiddle = this.vertexToRaster(vmiddle);
  vnend = this.vertexToRaster(vnend);




  //We want to drow from the vertex position to the end of the normal
  //Meaning, we need to create a vector at the position of the end of the normal, to use bresenham on


    //----Drawing

    var cyan = new Vector3(255,0,0);
    cyan.position[3] = 255;

    var red = new Vector3(255,0,0);
    red.position[3] = 255;

    var green = new Vector3(0,255,0);
    green.position[3] = 255;

    var blue = new Vector3(0,0,255);
    blue.position[3] = 255;

    var yellow = new Vector3(255,255,0);
    yellow.position[3] = 255;

    if(vmiddle.position.position[0] > 0  && vmiddle.position.position[1] < this.screenWidth) {
      this.drawPixel(    vmiddle.position.position[0], vmiddle.position.position[1], cyan, true);
      this.drawPixel(    vmiddle.position.position[0] + 1, vmiddle.position.position[1] + 1, cyan, true);
      this.drawPixel(    vmiddle.position.position[0], vmiddle.position.position[1] + 1, cyan, true);
      this.drawPixel(    vmiddle.position.position[0] + 1, vmiddle.position.position[1], cyan, true);
    }

    if(v0.position.position[0] > 0  && v0.position.position[1] < this.screenWidth) {
      this.drawPixel(    v0.position.position[0], v0.position.position[1], red, true);
      this.drawPixel(    v0.position.position[0] + 1, v0.position.position[1] + 1, red, true);
      this.drawPixel(    v0.position.position[0], v0.position.position[1] + 1, red, true);
      this.drawPixel(    v0.position.position[0] + 1, v0.position.position[1], red, true);
      this.drawPixel(    v0.position.position[0] - 1, v0.position.position[1] - 1, red, true);
      this.drawPixel(    v0.position.position[0], v0.position.position[1] - 1, red, true);
      this.drawPixel(    v0.position.position[0] - 1, v0.position.position[1], red, true);
    }

    if(v1.position.position[0] > 0  && v1.position.position[1] < this.screenWidth) {
      this.drawPixel(    v1.position.position[0], v1.position.position[1], green, true);
      this.drawPixel(    v1.position.position[0] + 1, v1.position.position[1] + 1, green, true);
      this.drawPixel(    v1.position.position[0], v1.position.position[1] + 1, green, true);
      this.drawPixel(    v1.position.position[0] + 1, v1.position.position[1], green, true);
      this.drawPixel(    v1.position.position[0] - 1, v1.position.position[1] - 1, green, true);
      this.drawPixel(    v1.position.position[0], v1.position.position[1] - 1, green, true);
      this.drawPixel(    v1.position.position[0] - 1, v1.position.position[1], green, true);
    }

    if(v2.position.position[0] > 0  && v2.position.position[1] < this.screenWidth) {
      this.drawPixel(    v2.position.position[0], v2.position.position[1], blue, true);
      this.drawPixel(    v2.position.position[0] + 1, v2.position.position[1] + 1, blue, true);
      this.drawPixel(    v2.position.position[0], v2.position.position[1] + 1, blue, true);
      this.drawPixel(    v2.position.position[0] + 1, v2.position.position[1], blue, true);
      this.drawPixel(    v2.position.position[0] - 1, v2.position.position[1] - 1, blue, true);
      this.drawPixel(    v2.position.position[0], v2.position.position[1] - 1, blue, true);
      this.drawPixel(    v2.position.position[0] - 1, v2.position.position[1], blue, true);
    }


    if(vnend.position.position[0] > 0  && vnend.position.position[1] < this.screenWidth) {
      this.drawPixel(    vnend.position.position[0], vnend.position.position[1], yellow, true);
      this.drawPixel(    vnend.position.position[0] + 1, vnend.position.position[1] + 1, yellow, true);
      this.drawPixel(    vnend.position.position[0], vnend.position.position[1] + 1, yellow, true);
      this.drawPixel(    vnend.position.position[0] + 1, vnend.position.position[1], yellow, true);
      this.drawPixel(    vnend.position.position[0] - 1, vnend.position.position[1] - 1, yellow, true);
      this.drawPixel(    vnend.position.position[0], vnend.position.position[1] - 1, yellow, true);
      this.drawPixel(    vnend.position.position[0] - 1, vnend.position.position[1], yellow, true);
    }



  this.bresenham(vmiddle.position.position[0], vmiddle.position.position[1], vnend.position.position[0], vnend.position.position[1], green);

  var wireframeColor = new Vector3(255,255,255);
  wireframeColor.position[3] = 255;
  this.bresenham(v0.position.position[0], v0.position.position[1], v1.position.position[0], v1.position.position[1], wireframeColor, true )
  this.bresenham(v1.position.position[0], v1.position.position[1], v2.position.position[0], v2.position.position[1], wireframeColor, true )
  this.bresenham(v2.position.position[0], v2.position.position[1], v0.position.position[0], v0.position.position[1], wireframeColor, true )


}

Render.prototype.processFace = function(v0, v1, v2, texture) {


  //Fustrum Cull test
  //We need to check if a triangle is completely out of the visible fustrum. If it is, we return immediately: we cull this triangle.

  //Z-plane clipping
  //The Z-Plane clipper outputs 1 or more triangles as a result of clipping the original triangle

  if(v0.position.position[2] < 0 &&
     v1.position.position[2] < 0 &&
     v2.position.position[2] < 0) {
      return;
  }
  if(v0.position.position[0] > v0.position.position[3] &&
     v1.position.position[0] > v1.position.position[3] &&
     v2.position.position[0] > v2.position.position[3]) {
      return;
    }
    if(v0.position.position[0] < -v0.position.position[3] &&
       v1.position.position[0] < -v1.position.position[3] &&
       v2.position.position[0] < -v2.position.position[3]) {
        return;
    }
    if(v0.position.position[1] > v0.position.position[3] &&
       v1.position.position[1] > v1.position.position[3] &&
       v2.position.position[1] > v2.position.position[3]) {
        return;
      }
      if(v0.position.position[1] < -v0.position.position[3] &&
         v1.position.position[1] < -v1.position.position[3] &&
         v2.position.position[1] < -v2.position.position[3]) {
          return;
        }
  if(v0.position.position[2] > v0.position.position[3] &&
     v1.position.position[2] > v1.position.position[3] &&
     v2.position.position[2] > v2.position.position[3]) {
      return;
  }
  //Z Clipping test
  if(v0.position.position[2] < 0){
    if(v1.position.position[2] < 0 ) {
      //Clip for v0 and v1
      this.clipForTwo(v0, v1, v2);
    }
    else if(v2.position.position[2] < 0) {
      //Clip for v0 and v2
      this.clipForTwo(v2, v0, v1);
    }
    else {
      //Clip for v0
      this.clipForOne(v0, v1, v2);
    }
  }

  else if(v1.position.position[2] < 0) {
    if(v2.position.position[2] < 0) {
      //Clip for v1 and v2
      this.clipForTwo(v1, v2, v0);
    }
    else {
      //Clip for v1
      this.clipForOne(v1, v2, v0);
    }
  }

  else if(v2.position.position[2] < 0) {
    //Clip for v2
    this.clipForOne(v2, v0, v1);
  }

  else {
    //No need for clipping
      this.postProcessFace(v0, v1, v2);
  }
}

Render.prototype.clipForOne = function(v0,v1,v2) {
    //We need to create 2 new vertices, because we will be clipping v0 on the Z axis here.
    //So, we interpolate v0.z -> v1.z   and v0.z -> v2.z
    //How do we know the order of these vertices? All because of our previously done Clipping tests.
    var alphaA = (-v0.position.position[2]) / (v1.position.position[2] - v0.position.position[2]);
    var alphaB = (-v0.position.position[2]) / (v2.position.position[2] - v0.position.position[2]);

    var v0a = new Vertex();
    var v0b = new Vertex();

    //Interpolate position
    v0a.position = v0.position.interpolateTo(v1.position, alphaA);
    v0b.position = v0.position.interpolateTo(v2.position, alphaB);

    //Interpolate attributes
    v0a = interpolateTo(v0a, v0, v1, alphaA);
    v0b = interpolateTo(v0b, v0, v2, alphaB);


    //We need to make copies of v1, and of v0b.
    v1c = v1.copy();
    v0bc = v0b.copy();


    //So now, we have 2 new triangles to process.
    this.postProcessFace( v0b, v1, v2);
    this.postProcessFace( v0a, v1c, v0bc);




    //----BARYCENTRIC COORDINATES METHOD ----

    // var v0a = v0.position.interpolateTo(v1.position, alphaA);
    // var v0b = v0.position.interpolateTo(v2.position, alphaB);

    //So now, we have 2 new triangles to process.

    // var area1 = EdgeFunction(v0.position, v1.position, v2.position);
    // console.log(area1);
    //
    // var w1a = EdgeFunction(v2.position, v0.position, v0a) / area1;
    // var w2a = EdgeFunction(v0.position, v1.position, v0a) / area1;
    //
    // var w1b = EdgeFunction(v2.position, v0.position, v0b) / area1;
    // var w2b = EdgeFunction(v0.position, v1.position, v0b) / area1;
    //
    // var p1 = new Vertex();
    // p1.position = v0a;
    // var p2 = new Vertex();
    // p2.position = v0b;
    //
    //
    // v0c = v0.copy();
    // v1c = v1.copy();
    // v2c = v2.copy();
    //
    // v0c.color = v0c.color.multiplyScalar(v0c.position.position[3])
    // v1c.color = v1c.color.multiplyScalar(v1c.position.position[3])
    // v2c.color = v2c.color.multiplyScalar(v2c.position.position[3])
    //
    // var color = new Vector3(0,0,0);
    // color.position[0] = v0c.color.position[0] + (w1a * (v1c.color.position[0] - v0c.color.position[0]) ) + (w2a * (v2c.color.position[0] - v0c.color.position[0]));
    // color.position[1] = v0c.color.position[1] + (w1a * (v1c.color.position[1] - v0c.color.position[1]) ) + (w2a * (v2c.color.position[1] - v0c.color.position[1]));
    // color.position[2] = v0c.color.position[2] + (w1a * (v1c.color.position[2] - v0c.color.position[2]) ) + (w2a * (v2c.color.position[2] - v0c.color.position[2]));
    // color.position[3] = 255;
    // p1.color = color.multiplyScalar(1/p1.position.position[3]);
    //
    // var color2 = new Vector3(0,0,0);
    // color2.position[0] = v0c.color.position[0] + (w1b * (v1c.color.position[0] - v0c.color.position[0]) ) + (w2b * (v2c.color.position[0] - v0c.color.position[0]));
    // color2.position[1] = v0c.color.position[1] + (w1b * (v1c.color.position[1] - v0c.color.position[1]) ) + (w2b * (v2c.color.position[1] - v0c.color.position[1]));
    // color2.position[2] = v0c.color.position[2] + (w1b * (v1c.color.position[2] - v0c.color.position[2]) ) + (w2b * (v2c.color.position[2] - v0c.color.position[2]));
    // color.position[3] = 255;
    // p2.color = color2.multiplyScalar(1/p2.position.position[3]);

    // p2c = p2.copy();
    // v1c = v1.copy();


    // this.postProcessFace( p2, v1, v2);
    // this.postProcessFace(p1,v1c, p2c);
}

Render.prototype.clipForTwo = function(v0,v1,v2) {
  //We again need to create 2 new vertices.
  var alphaA = (-v0.position.position[2]) / (v2.position.position[2] - v0.position.position[2]);
  var alphaB = (-v1.position.position[2]) / (v2.position.position[2] - v1.position.position[2]);

  //Interpolate attributes
  v0c = v0.copy();
  v1c = v1.copy();

  //Interpolate position
   v0c.position = v0.position.interpolateTo(v2.position, alphaA);
   v1c.position = v1.position.interpolateTo(v2.position, alphaB);

   v0c = interpolateTo(v0c, v0, v2, alphaA);
   v1c = interpolateTo(v1c, v1, v2, alphaB);

  //We only need to process a single face this time though.
  this.postProcessFace(v0c, v1c, v2);

 }

Render.prototype.postProcessFace = function(v0, v1, v2, texture) {

  v0 = this.vertexToRaster(v0);
  v1 = this.vertexToRaster(v1);
  v2 = this.vertexToRaster(v2);

  //console.log('new tri')
  this.startSweep(v0, v1, v2 )

  //this.drawFace(v0, v1, v2 )
}



//Perspective_divide->ndc, raster space
//We multiply the entire vertex with the inverse of the Z position. Then, we do the normal raster conversion on the positions
Render.prototype.vertexToRaster = function(vertex_orig) {
  var vertex = vertex_orig;

  vertex.position = vertex.position.divideScalar(vertex.position.position[3]);
  vertex.position.position[3] = 1/vertex.position.position[3];

  vertex.position.position[0] = (( (vertex.position.position[0] + 1) * this.screenWidth * 0.5 )) | 0;
  vertex.position.position[1] = (( (1 - vertex.position.position[1]) * this.screenHeight * 0.5 )) | 0;
  vertex.position.position[2] = (((Zfar - Znear) * 0.5) * vertex.position.position[2] + ((Zfar + Znear)*0.5) ) | 0;
  return vertex;
}

//Pixel Barycentric coordinates
var w0;
var w1;
var w2;
//Unit steps
var a12;
var b12;
var a20;
var b20;
var a01;
var b01;
var triArea;

//Stamp barycentric coordinates

//Stamp barycentrics
var wo01;
var wo12;
var wo20;

var wrt01;
var wrt12;
var wrt20;

var wrb01;
var wrb12;
var wrb20;

var wlb01;
var wlb12;
var wlb20;

//Stamp unit steps
var a12_h;
var b12_h;

var a20_h;
var b20_h;

//Half step for stamp
var a01_h;
var b01_h;

//Trianble bounding box
var tri_minX;
var tri_maxX;
var tri_minY;
var tri_maxY;

Render.prototype.probeRight = function(w0, w1, w2) {
  // console.log('probeRight');

  //Edge v0-v1
  wrb01 = w2 + a01_h - b01_h;
  wrt01 = w2 + a01_h + b01_h;
  if(wrb01 < 0 && wrt01 < 0) {
    //The entire edge is outside of the triangle, so we can return False
    return false;
  }


  wrt12 = w0 + a12_h - b12_h;
  wrb12 = w0 + a12_h + b12_h;
  if(wrt12 < 0 && wrb12 < 0) {
    //The entire edge is outside of the triangle, so we can return False
    return false;
  }


  wrt20 = w1 + a20_h - b20_h;
  wrb20 = w1 + a20_h + b20_h;
  if(wrt20 < 0 && wrb20 < 0) {
    //The entire edge is outside of the triangle, so we can return False
    return false;
  }
  //If we made it here, we have a successful upper probe, and we can continue sweeping on y + 1

  return true;
}


Render.prototype.probeUp = function(w0, w1, w2) {
  //When we are probing up, we check if the upper edge (o-rt) intersects the triangle, or if the edge is within the triangle completely
  //Since we are using barycentric coordinates, it is simply a matter of adding the stamp's unit steps to the current positions barycentrics

  //Edge v0-v1
  wo01 = w2 - a01_h - b01_h;
  wrt01 = w2 + a01_h - b01_h;

  if(wo01 < 0 && wrt01 < 0) {
    //The entire edge is outside of the triangle, so we can return False
    return false;
  }


  wo12 = w0 - a12_h - b12_h;
  wrt12 = w0 + a12_h - b12_h;
  if(wo12 < 0 && wrt12 < 0) {
    //The entire edge is outside of the triangle, so we can return False
    return false;
  }


  wo20 = w1 - a20_h - b20_h;
  wrt20 = w1 + a20_h - b20_h;
  if(wo20 < 0 && wrt20 < 0) {
    //The entire edge is outside of the triangle, so we can return False
    return false;
  }

  //If we made it here, we have a successful upper probe, and we can continue sweeping on y + 1
  return true;
}


Render.prototype.probeDown = function(w0, w1, w2) {
  //Edge v0-v1
  wlb01 = w2 - a01_h + b01_h;
  wrb01 = w2 + a01_h + b01_h;
  // console.log('w2 in probeUp: ' + w2);
  // console.log(wo01 + " " + wrt01);

  if(wlb01 < 0 && wrb01 < 0) {
    // console.log('upper edge is not valid for     v0-v1')

    //The entire edge is outside of the triangle, so we can return False
    return false;
  }


  wlb12 = w0 - a12_h + b12_h;
  wrb12 = w0 + a12_h + b12_h;
  if(wlb12 < 0 && wrb12 < 0) {
     //console.log('upper edge is not valid for     v1-v2')

    //The entire edge is outside of the triangle, so we can return False
    return false;
  }


  wlb20 = w1 - a20_h + b20_h;
  wrb20 = w1 + a20_h + b20_h;
  if(wlb20 < 0 && wrb20 < 0) {
    //console.log('upper edge is not valid for     v2-v0')

    //The entire edge is outside of the triangle, so we can return False
    return false;
  }
  //If we made it here, we have a successful upper probe, and we can continue sweeping on y + 1
  // console.log('successful probe down: ' + w0 + " " + w1 + " " + w2);
  // console.log('wo01 and wrt01: ' + wo01 + " " + wrt01)


  return true;
}


Render.prototype.startSweep = function(v0, v1, v2) {
  //Setting up constants for the edge function. A is the unit step on the x-axis. B is the unit step on the y-axis
  //v1, v2, p
  a12 = v1.position.position[1] - v2.position.position[1];
  b12 = v2.position.position[0] - v1.position.position[0];
  //Half step for stamp
  a12_h = a12 / 2;
  b12_h = b12 / 2;


  //v2, v0, p
  a20 = v2.position.position[1] - v0.position.position[1];
  b20 = v0.position.position[0] - v2.position.position[0];
  //Half step for stamp
  a20_h = a20 / 2;
  b20_h = b20 / 2;


  //v0, v1, p
  a01 = v0.position.position[1] - v1.position.position[1];
  b01 = v1.position.position[0] - v0.position.position[0];
  //Half step for stamp
  a01_h = a01 / 2;
  b01_h = b01 / 2;


  //Triangle's bounding box
  minX = getMin3(v0.position.position[0], v1.position.position[0], v2.position.position[0]);
  maxX = getMax3(v0.position.position[0], v1.position.position[0], v2.position.position[0]);
  minY = getMin3(v0.position.position[1], v1.position.position[1], v2.position.position[1]);
  maxY = getMax3(v0.position.position[1], v1.position.position[1], v2.position.position[1]);

  triArea = EdgeFunction(v0.position, v1.position, v2.position);

  //Get the starting position: the UpperLeft-most vertex
  var currentP = getMinXVertex(v0,v1,v2).position.copy();

  w0 = EdgeFunction(v1.position, v2.position, currentP);
  w1 = EdgeFunction(v2.position, v0.position, currentP);
  w2 = EdgeFunction(v0.position, v1.position, currentP);

  var validUp = false;
  var validDown = false;

  var validRight;

  do {
    //Vertex is still in the triangle
    //Check for valid Up and Down, if they don't exist yet
    if(validUp === false) {
      if(this.probeUp(w0, w1, w2) ) {
        //We have a validUp. We need to save its context for a future call to sweepUp()

        var upP = currentP.copy();
        upP.position[1] -= 1 ;  //Remember, Raster Space is inversed, so minus 1!

        validUp = [upP, v0, v1, v2, w0 - b12, w1 - b20, w2 - b01 ];
      }
    }
    //
    if(validDown === false) {

      if( this.probeDown(w0, w1, w2) ) {
        //We have a validDown. We need to save its context for a future call to sweepDown()
        var downP = currentP.copy();
        downP.position[1] += 1 ;
        validDown = [downP, v0, v1, v2, w0 + b12, w1 + b20, w2 + b01, ];
      }
    }
    //Draw the pixel

    this.drawVertex(currentP, v0, v1, v2, w0, w1, w2)
    validRight = this.probeRight(w0,w1,w2);
    if(validRight) {
        //One step along the x-axis
        currentP.position[0] += 1;
        w0 += a12;
        w1 += a20;
        w2 += a01;
    }
  } while(validRight && currentP.position[0] <= maxX);

  //The first sweep is done. Now, if we have a ValidUp or ValidDown, we need to do the appropriate sweeps
  if(validUp) {
    this.sweepUpper(validUp[0], validUp[1], validUp[2], validUp[3], validUp[4], validUp[5], validUp[6]);
  }

  if(validDown) {
    this.sweepLower(validDown[0], validDown[1], validDown[2], validDown[3], validDown[4], validDown[5], validDown[6]);
  }
}

Render.prototype.sweepUpper = function(currentP, v0, v1, v2, w0, w1, w2) {
  //Set up stamp edges
  var validUp = false;
  var sweep = true;
  var validRight;

  while (sweep) {
    do {
      //Vertex is still in the triangle
      //Check for valid Up, if it doesn't exist yet
      if(validUp === false) {
        if(this.probeUp(w0, w1, w2) && currentP.position[1] >= minY) {
          //We have a validUp. We need to save its context for a future call to sweepUp()
          var upP = currentP.copy();
          upP.position[1] -= 1;
          var w0_new = w0 - b12;
          var w1_new = w1 - b20;
          var w2_new = w2 - b01
          validUp = true;
        }
      }

      //Draw the pixel
      this.drawVertex(currentP, v0, v1, v2, w0, w1, w2)

      validRight = this.probeRight(w0,w1,w2);
      if(validRight) {
          //One step along the x-axis
          currentP.position[0] += 1;
          w0 += a12;
          w1 += a20;
          w2 += a01;
      }
    } while( validRight && currentP.position[0] <= maxX)

    //The sweep is done. Now, if we have a new ValidUp or ValidDown, we need to sweep again
    if(validUp) {
      //We have found a new Valid Up
      currentP = upP;
      w0 = w0_new
      w1 = w1_new;
      w2 = w2_new;
      validUp = false;
    }

    else  {
      sweep = false;
    }
  }
}

Render.prototype.sweepLower = function(currentP, v0, v1, v2, w0, w1, w2) {
  //Set up stamp edges
  var validDown = false;
  var sweep = true;
  var validRight;
  while (sweep) {
    do {
      //Vertex is still in the triangle
      //Check for valid Down, if it doesn't exist yet
      if(validDown === false) {
        if( this.probeDown(w0, w1, w2) && currentP.position[1] <= maxY ) {
          //We have a validDown. We need to save its context for a future call to sweepUp()
          var downP = currentP.copy();
          downP.position[1] += 1;
          var w0_new = w0 + b12;
          var w1_new = w1 + b20;
          var w2_new = w2 + b01;
          validDown = true;
        }
      }

      //Draw the pixel
      this.drawVertex(currentP, v0, v1, v2, w0, w1, w2)

      validRight = this.probeRight(w0,w1,w2);
      if(validRight) {
          //One step along the x-axis
          currentP.position[0] += 1;
          w0 += a12;
          w1 += a20;
          w2 += a01;
      }
    } while( validRight && currentP.position[0] <= maxX)

    //The sweep is done. Now, if we have a ValidUp or ValidDown, we need to do the appropriate sweeps
    if(validDown === true) {
      //We have found a new Valid Down
      currentP = downP;
      w0 = w0_new
      w1 = w1_new;
      w2 = w2_new;
      validDown = false;
    }
    else {
      sweep = false;
    }
  }
}

Render.prototype.drawVertex = function(currentP, v0, v1, v2, w0, w1, w2) {
  //barycentric coordinates
  var w0_current =  w0 / triArea;
  var w1_current =  w1 / triArea;
  var w2_current =  w2 / triArea;

  //console.log(w0 + " " + w0 + " " + w0);
  // console.log(triArea);
  //z-buffer test. Normal interpolation for z.
  currentP.position[2] =  (v0.position.position[2] +
                            (w1_current * (v1.position.position[2] - v0.position.position[2]) ) +
                            (w2_current * (v2.position.position[2] - v0.position.position[2])));




  if(this.ZBuffer.Ztest(currentP.position[0], currentP.position[1], currentP.position[2])) {

    //We use W for perspective correction.
    //The vertices' w is saved as 1 / w. So, to get the true W, we should take its reciprocal once more after interpolating

    currentP.position[3] =  1/ (v0.position.position[3] +
                              (w1_current * (v1.position.position[3] - v0.position.position[3]) ) +
                              (w2_current * (v2.position.position[3] - v0.position.position[3])));

    //Assemble Vertex
    var p = new Vertex();
    p.position = currentP;


    //draw
    //Get the color that the vertex must output
    var outputColor = this.invokePixelShaders(p, w0_current, w1_current, w2_current, v0, v1, v2);
    this.drawPixel(p.position.position[0], p.position.position[1], outputColor);
  }
}

//
// Render.prototype.drawFace = function(v0, v1, v2, texture) {
//
//   //Bounding box
//   var minX = getMin3(v0.position.position[0], v1.position.position[0], v2.position.position[0]);
//   var maxX = getMax3(v0.position.position[0], v1.position.position[0], v2.position.position[0]);
//
//   var minY = getMin3(v0.position.position[1], v1.position.position[1], v2.position.position[1]);
//   var maxY = getMax3(v0.position.position[1], v1.position.position[1], v2.position.position[1]);
//
//   //2d clipping
//   minX = Math.max(0, minX);
//   minY = Math.max(0, minY);
//   maxX = Math.min(this.screenWidth - 1, maxX);
//   maxY = Math.min(this.screenHeight - 1, maxY);
//
//   //Setting up constants for the edge function. A is the unit step on the x-axis. B is the unit step on the y-axis
//   //v1, v2, p
//   var A12 = v1.position.position[1] - v2.position.position[1];
//   var B12 = v2.position.position[0] - v1.position.position[0];
//
//   //v2, v0, p
//   var A20 = v2.position.position[1] - v0.position.position[1];
//   var B20 = v0.position.position[0] - v2.position.position[0];
//
//   //v0, v1, p
//   var A01 = v0.position.position[1] - v1.position.position[1];
//   var B01 = v1.position.position[0] - v0.position.position[0];
//
//   //Face area
//   var area = EdgeFunction(v0.position,v1.position,v2.position);
//
//
//
//   //Initialize CurrentP as the starting point
//   var currentP = new Vector3(minX, minY, 1);
//   //Set up barycentric coordinates at minX and minY
//
//
//   var w0_in = EdgeFunction(v1.position, v2.position, currentP);
//   var w1_in = EdgeFunction(v2.position, v0.position, currentP);
//   var w2_in = EdgeFunction(v0.position, v1.position, currentP);
//
//   //loop over bounding box
//   for(currentP.position[1] = minY; currentP.position[1] < maxY; currentP.position[1] += 1){
//
//     //Barycentric coordinates at the start of the current row
//     var w0 = w0_in;
//     var w1 = w1_in;
//     var w2 = w2_in;
//
//     for(currentP.position[0] = minX; currentP.position[0] < maxX; currentP.position[0] += 1) {
//       if((w0 | w1 | w2) >= 0) {
//
//           //barycentric coordinates
//           var w0_current =  w0 / area;
//           var w1_current =  w1 / area;
//           var w2_current =  w2 / area;
//
//           //z-buffer test. Normal interpolation for z.
//           currentP.position[2] =  (v0.position.position[2] +
//                                     (w1_current * (v1.position.position[2] - v0.position.position[2]) ) +
//                                     (w2_current * (v2.position.position[2] - v0.position.position[2])));
//
//
//
//
//           if(this.ZBuffer.Ztest(currentP.position[0], currentP.position[1], currentP.position[2])) {
//
//             //We use W for perspective correction.
//             //The vertices' w is saved as 1 / w. So, to get the true W, we should take its reciprocal once more after interpolating
//
//             currentP.position[3] =  1/ (v0.position.position[3] +
//                                       (w1_current * (v1.position.position[3] - v0.position.position[3]) ) +
//                                       (w2_current * (v2.position.position[3] - v0.position.position[3])));
//
//             //Assemble Vertex
//             var p = new Vertex();
//             p.position = currentP;
//
//
//             //draw
//             //Get the color that the vertex must output
//
//             var outputColor = this.invokePixelShaders(p, w0_current, w1_current, w2_current, v0, v1, v2);
//             this.drawPixel(p.position.position[0], p.position.position[1], outputColor);
//           }
//       }
//
//       //One unit step on the x-axis
//       w0 += A12;
//       w1 += A20;
//       w2 += A01;
//
//     }
//     //One unit step on the y-axis
//     w0_in += B12;
//     w1_in += B20;
//     w2_in += B01;
//
//   }
//
//
// }

//Invoke all our pixels shaders on a given vertex
//Each one will return a color.
//Right now, they will override eachothers output.
Render.prototype.invokePixelShaders = function(vertex, w0, w1, w2, v0, v1, v2) {
  for(var i = 0; i < this.pixelShaders.length; i++) {
    vertex = this.pixelShaders[i].getVertex(vertex, w0, w1, w2, v0, v1, v2);
  }

  if(typeof(vertex.color) === "undefined") {
    vertex.color = new Vector3(245,255,255);
    vertex.color.position[3] = 255;
  }
  return vertex.color;
}


//Bresenham algorithm to draw lines
Render.prototype.bresenham = function(x1, y1, x2, y2, color) {
  //First check cases
  var dx = x2 - x1;
  var dy = y2 - y1;

  if(Math.abs(dy) > Math.abs(dx)) {
    //Y is the driving axis, because dy is smaller than dx.

    //bresenhamPlotLineHigh

    //Lastly, we need to check the direction of the driving axis: y
    if(y1 > y2) {
      //We go downwards, so we should take point 2 as the starting point here.
      this.bresenhamPlotLineHigh(x2, y2, x1, y1, color);
    }

    else {
        //We go upwards, so we should take point 1 as the starting point_pd
        this.bresenhamPlotLineHigh(x1, y1, x2, y2, color);
    }


  }

  else {
    //Here X is the driving axis, because dx is smaller than dy.
    if(x1 > x2) {
      //We go from right to left here. So, we should take point 2 as the starting point.
      this.bresenhamPlotLineLow(x2, y2, x1, y1, color);
    }

    else {
      //Here we go from left to right, so we should do as normal
      this.bresenhamPlotLineLow(x1, y1, x2, y2, color);
    }
  }

}


Render.prototype.bresenhamPlotLineHigh = function(x1, y1, x2, y2, color) {
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
      this.drawPixel(x, y, color, true);
    }

    if(P > 0) {
      x = x + xi;
      P = P - 2*dy;
    }

      P = P + 2*dx;

  }
}

Render.prototype.bresenhamPlotLineLow = function(x1, y1, x2, y2, color)  {

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
      this.drawPixel(x, y, color, true)
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
