function Geometry(positions, faces, edges, uvs) {
  this.positions = positions || [];
  this.faces = faces || [];
  this.edges = edges || [];
}

function Face(vertices) {
  this.vertices = vertices || [];
  this.culled = false;
}

function Vertex(id, normal, uv) {
  this.id = id;
  this.position = new Vector3();
  this.normal = normal || new Vector3();
  this.uv = uv || new Vector2();
}

Geometry.prototype.parseOBJ = function(object) {

  //regex for positions
  var positionRegx = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;

  //original
  //var faceRegx = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/;
  var faceRegx = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)/;
  //var faceRegx = /^f\s+(-?\d+)\/?\s?(-?\d+)\/?\s?(-?\d+)/;
  var normalRegx = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;

  var uvRegx = /^vt\s+(\d+\.\d+)\s+(\d+\.\d+)/;


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
      normals.push(new Vector3(
        parseFloat(result[0]),
        parseFloat(result[1]),
        parseFloat(result[2])
      ));
    }

    else if((result = faceRegx.exec(line)) != null) {
      //Creating the face


      var faceVertices = [];

      var step = Math.ceil(result.length / 4);
      for(var i = 1; i < result.length; i += step ) {
        //We only save the vertex indices here, since we go 3x slower without them
        var id = parseInt(result[i]);
        var uv = uvs[parseInt(result[i + 1])];
        var normal = normals[parseInt(result[i + 2])];
        faceVertices.push(new Vertex(id, normal, uv));

      }
      faces.push(new Face(faceVertices));
    }

  });

    //Now that we have parsed all the lines in the .obj file, we must make a list of edges
    var edges = this.createEdgeList(positions, faces);

    this.positions = positions;
    this.faces = faces;
    this.edges = edges;
}

//Create edges, no duplicates allowed
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

    edgeList = this.insertVertexAdjacency(edgeList, (currentVertices[0] - 1), (currentVertices[1] - 1));

    edgeList = this.insertVertexAdjacency(edgeList, (currentVertices[1] - 1), (currentVertices[2] - 1));

    edgeList = this.insertVertexAdjacency(edgeList, (currentVertices[2] - 1), (currentVertices[0] - 1));


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
}

function Vector2(x,y) {
  this.position = [x || 0, y || 0];
}
