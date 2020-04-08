//// TODO:
//low prio: Mouse view is not perfect.
//high prio: wireframe rendering
//    -Wireframe drawing is implemented, with a few caveats:
//        It cuts off polygons too soon.
//        it is very slow right Now
//          Polygon culling needed?
//          Algorithm unoptimized?
//          Canvas drawing functions slow?
//high-prio: triangle coloring
//high-prio: texture mapping

var screenWidth = 400;
var screenHeight = 400;

//Get the context

var imgArray = new Uint8ClampedArray(4 * screenWidth * screenHeight);

var renderer = new Render(screenWidth, screenHeight);

//trying out some camera stuff

var camera = new Transformation([
        [1, 0, 0, -1],
        [0, 1, 0, 0],
        [0, 0, 1, -40],
        [0, 0, 0, 1]
]);


//Load the cat model
var model = mdlLoad.loadObject("models/axis.obj");
//var modelGeometry = [];
//test point imgArray


model.then(function(result) {
  //All models are loaded. We can start parsing the models
  modelGeometry = new Geometry();
  modelGeometry.parseOBJ(result);

  object_transform = new Transformation();
  console.log(modelGeometry.edges);

  //Models are parsed. We can start the main game loop
  frame();
});






function frame() {

  update();
  if(playerState.input.escape === true) {
    console.log("ending");
    return;
  }
  if(playerState.input.backward === true) {
    //console.log("move backward");
    camera.fields =  camera.translate(0,0, -2);

  }

  if(playerState.input.forward === true ) {
    //console.log("move forward");
    camera.fields =  camera.translate(0, 0,2);
  }
  if(playerState.input.strafeLeft === true) {
    //console.log("move left");
    camera.fields = camera.translate(2,0,0);
  }
  if(playerState.input.strafeRight === true) {
    //console.log("move right");
    camera.fields = camera.translate(-2,0,0,);
  }

  if(playerState.input.turnLeft === true) {
    //console.log("turn left");
    camera.fields = camera.rotate(0,-0.8);
  }

  if(playerState.input.turnRight === true) {
    //console.log("turn right");
    camera.fields = camera.rotate(0,0.8);

  }

  if(playerState.input.jump === true) {
    //console.log("jump");
    camera.fields = camera.translate(0,-2, 0)
  }
  if(playerState.input.crouch === true) {
    //console.log("crouch");
    camera.fields = camera.translate(0, 2, 0);
  }

  if(playerState.input.tiltForward === true) {
    //console.log("tilt forward");
    camera.fields = camera.rotate(-1.1, 0);
  }

  if(playerState.input.tiltBack === true) {
    //console.log("tilt back");
    camera.fields = camera.rotate(1.1, 0);
  }

  if(playerState.input.angleX !== 0 || playerState.input.angleY !== 0) {
    camera.fields = camera.rotate(
        playerState.input.angleY,
        playerState.input.angleX);
    playerState.input.angleX = 0;
    playerState.input.angleY = 0;
  }

  camera_inverse = camera.inverse();


  renderer.render(modelGeometry, camera_inverse, object_transform, camera);

  // console.log("CAMERA -----------");
  // console.log(camera.fields[0][0] + " "  + camera.fields[0][1] + " " + camera.fields[0][2] + " "  + camera.fields[0][3]);
  // console.log(camera.fields[1][0] + " "  + camera.fields[1][1] + " " + camera.fields[1][2] + " "  + camera.fields[1][3]);
  // console.log(camera.fields[2][0] + " "  + camera.fields[2][1] + " " + camera.fields[2][2] + " "  + camera.fields[2][3]);
  // console.log(camera.fields[3][0] + " "  + camera.fields[3][1] + " " + camera.fields[3][2] + " "  + camera.fields[3][3]);
  // console.log("------------------");


  // console.log("OBJECT TRANSFORM-------");
  // console.log(object_transform.fields[0][0] + " "  + object_transform.fields[0][1] + " " + object_transform.fields[0][2] + " "  + object_transform.fields[0][3]);
  // console.log(object_transform.fields[1][0] + " "  + object_transform.fields[1][1] + " " + object_transform.fields[1][2] + " "  + object_transform.fields[1][3]);
  // console.log(object_transform.fields[2][0] + " "  + object_transform.fields[2][1] + " " + object_transform.fields[2][2] + " "  + object_transform.fields[2][3]);
  // console.log(object_transform.fields[3][0] + " "  + object_transform.fields[3][1] + " " + object_transform.fields[3][2] + " "  + object_transform.fields[3][3]);
  // console.log("------------------");


  requestAnimationFrame(frame);
}

function update() {
}

function render() {

}
