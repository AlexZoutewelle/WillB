//// TODO:
//goal1:draw wireframe of cat
//goal2:move around cat
//detach obj loading from main
//parse the .obj
main();
function main() {

  var model = mdlLoad.loadObject("models/cat.obj");
  model.then(function(result) {
    
    var modelGeometry = Geometry.parseOBJ(result);
    console.log(modelGeometry);
  })
  //var modelData = Geometry.parseOBJ(model)
}
