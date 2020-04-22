function DynColorEffect() {

}

DynColorEffect.prototype.newModel = function(model) {
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
DynColorEffect.prototype.getColor = function(vert_in) {

  var zInv = 1 / vert_in.position.position[2]

  return [vert_in.position.position[0] ,
          vert_in.position.position[1] ,
          vert_in.position.position[2] * zInv,
          255];
}
