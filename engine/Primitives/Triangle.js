function Triangle() {
  this.setVertices();
}

Triangle.prototype.setVertices = function() {
  var pos0 = new Vector3(0,1,0);
  var pos1 = new Vector3(1,0,0);
  var pos2 = new Vector3(0,0,0);

  this.positions = [pos0, pos1, pos2];

  var uv0 = new Vector3(0,1,0);
  var uv1 = new Vector3(1,0,0);
  var uv2 = new Vector3(0,0,0);

  this.uvs = [uv0, uv1, uv2];

  var norm1 = pos0.cross(pos1);
  norm1 = norm1.normalize();

  this.normals = [norm1];

  this.vertexIds = [{pos: 0, norm: 0, uvs: 0}, {pos:1, norm: 0, uv: 1}, {pos:2, norm: 0, uv:1}];

  var face1 = new Face();
  face1.vertices = [0,1,2];

  this.faces = face1;

}
