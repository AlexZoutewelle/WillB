//// TODO:
//low prio: Mouse view is not perfect.

var screenWidth = 640;
var screenHeight = 480;

//Get the context

var imgArray = new Uint8ClampedArray(4 * screenWidth * screenHeight);

var renderer = new Render(screenWidth, screenHeight);
var camera = new Transformation([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, -40],
        [0, 0, 0, 1]
]);

renderer.camera = camera;




          //Renderer setup start
//Initialize pixel and vertex shaders

//var texturePS = new TextureEffect(renderer);
var flatColorPS = new FlatColorEffect(renderer);
//var dynColorPS = new DynColorEffect(renderer);

var lightBlendPS = new LightBlendPS(renderer);
//var wireFramePS = new WireFramePS(renderer);
//var vertexPositionPS = new VertexPositionPS(renderer);

//var defaultVertexShader = new DefaultVS(renderer);
//var textureVertexShader = new TextureVS(renderer);
var flatColorVS = new FlatColorVS(renderer);
//var flatShadeVertexShader = new FlatShadeVS(renderer);
var pointShader = new PointShadeVS(renderer);


//var ppLightingPS = new PPLightingPS(renderer);
//var ppLightingVS = new PPLightingVS(renderer);



//Set a thing you want to control using IJKLOU
var movementTarget = pointShader;




        //Renderer setup end

//trying out some camera stuff




//Load models
var model_name1 = "cube";
var model_name2 = "cow";

var models = [
  mdlLoad.loadObject("models/" + model_name1 + ".obj", "cube"),
  mdlLoad.loadObject("models/" + model_name2 + ".obj", "cube2"),
];


Promise.all(models).then(function(results) {
  models = results;

  console.log(models[0]);

  //Models are loaded. Place them somewhere in the world
  var object_transform1 = new Transformation();
  object_transform1.fields = object_transform1.translate(-12, 0, 0);
  object_transform1.fields = object_transform1.scale(0.5,0.5,0.5);

  var object2_srt = new Transformation();

  object2_srt.fields = object2_srt.rotate(0, 270, 0)
  object2_srt.fields = object2_srt.translate(12, 0, 0);

  object2_srt.fields = object2_srt.scale(1,1,1);

  var object2_rotate = new Transformation()
  object2_rotate.fields = object2_rotate.rotate(0, 270, 0)



  for(var i = 0; i < models[0].positions.length; i++) {
    models[0].positions[i] = object_transform1.multMatrixVec3(models[0].positions[i]);
  }

  for(var i = 0; i < models[1].positions.length; i++) {

    models[1].positions[i] = object2_srt.multMatrixVec3(models[1].positions[i]);
  }
  for(var i = 0; i < models[1].normals.length; i++) {
    models[1].normals[i] = object2_rotate.inverse().transpose().multMatrixVec3(models[1].normals[i]).normalize();

  }


  object_transform = new Transformation();


  //model ids
  models[0].id = "n1";
  models[1].id = "n2";

  //Models are placed, hand them over to the renderer
  renderer.models.push(models[0]);
  renderer.models.push(models[1]);
  console.log(models[1])





  frame();
});



var movement = 25


//FPS measurement
var filterStrength = 20;
var g_frameTime = 0;
var lastLoop = new Date();
var thisloop;

//Game loop time initialization
var now = performance.now() / 1000;
var newNow = performance.now() / 1000;
var dt = 0;
console.log(now);


function frame() {
  dt = newNow - now;
  now = performance.now() / 1000;

  update();
  transformModel(models[0], 1, 1, 1, 0, 0, 0, 100, 0, 0 , dt);
  transformModel(models[1], 1, 1, 1, 0, 0, 0, 0, 0, 100 , dt);


  if(playerState.input.escape === true) {
    console.log("ending");
    return;
  }
  if(playerState.input.backward === true) {
    //console.log("move backward");
    camera.fields =  camera.translate(0,0, dt * -movement);
  }
  if(playerState.input.forward === true ) {
    //console.log("move forward");
    camera.fields =  camera.translate(0, 0,dt * movement);
  }
  if(playerState.input.strafeLeft === true) {
    //console.log("move left");
    camera.fields = camera.translate(dt * -movement,0,0);
  }
  if(playerState.input.strafeRight === true) {
    //console.log("move right");
    camera.fields = camera.translate(dt * movement,0,0);
  }

  if(playerState.input.turnLeft === true) {
    //console.log("turn left");
    camera.fields = camera.rotate(0,dt * movement,0);
  }

  if(playerState.input.turnRight === true) {
    //console.log("turn right");
    camera.fields = camera.rotate(0,dt * -movement,0);

  }

  if(playerState.input.jump === true) {
    //console.log("jump");
    camera.fields = camera.translate(0,dt * movement, 0)
  }
  if(playerState.input.crouch === true) {
    //console.log("crouch");
    camera.fields = camera.translate(0, dt * -movement, 0);
  }

  if(playerState.input.tiltForward === true) {
    //console.log("tilt forward");
    camera.fields = camera.rotate(dt * movement, 0);
  }

  if(playerState.input.tiltBack === true) {
    //console.log("tilt back");
    camera.fields = camera.rotate(dt * -movement, 0);
  }

  if(playerState.input.angleX !== 0 || playerState.input.angleY !== 0) {
    camera.fields = camera.rotate(
        -playerState.input.angleY,
        -playerState.input.angleX);

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


  //Secondary movement controls
  var moveSpeed = 30;
  if(playerState.input.i === true) {
    movementTarget.move(0,0, dt * moveSpeed);
  }
  if(playerState.input.j === true) {
    movementTarget.move(dt * -moveSpeed,0,0);

  }
  if(playerState.input.k === true) {
    movementTarget.move(0,0, dt * -moveSpeed);
  }
  if(playerState.input.l === true) {
    movementTarget.move(dt * moveSpeed,0, 0);

  }
  if(playerState.input.u === true) {
    movementTarget.move(0,dt * moveSpeed, 0);

  }
  if(playerState.input.o === true) {
    movementTarget.move(0,dt * -moveSpeed, 0);

  }





  //console.log(renderer)

  camera_inverse = camera.inverse();

  renderer.camera = camera;
  renderer.camera_inverse = camera_inverse;
  renderer.render(camera_inverse, camera);


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



    thisLoop = new Date();
    var thisFrameTime = thisLoop - lastLoop;
    g_frameTime += (thisFrameTime - g_frameTime) / 1;
    lastLoop = thisLoop;
    newNow = performance.now() / 1000;
    requestAnimationFrame(frame);

}

function transformModel(model, s1,s2, s3, x, y, z, o0, o1, o2, dt) {

  var positions = model.positions.length;
  var normals = model.normals.length;
  var transformation = new Transformation();

  // transformation.fields = transformation.scale(dt * s1,dt * s2, dt * s3)

  transformation.fields = transformation.rotate(dt * o0, dt * o1, dt * o2);

  transformation.fields = transformation.translate(dt * x, dt * y, dt * z);

  for(var i = 0; i < positions; i++) {
    model.positions[i] = transformation.multMatrixVec3(model.positions[i]);
  }
  for(var i = 0; i < normals; i++) {
    model.normals[i] = transformation.inverse().transpose().multMatrixVec3(model.normals[i]).normalize();

  }

}


function update() {
}



//FPS measurement output

var fpsOutput = document.getElementById('fps');
setInterval(function(){
  fpsOutput.innerHTML = (1000/g_frameTime).toFixed(1) + " fps";
}, 1000);
