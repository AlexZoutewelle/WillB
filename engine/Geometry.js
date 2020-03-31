function Geometry(positions) {
  this.positions = positions || [];
}

Geometry.parseOBJ = function(object) {

  //regex for positions
  var position = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/;
  var positions = [];

  var lines = object.split('\n');

  lines.forEach(function(line) {
    var result;
    if((result = position.exec(line)) != null) {
      positions.push(new Vector3(
        parseFloat(result[1]),
        parseFloat(result[2]),
        parseFloat(result[3])
      ));
    }
  });
  return new Geometry(positions);
}

function Vector3(x,y,z) {
  this.x = x;
  this.y = y;
  this.z = z;
}
