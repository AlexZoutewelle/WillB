function FlatColorEffect() {

}

FlatColorEffect.prototype.newModel = function(model) {
}

//using an (interpolated) vertex, retrieve the color on the position on the texture
FlatColorEffect.prototype.getColor = function(vert_in) {
  if(typeof(vert_in.color) !== 'undefined') {
    return [vert_in.color.position[0] ,
            vert_in.color.position[1] ,
            vert_in.color.position[2] ,
            255];
  }

  return [255,255,255,255]

}
