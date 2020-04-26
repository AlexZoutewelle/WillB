function DefaultVS() {
}

DefaultVS.prototype.newModel = function(newModel) {

}


DefaultVS.prototype.getVertex = function(vertex_in) {
  // if(typeof(vertex_in.uv) !== "undefined" ) {
  //   delete vertex_in.uv;
  // }
  //
  // if(typeof(vertex_in.normal) !== "undefined") {
  //   delete vertex_in.normal;
  // }

  return vertex_in;
}
