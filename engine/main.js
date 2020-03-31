//// TODO:
//goal1:draw wireframe of cat
//goal2:move around cat
//object is parsed
//Setup drawing on canvas
  //buffer
  //change buffer
  //push bufferto canvas
//Transform cat to camera
  //draw transformed cat to canvas buffer

//get canvas width and height
//create a buffer
//Draw on the buffer
//Insert the buffer?


main();
function main() {

  var screenWidth = 450;
  var screenHeight = 680;

  //Get the context

  //Drawing a red line on the screen
  var imgArray = new Uint8ClampedArray(4 * screenWidth * screenHeight);

  for(var i = 0; i <100; i += 4) {
    console.log("oke");
    imgArray[i] = 255;     //R
    imgArray[i + 1] = 0;   //G
    imgArray[i + 2] = 0;   //B
    imgArray[i + 3] = 255    //A
  }

  var renderer = new Render(screenWidth, screenHeight);
  renderer.draw(imgArray);

  //trying out some camera stuff
  var camera = new Transformation();
  var camera_inverse = camera.inverse();

  //Load the cat model
  var model = mdlLoad.loadObject("models/cat.obj");

  //test point imgArray
  point_array = [];
  model.then(function(result) {

    var modelGeometry = Geometry.parseOBJ(result);
    console.log(modelGeometry);

    modelGeometry.positions.forEach(position => {
        //multiply each point with the inverse camera
        var point = camera_inverse.multVec3(position);
        //perspective_divide
        point_array.push(point);
        //ndc

        //raster coords

        //raster coords (pixels) that are within screenwidth/height: 255,255,255,255
    });

    console.log(point_array);
    console.log(modelGeometry.positions);
  });
}
