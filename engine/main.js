//// TODO:
//goal1:draw wireframe of cat
//goal2:move around cat
//  Set up the game loop
//  'frame' function:  does what needs to be done for each frame
//  Input event handlers must be recognized for WASD
//  Implement the transformations on the camera, triggered by WASD
//    Must be handled in the update() function




//dont tranform the camera. irt doesnt exist

var test = new Transformation([
  [2, 3, 4, 0],
  [3, 4, 2, 0],
  [2, 3, 4, 0],
  [1, 1, 1, 1]
]);

var test2 = new Transformation([
  [2, 3, 4, 5],
  [4, 6, 2, 1],
  [3, 6, 7, 5],
  [3, 4, 5, 6]
]);

console.log(test.inverse());
console.log(test2.multiply(test));

var vertex = new Vector3(1,1,1);
var translation = new Transformation([
  [1, 0, 0, 5],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1]
])

console.log(translation.multMatrixVec3(vertex).fields);

var screenWidth = 500;
var screenHeight = 500;

//Get the context

//Drawing a red line on the screen
var imgArray = new Uint8ClampedArray(4 * screenWidth * screenHeight);

var renderer = new Render(screenWidth, screenHeight);

//trying out some camera stuff


var camera = new Transformation([
        [0.5, 0, 0, -50],
        [0, 0.5, 0, 0],
        [0, 0, 0.5, -50],
        [0, 0, 0, 1]
]);


//Load the cat model
var model = mdlLoad.loadObject("models/cat.obj");
var modelGeometry = [];
//test point imgArray


model.then(function(result) {
  //All models are loaded. We can start parsing the models

  modelGeometry = Geometry.parseOBJ(result);

  object_transform = new Transformation();

  //Models are parsed. We can start the main game loop
  //console.log(camera);
  frame();
});






function frame() {

  update();
  if(playerState.input.escape === true) {
    console.log("ending");
    return;
  }
  if(playerState.input.backward === true) {
    object_transform.fields =  object_transform.translate(0,0, -2);

  }

  if(playerState.input.forward === true ) {
    object_transform.fields =  object_transform.translate(0, 0,2);
  }
  if(playerState.input.strafeLeft === true) {
    object_transform.fields = object_transform.translate(2,0,0);
  }
  if(playerState.input.strafeRight === true) {
    object_transform.fields = object_transform.translate(-2,0,0,);
  }

  if(playerState.input.turnLeft === true) {
    object_transform.fields = object_transform.rotate(0.80,0);
  }

  if(playerState.input.turnRight === true) {
    object_transform.fields = object_transform.rotate(-0.80,0);

  }

  if(playerState.input.jump === true) {
    object_transform.fields = object_transform.translate(0,2, 0)
  }
  if(playerState.input.crouch === true) {
    object_transform.fields = object_transform.translate(0, -2, 0);
  }

  if(playerState.input.tiltForward === true) {
    object_transform.fields = object_transform.rotate(0, 1.1);
  }

  if(playerState.input.tiltBack === true) {
    object_transform.fields = object_transform.rotate(0, -1.1);
  }


  camera_inverse = camera.inverse();



  //console.log(modelGeometry);
  renderer.render(modelGeometry, camera_inverse, object_transform);
  //console.log(camera);

  // console.log("CAMERA -----------");
  // console.log(camera.fields[0][0] + " "  + camera.fields[0][1] + " " + camera.fields[0][2] + " "  + camera.fields[0][3]);
  // console.log(camera.fields[1][0] + " "  + camera.fields[1][1] + " " + camera.fields[1][2] + " "  + camera.fields[1][3]);
  // console.log(camera.fields[2][0] + " "  + camera.fields[2][1] + " " + camera.fields[2][2] + " "  + camera.fields[2][3]);
  // console.log(camera.fields[3][0] + " "  + camera.fields[3][1] + " " + camera.fields[3][2] + " "  + camera.fields[3][3]);
  // console.log("------------------");


  console.log("OBJECT TRANSFORM-------");
  console.log(object_transform.fields[0][0] + " "  + object_transform.fields[0][1] + " " + object_transform.fields[0][2] + " "  + object_transform.fields[0][3]);
  console.log(object_transform.fields[1][0] + " "  + object_transform.fields[1][1] + " " + object_transform.fields[1][2] + " "  + object_transform.fields[1][3]);
  console.log(object_transform.fields[2][0] + " "  + object_transform.fields[2][1] + " " + object_transform.fields[2][2] + " "  + object_transform.fields[2][3]);
  console.log(object_transform.fields[3][0] + " "  + object_transform.fields[3][1] + " " + object_transform.fields[3][2] + " "  + object_transform.fields[3][3]);
  console.log("------------------");


  requestAnimationFrame(frame);
}

function update() {
}

function render() {

}
