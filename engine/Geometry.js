function Geometry(positions, faces, edges) {
  this.positions = positions || [];
  this.faces = faces || [];
  this.edges = edges || [];
}

function Face(vertices) {
  this.vertices = vertices;
  this.culled = false;
}

Geometry.prototype.parseOBJ = function(object) {

  //regex for positions
  var positionRegx = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;
  //var faceRegs = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/;
  var faceRegx = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)/;
  //var faceRegx = /^f\s+(-?\d+)\/?\s?(-?\d+)\/?\s?(-?\d+)/;
  var positions = [];
  var faces = []

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
    else if((result = faceRegx.exec(line)) != null) {
      //Creating the face
      var vertexIndices = [];
      var step = Math.ceil(result.length / 4);
      for(var i = 1; i < result.length; i += step ) {
        vertexIndices.push(parseFloat(result[i]));
      }

      // for(var i = 1; i < 10; i +=3) {
      //   //1, 4, 7, 10
      //   //Add the vertex to the vertices
      //   vertexIndices.push(parseFloat(result[i]));
      // }
      //Create the face with the captured ImageData
      faces.push(new Face(vertexIndices));
    }
  });

  //Now that we have parsed all the lines in the .obj file, we must make a list of edges
  var edges = this.createEdgeList(positions, faces);




  this.positions = positions;
  this.faces = faces;
  this.edges = edges;
  //return new Geometry(positions, faces, edges);
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
    var currentVertices = faces[i].vertices;

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
  this.fields = [x,y,z,1];
}

Vector3.prototype.translate = function (x,y,z) {
  this.fields[0] += x;
  this.fields[1] += y;
  this.fields[2] += z;
  //return new Vector(this.x + x, this.fields[1] + y, this.fields[2] + z);
}

Vector3.prototype.dot = function(vector) {
  var sum = 0;
  sum += this.fields[0] * vector.fields[0];
  sum += this.fields[1] * vector.fields[1];
  sum += this.fields[2] * vector.fields[2];

  return sum;
}

Vector3.prototype.cross = function(vector) {
  var result = new Vector3();
  result.fields[0] = (this.fields[1] * vector.fields[2]) - (vector.fields[1] * this.fields[2]);
  result.fields[1] = (this.fields[2] * vector.fields[0]) - (vector.fields[2] * this.fields[0]) ;
  result.fields[2] = (this.fields[0] * vector.fields[1]) - (vector.fields[0] * this.fields[1]);

  return result;
}

Vector3.prototype.normalize = function() {
  var length = Math.sqrt( (this.fields[0] **2) + (this.fields[1] ** 2) + (this.fields[2] **2) );
  this.fields[0] /= length;
  this.fields[1] /= length;
  this.fields[2] /= length;
}
