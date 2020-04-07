function Geometry(positions, faces) {
  this.positions = positions || [];
  this.faces = faces || [];
}

function Face(vertices) {
  this.vertices = vertices;
}

Geometry.parseOBJ = function(object) {

  //regex for positions
  var positionRegx = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;
  var faceRegs = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/;
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
    else if((result = faceRegs.exec(line)) != null) {
      //Creating the face

      var vertexIndices = [];
      for(var i = 1; i < 13; i +=3) {
        //1, 4, 7, 10
        //Add the vertex to the vertices
        vertexIndices.push(parseFloat(result[i]));
      }
      //Create the face with the captured ImageData
      faces.push(new Face(vertexIndices));
    }

  });
  //console.log(new Geometry(positions, faces))
  return new Geometry(positions);
}

function Vector3(x,y,z) {
  this.fields = [x,y,z,1];
}

Vector3.prototype.translate = function (x,y,z) {
  this.fields[0] += x;
  this.fields[1] += y;
  this.fields[2] += z;
  //return new Vector(this.x + x, this.y + y, this.z + z);
}
