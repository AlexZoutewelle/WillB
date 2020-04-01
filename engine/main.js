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
  var testmat = new Transformation([[4, 8, 12, 16],[2, 7, 7, 3],[3, 1, 2.1, 4.6],[0.1, 0.14, 3, 1]]);
  console.log(testmat.fields[0][0]);
  console.log(testmat.fields[1][0]);
  testmat.inverse();

  console.log(testmat.fields);

  for(var i = 0; i <100; i += 4) {
    console.log("oke");
    imgArray[i] = 255;     //R
    imgArray[i + 1] = 0;   //G
    imgArray[i + 2] = 0;   //B
    imgArray[i + 3] = 255    //A
  }

  var renderer = new Render(screenWidth, screenHeight);
  // renderer.draw(imgArray);

  //trying out some camera stuff

  var camera = new Transformation([[0.0000271214, 0.0034, 0.490904,0  ], [ -0.192902, 0.319559, -0.000342346, 0],[0.451415, 5.39295, 0.0000012, 0],[0.444534, 3, 4,1]]);
  var camera_inverse = camera.inverse();

  //Load the cat model
  var model = mdlLoad.loadObject("models/cat.obj");

  //test point imgArray
  point_array = [];
  point_pd_array = [];
  point_ndc_array = [];
  pixel_array = [];
  model.then(function(result) {

    var modelGeometry = Geometry.parseOBJ(result);
    console.log(modelGeometry);

    modelGeometry.positions.forEach(position => {
        //multiply each point with the inverse camera
        var point = camera_inverse.multVec3(position);
        point_array.push(point.fields[0], point.fields[1], point.fields[2]);

        //perspective_divide. Bitwise OR operator to convert to integer
        var point_pd = new Vector3(0,0,0);
        point_pd.fields[0] = point.fields[0] / -point.fields[2];
        point_pd.fields[1] = point.fields[1] / -point.fields[2];
        point_pd.fields[2] = 1;

        point_pd_array.push(point_pd.fields[0], point_pd.fields[1], point_pd.fields[2]);

        //ndc (range of [0,1])
        var point_ndc = new Vector3(0,0,0);
        // console.log(point_pd.fields[0]);
        // console.log(point_pd.fields[1]);
        point_ndc.fields[0] = (point_pd.fields[0] + 1) / 2;
        point_ndc.fields[1] = (1 - point_pd.fields[1]) / 2;

        point_ndc_array.push(point_ndc);

        //raster coords (pixels)
        var point_raster = new Vector3(0,0,0);
        point_raster.fields[0] = (point_ndc.fields[0] * screenWidth) | 0;
        point_raster.fields[1] = (point_ndc.fields[1] * screenHeight) | 0;
        point_raster.fields[2] = position.fields[2];

        //So we now have the point's pixel location: an x and y.
        //We need to draw this point:  separate RGBA indices
        var pixel = point_raster.fields[0] * point_raster.fields[1] * 4;
        pixel_array.push(pixel);

        imgArray[pixel] = 255;
        imgArray[pixel + 1] = 0;
        imgArray[pixel + 2] = 0;
        imgArray[pixel + 3] = 255;

        //raster coords (pixels) that are within screenwidth/height: 255,255,255,255
    });
    //console.log(point_array);
    //console.log(point_pd_array);
    //console.log(point_ndc_array);
    console.log(pixel_array);
    console.log(imgArray);
    renderer.draw(imgArray);
  });
}
