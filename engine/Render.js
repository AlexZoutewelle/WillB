/**
Draw holds a reference to the context of the canvas
**/
function Render(screenWidth, screenHeight) {
  this.ctx = document.getElementById('screen').getContext('2d');
  console.log(this.ctx);
  this.screenWidth = screenWidth;
  this.screenHeight = screenHeight;
}


/**
* Must hold the conversions
* perspective divide
* ndc coordinates
* pixel coordinates
*
*
**/




/**
Draws a Uint8ClampedArray to the canvas
This array holds 4 elements for each pixel: R G B and A, values are between 0 and 255
**/
Render.prototype.draw = function(imageArray) {
  //var currentImage = this.ctx.getImageData(0,0,this.screenWidth, this.screenHeight);

  //console.log(imageArray);
  var imageData = new ImageData(imageArray, this.screenWidth, this.screenHeight);
  this.ctx.putImageData(imageData, 0, 0);
}



/**
*
* Main rendering function
* In the future, it should take an array of modelGeometry
**/
Render.prototype.render = function(modelGeometry, camera_inverse, object_transform) {

  // point_array = [];
  // point_pd_array = [];
  // point_ndc_array = [];

  raster_array = [];
  pixel_array = [];
  var screenWidth = this.screenWidth;
  var imgArray = new Uint8ClampedArray(4 * this.screenWidth * this.screenHeight);
  //var arrayBuffer = Array.from(Array(500), () => new Array(500));
  //console.log(arrayBuffer);

  var canvasWidth = 2;
  var canvasHeight =  2;

  var offsetX = this.screenWidth / 2;
  var offsetY = this.screenHeight / 2;
console.log(modelGeometry);
  modelGeometry.positions.forEach(position => {

      //multiply each point with the inverse camera

      //var point = new Vector3(position.fields[0] + offsetX, position.fields[1] + offsetY, position.fields[2]);
      //object_transform.fields = object_transform.multiply(camera_inverse);
      var point = object_transform.multMatrixVec3(position)
      point = camera_inverse.multMatrixVec3(point);


      //perspective_divide. Bitwise OR operator to convert to integer
      var point_pd = new Vector3(0,0,0);
      point_pd.fields[0] = ((point.fields[0] )/ (-point.fields[2]) ) * 120;
      point_pd.fields[1] = ((point.fields[1] ) / (-point.fields[2]) ) * 120;
      point_pd.fields[2] = point.fields[2];


      //ndc (range of [0,1])
      var point_ndc = new Vector3(0,0,0);


      point_ndc.fields[0] = (point_pd.fields[0] + (this.screenWidth / 2)) / this.screenWidth;       //x + canvas_width * 0.5    / canvas_width
      point_ndc.fields[1] = (point_pd.fields[1] + (this.screenHeight / 2)) / this.screenHeight;       //y + canvas_height * 0.5 / canvas_height


      //raster coords (pixels)
      var point_raster = new Vector3(0,0,0);
      point_raster.fields[0] = Math.abs((point_ndc.fields[0] * this.screenWidth) | 0);
      point_raster.fields[1] = Math.abs(((1 - point_ndc.fields[1] ) * this.screenHeight) | 0);
      point_raster.fields[2] = position.fields[2];

      //So we now have the point's pixel location: an x and y.
      //We need to draw this point:  separate RGBA indices
      var pixel = ((point_raster.fields[0]) * 4) + ((screenWidth * (point_raster.fields[1])) * 4);
      pixel_array.push(pixel);

      imgArray[pixel] = 255;
      imgArray[pixel + 1] = 0;
      imgArray[pixel + 2] = 0;
      imgArray[pixel + 3] = 255;

      //raster coords (pixels) that are within screenwidth/height: 255,255,255,255
  });

  this.draw(imgArray);
}
