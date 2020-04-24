function Geometry(faces, edges, uvs) {
  this.faces = faces || [];
  this.edges = edges || [];
}

//Face holds indices to the vertices array.
//A is made up of 3 vertices (it is a triangle)
function Face(vertices) {
  this.vertices = vertices || [];
}



Geometry.prototype.parseOBJ = function(object, object_name) {
  //regex for positions
  var positionRegx = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;

  //original
  //var faceRegx = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/;
  var faceRegx = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)/;
  //var faceRegx = /^f\s+(-?\d+)\/?\s?(-?\d+)\/?\s?(-?\d+)/;
  var normalRegx = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;

  var uvRegx = /^vt\s+(\d+\.*\d*)\s+(\d+\.*\d*)/;

  var vertices = [];
  var positions = [];
  var faces = []
  var uvs = [];
  var normals = [];

  var lines = object.split('\n');

  lines.forEach(function(line) {
    var result;
    if((result = positionRegx.exec(line)) != null) {
      positions.push(new Vector3(
        parseFloat(result[1]),
        parseFloat(result[2]),
        parseFloat(result[3])
      ));
    }

    else if((result = uvRegx.exec(line)) != null) {
      uvs.push(new Vector2(
        parseFloat(result[1]),
        parseFloat(result[2])
      ));
    }

    else if((result = normalRegx.exec(line)) != null) {
      var got = new Vector3(
        parseFloat(result[1]),
        parseFloat(result[2]),
        parseFloat(result[3]));

      normals.push(
        got
      );
    }

    else if((result = faceRegx.exec(line)) != null) {
      //Creating the face

      var indices = [];

      var step = Math.ceil(result.length / 4);
      for(var i = 1, id = 0; i < result.length; i += step, id += 1 ) {

        //Create the vertex
        var position = positions[parseInt(result[i] - 1)];
        var uv = uvs[parseInt(result[i + 1] - 1)];
        var normal = normals[parseInt(result[i + 2] - 1)];

        vertices.push(new Vertex(position, normal, uv));

        //Create the indices
        indices.push(vertices.length - 1);
        if(3 % id == 1) {
          //We have the 3 indices for a face. We need to save this to a Face
          faces.push(new Face(indices));
          //Reset the indices array
          indices = [];
        }
      }
    }

  });

    //Now that we have parsed all the lines in the .obj file, we must make a list of edges
    //var edges = this.createEdgeList(positions, faces);

    //Finally, get its texture image, and create a context for it
    var image = document.getElementById(object_name);
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

    this.texture = canvas.getContext('2d').getImageData(0, 0, image.width, image.height);
    this.vertices = vertices;
    this.faces = faces;
    //this.edges = this.createEdgeList(vertices, faces);
}

//Create edges, no duplicates allowed
//REWORK NEEDED: DIFFERENT DATA STRUCTURE FOR MODEL
Geometry.prototype.createEdgeList = function(vertices, faces){
  var edgeList = {}

  //prepare list of adjacent vertices foreach vertex in the models
  //The id of each vertex is the same as their index. (in the faces, they will be listed as index + 1, because that's the .obj specification)

  var vertexLength = vertices.length;

  for(var i = 0; i < vertexLength; i++) {
    //We start off empty, of course. i here is the id of a vertex.
    edgeList[i] = []
  }


  //for each face, get its vertices, and record their adjacencies
  var facesLength = faces.length;
  for(var i = 0; i < facesLength; i++) {
    //A face contains id's of vertices
    var currentVertices = [faces[i].vertices[0].id, faces[i].vertices[1].id, faces[i].vertices[2].id];
    //foreach vertex, check its entry in the adjacentVertsList.
    //If these adjacent vertices are not present in the list, add them.

    edgeList = this.insertVertexAdjacency(edgeList, (currentVertices[0] ), (currentVertices[1] ));

    edgeList = this.insertVertexAdjacency(edgeList, (currentVertices[1] ), (currentVertices[2] ));

    edgeList = this.insertVertexAdjacency(edgeList, (currentVertices[2] ), (currentVertices[0] ));


  }

  return edgeList;
}

Geometry.prototype.insertVertexAdjacency = function(edgeList, first, second) {

    //To avoid duplicat edges, we introduce a bit of logic to our insertion.
    //We check which one of the vertices has the lower index value. It is that vertex' edgelist that will be altered.
    var lower = 0;
    var higher = 0;
    if(first < second) {
      lower = first;
      higher = second;
    }
    else {
      lower = second;
      higher = first;
    }

    //If the current vertex has adjacent vertices, we must check if the current adjacent vertex is already in there or not
    var adjacentVertices = edgeList[lower];
    var adjacentVerticesLength = adjacentVertices.length;

    for(var i = 0; i < adjacentVerticesLength; i++) {
      if(adjacentVertices[i] === higher){
        //Found a duplicate. We are done here
        return edgeList;
      }
    }

    //If we are here, this is a new one. So, we add it.
    edgeList[lower].push(higher);


  return edgeList
}

