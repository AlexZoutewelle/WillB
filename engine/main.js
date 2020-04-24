//// TODO:
//low prio: Mouse view is not perfect.


//PROBLEM: VERTEX PROCESSING
//Continuously creating copies/new vertices in our math operations results in loss of data.
//We must start off the pipeline by CREATING (or copying) a vertex, then we can do what we want with it

var screenWidth = 640;
var screenHeight = 480;

//Get the context

var imgArray = new Uint8ClampedArray(4 * screenWidth * screenHeight);

var renderer = new Render(screenWidth, screenHeight);

//Initialize pixel and vertex shaders

//renderer.setPixelShader(new TextureEffect());
// renderer.setPixelShader(new DynColorEffect());
renderer.setPixelShader(new FlatColorEffect());
renderer.setVertexShader(new FlatShadeVS());

//trying out some camera stuff

var camera = new Transformation([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, -90],
        [0, 0, 0, 1]
]);



//Load models
var model_name1 = "cube";
var model_name2 = "sphere";

var models = [
  mdlLoad.loadObject("models/" + model_name2 + ".obj", "cube2"),
  mdlLoad.loadObject("models/" + model_name1 + ".obj", "cube"),
];

Promise.all(models).then(function(results) {
  models = results;
  console.log(models[0]);
  console.log(models[1]);


  //Models are loaded. Place them somewhere in the world
  var object_transform1 = new Transformation();

  object_transform1.fields = object_transform1.translate(-10, 0, 0);

  var object_transform2 = new Transformation();
  object_transform2.fields = object_transform2.translate(10, 0, 0);

  for(var i = 0; i < models[0].vertices.length; i++) {
    models[0].vertices[i].position = object_transform1.multMatrixVec3(models[0].vertices[i].position);
  }

  for(var i = 0; i < models[1].vertices.length; i++) {
    models[1].vertices[i].position = object_transform2.multMatrixVec3(models[1].vertices[i].position);
  }

  object_transform = new Transformation();

  //Models are placed, ready the render


  frame();
});



var count = 0;
var movement = 1.55



function frame() {

  update();
  if(playerState.input.escape === true) {
    console.log("ending");
    return;
  }
  if(playerState.input.backward === true) {
    //console.log("move backward");
    camera.fields =  camera.translate(0,0, -movement);
  }

  if(playerState.input.forward === true ) {
    //console.log("move forward");
    camera.fields =  camera.translate(0, 0,movement);
  }
  if(playerState.input.strafeLeft === true) {
    //console.log("move left");
    camera.fields = camera.translate(movement,0,0);
  }
  if(playerState.input.strafeRight === true) {
    //console.log("move right");
    camera.fields = camera.translate(-movement,0,0);
  }

  if(playerState.input.turnLeft === true) {
    //console.log("turn left");
    camera.fields = camera.rotate(0,-movement,0);
  }

  if(playerState.input.turnRight === true) {
    //console.log("turn right");
    camera.fields = camera.rotate(0,movement,0);

  }

  if(playerState.input.jump === true) {
    //console.log("jump");
    camera.fields = camera.translate(0,-movement, 0)
  }
  if(playerState.input.crouch === true) {
    //console.log("crouch");
    camera.fields = camera.translate(0, movement, 0);
  }

  if(playerState.input.tiltForward === true) {
    //console.log("tilt forward");
    camera.fields = camera.rotate(-movement, 0);
  }

  if(playerState.input.tiltBack === true) {
    //console.log("tilt back");
    camera.fields = camera.rotate(movement, 0);
  }

  if(playerState.input.angleX !== 0 || playerState.input.angleY !== 0) {
    camera.fields = camera.rotate(
        playerState.input.angleY,
        playerState.input.angleX);
    playerState.input.angleX = 0;
    playerState.input.angleY = 0;
  }

//Cycle through pixel shaders
  if(globalState.nextPixelShader === true) {

    var amountOfShaders  = renderer.pixelShaders.length;
    var nextShader = renderer.activePixelShader + 1;

    if(nextShader === amountOfShaders) {
      nextShader = 0;
    }

    renderer.activePixelShader = nextShader;

  }

  camera_inverse = camera.inverse();

  renderer.render(models, camera_inverse, camera);


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
