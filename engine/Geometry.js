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

  //Regex for models whose faces only consist of positions.
  var simpleFaceRegx = /^f\s+(-?\d+)\/?\s?(-?\d+)\/?\s?(-?\d+)/;
  var normalRegx = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;

  var uvRegx = /^vt\s+(\d+\.*\d*)\s+(\d+\.*\d*)/;

  var vertexIds = [];
  var positions = [];
  var faces = []
  var uvs = [];
  var normals = [];
  var normalArray = {};

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
        var posId = parseInt(result[i] - 1);
        var uvId = parseInt(result[i + 1] - 1);
        var normalId = parseInt(result[i + 2] - 1);


        vertexIds.push({pos : posId, uv: uvId, norm: normalId});

        //Create the indices
        indices.push(vertexIds.length - 1);
        if(3 % id == 1) {
          //We have the 3 indices for a face. We need to save this to a Face
          faces.push(new Face(indices));
          //Reset the indices array
          indices = [];
        }
      }
    }





    else if((result = simpleFaceRegx.exec(line)) != null) {
      var indices = [];
      var currentPosIds = [];
      //console.log(result);
      for(var i = 1, id= 0; i < result.length; i++, id++) {
        var posId = parseInt(result[i] - 1);

        vertexIds.push({pos: posId, norm: posId});
        indices.push(vertexIds.length - 1);


        //Prepare the normal array
        if(typeof(normalArray[posId]) === "undefined") {
          normalArray[posId] = [];
        }
        //We want to explicitly save the posIds for the moment
        currentPosIds.push(posId);
        //console.log(normalArray[posId])



        if(indices.length === 3) {
          faces.push(new Face(indices));

          //Compute normal

          //Ideally, each position vector should have 1 normal vector associated with it.
          //Since a position vector can be part of up to three triangles, we should interpolate between them to get the 'true'  normal
          //For now, we create separate normals for each triangle.

          //This means that Gouraud shading is impossible at the moment

          var latestVertexId = vertexIds.length - 1;

          var p0 = positions[vertexIds[latestVertexId].pos];
          var p1 = positions[vertexIds[latestVertexId - 1].pos]
          var p2 = positions[vertexIds[latestVertexId - 2].pos]

          var edge1 = p0.subtractVector(p2)
          var edge2 = p1.subtractVector(p2);

          var normal = edge2.cross(edge1).normalize();
          //push the normal to the normals array
          //normals.push(normal);

          //push the id of this normal to the vertexIds
          // vertexIds[latestVertexId]['norm'] = normals.length - 1;
          // vertexIds[latestVertexId - 1]['norm'] = normals.length - 1;
          // vertexIds[latestVertexId - 2]['norm'] = normals.length - 1;

          //Push the computed normal to the involved posIds in the normalArray
          //console.log((indices[0] + 1) + " " + (indices[1] + 1) + " " + (indices[2] + 1));
          //console.log(normalArray);
          normalArray[currentPosIds[0] ].push(normal);
          normalArray[currentPosIds[1] ].push(normal);
          normalArray[currentPosIds[2] ].push(normal);



          indices = [];
          currentPosIds = [];
        }
      }
    }
  });

    //If the model did not have normals, we now have a normalArray sorted by the positionIds
    //We now have to loop through this array, and calculate a singular, interpolated normal
    var posIds = Object.keys(normalArray);
    if(posIds.length > 0) {
      posIds.forEach(function(key) {
        var normalPerPosId = normalArray[key];

        //Interpolate the normals.
        var normalLength = normalPerPosId.length;
        var mainNormal = normalPerPosId[0];

        for(var i = 1; i < normalLength; i++) {
          currentNormal = normalPerPosId[i];

          var dx = (mainNormal.position[0] - currentNormal.position[0]) / 2;
          var dy = (mainNormal.position[1] - currentNormal.position[1]) / 2;
          var dz = (mainNormal.position[2] - currentNormal.position[2]) / 2;

          mainNormal.position[0] -= dx;
          mainNormal.position[1] -= dy;
          mainNormal.position[2] -= dz;

        }

        //Push the interpolated normal to the normals array. This is what the model will use
        normals.push(mainNormal.normalize());
      });
    }


    if(object_name !== undefined) {
      //Finally, get its texture image, and create a context for it
      var image = document.getElementById(object_name);
      var canvas = document.createElement('canvas');

      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

      this.texture = canvas.getContext('2d').getImageData(0, 0, image.width, image.height);
    }

    this.vertexIds = vertexIds;
    this.faces = faces;
    this.positions = positions;
    this.uvs = uvs;
    this.normals = normals;
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

//Creating a plane
Geometry.prototype.createPlane = function(width, height, tesselation, texture) {
  var positions = [];
  var faces = [];
  var vertexIds = [];
  var normals = [];
  var uvs = [];

  var rows = tesselation;
  var cols = tesselation;
  var widthStep = width / tesselation;
  var heightStep = height / tesselation;

  var t1 = tesselation + 1;

  for(var i = 0; i <= rows; i++) {
    for (var j = 0; j <= cols; j++) {
      var y = heightStep * i;

      var x = widthStep * j;

      //Create and push the position vectors. These are the positions for the current row.
      //So, this has nothing to do with the triangles just yet

      positions.push( new Vector3(x,             y,              tesselation) );
      //Create and push the uv vectors
      vertexIds.push({pos: positions.length - 1, norm: 0});

      if(i !== rows && j !== cols) {
        //Create vertexIds. These are the vertexIds belonging to the current triangle.
        //Some of these id's reference positions that do not exist yet, they will be created on the next row.
        //i must not equal row, because if it is, there are no new triangles to create, only attributes.
        var t0 = faces.length / 2 + y;
        var t12 = t1 + 1;

        //create the first face
        faces.push( new Face([ t0, t1 , t12 ]) );


        //Each time we reach a triangle whose index is uneven, the second vertex increases
        if(faces.length % 2 != 0) {
          t1 += 1;
        }

        var t22 = t1 - (tesselation + 1);
        //Create the faces (triangles). These reference the three vertices in the vertexIds array.
        faces.push( new Face([  t0, t1, t22     ]) );

      }
    }
  }

  //This is a flat plane, so we need only 1 normal.
  //Get the first face
  var face = faces[0];
  var vertices = face.vertices;
  console.log(faces);
  //Get the three positions
  var p0 = positions[face.vertices[0]];
  var p1 = positions[face.vertices[1]]
  var p2 = positions[face.vertices[2]]

  var line1 = p2.subtractVector(p1);
  var line2 = p0.subtractVector(p1);
  var normal = line2.cross(line1).normalize();
  normals.push(normal);


  this.vertexIds = vertexIds;
  this.faces = faces;
  this.positions = positions;
  this.uvs = uvs;
  this.normals = normals;
  this.texture = texture;
  this.id = "c1";
}