function Vector3(x,y,z) {
  this.position = [x || 0, y || 0, z || 0, 1];
}

Vector3.prototype.translate = function (x,y,z) {
  this.position[0] += x;
  this.position[1] += y;
  this.position[2] += z;
  return this;
  //return new Vector(this.x + x, this.position[1] + y, this.position[2] + z);
}

Vector3.prototype.dot = function(vector) {
  var sum = 0;
  sum += this.position[0] * vector.position[0];
  sum += this.position[1] * vector.position[1];
  sum += this.position[2] * vector.position[2];

  return sum;
}

Vector3.prototype.cross = function(vector) {
  var result = new Vector3();
  result.position[0] = (this.position[1] * vector.position[2]) - (vector.position[1] * this.position[2]);
  result.position[1] = (this.position[2] * vector.position[0]) - (vector.position[2] * this.position[0]) ;
  result.position[2] = (this.position[0] * vector.position[1]) - (vector.position[0] * this.position[1]);

  return result;
}

Vector3.prototype.normalize = function() {
  var length = Math.sqrt( (this.position[0] **2) + (this.position[1] ** 2) + (this.position[2] **2) );
  this.position[0] /= length;
  this.position[1] /= length;
  this.position[2] /= length;
  return this;
}

Vector3.prototype.multiplyVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] * vector.position[0];
  result.position[1] = this.position[1] * vector.position[1];
  result.position[2] = this.position[2] * vector.position[2];
  return result;
}

Vector3.prototype.divideVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] / vector.position[0];
  result.position[1] = this.position[1] / vector.position[1];
  result.position[2] = this.position[2] / vector.position[2];
}
Vector3.prototype.subtractVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] - vector.position[0];
  result.position[1] = this.position[1] - vector.position[1];
  result.position[2] = this.position[2] - vector.position[2];
  return result;
}

Vector3.prototype.addVector = function(vector) {
  var result = new Vector3();
  result.position[0] = this.position[0] + vector.position[0];
  result.position[1] = this.position[1] + vector.position[1];
  result.position[2] = this.position[2] + vector.position[2];
  return result;
}

Vector3.prototype.multiplyScalar = function(scalar) {
  var result = new Vector3();
  result.position[0] = this.position[0] * scalar;
  result.position[1] = this.position[1] * scalar;
  result.position[2] = this.position[2] * scalar;
  return result;
}

Vector3.prototype.divideScalar = function(scalar) {
  var result = new Vector3();
  result.position[0] = this.position[0] / scalar;
  result.position[1] = this.position[1] / scalar;
  result.position[2] = this.position[2] / scalar;
  return result;

}



Vector3.prototype.interpolateTo = function(vector, alpha) {
  var result = this.addVector(vector.subtractVector(this).multiplyScalar(alpha));
  return result;
}

function Vector2(x,y) {
  this.position = [x || 0, y || 0];
}

Vector2.prototype.addScalar = function(scalar, position) {
  var result = new Vector2();
  if(position) {
    result.position[position] += scalar;
  }
  else {
    result.position[0] += scalar;
    result.position[1] += scalar;
  }

  return result;
}

Vector2.prototype.addVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] + vector.position[0];
  result.position[1] = this.position[1] + vector.position[1];
  return result;
}

Vector2.prototype.divideScalar = function(scalar) {
  var result = new Vector2();
  result.position[0] = this.position[0] / scalar;
  result.position[1] = this.position[1] / scalar;
  return result;
}

Vector2.prototype.subtractScalar = function(scalar, axis) {
  var result = new Vector2();
  if(axis) {
    result.position[axis] = this.position[axis] - scalar;
  }
  else {
    result.position[0] = this.position[0] - scalar;
    result.position[1] = this.position[1] - scalar;
  }
  return result;
}

Vector2.prototype.multiplyScalar = function(scalar) {
  var result = new Vector2();
  result.position[0] = this.position[0] * scalar;
  result.position[1] = this.position[1] * scalar;
  return result;
}

Vector2.prototype.subtractVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] - vector.position[0];
  result.position[1] = this.position[1] - vector.position[1];
  return result;
}

Vector2.prototype.divideVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] / vector.position[0];
  result.position[1] = this.position[1] / vector.position[1];
  return result;
}

Vector2.prototype.multiplyVector = function(vector) {
  var result = new Vector2();
  result.position[0] = this.position[0] * vector.position[0];
  result.position[1] = this.position[1] * vector.position[1];
  return result;
}

Vector2.prototype.interpolateTo = function(vector, alpha) {
  return this.addVector(vector.subtractVector(this).multiplyScalar(alpha));
}
