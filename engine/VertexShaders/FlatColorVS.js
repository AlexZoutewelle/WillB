function FlatColorVS(renderer) {
  renderer.setVertexShader(this);

  this.color = new Vector3(255, 0, 255);
  this.color.position[3] = 255;

  this.colorsArray = [
    new Vector3(255, 0, 0),
    new Vector3(0, 255, 0),
    new Vector3(0, 0, 255),
  ]

}

FlatColorVS.prototype.newModel = function(newModel) {
  if(newModel.id === 'c1') {
    this.color = new Vector3(24, 24, 175);
  }
  else if(newModel.id === 'floor') {
    this.color = new Vector3(45, 190, 38);

  }
  else {
    this.color = new Vector3(210, 210, 210);
  }

}


FlatColorVS.prototype.getVertex = function(vertex_in, camera_inverse) {
  // if(typeof(vertex_in.uv) !== "undefined" ) {
  //   delete vertex_in.uv;
  // }
  //
  // if(typeof(vertex_in.normal) !== "undefined") {
  //   delete vertex_in.normal;
  // }

  vertex_in.color = this.color;
  vertex_in.color = vertex_in.color.multiplyScalar(1/vertex_in.position.position[3]);


  return vertex_in;
}
