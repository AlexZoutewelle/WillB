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

  console.log(this.screenwidth);
  console.log(this.screenHeight);
  var imageData = new ImageData(imageArray, this.screenWidth, this.screenHeight);
  this.ctx.putImageData(imageData, 0, 0);
}

// ctx = document.getElementById('screen').getContext('2d');
// console.log(ctx);
// var img = ctx.getImageData(0, 0, 450, 680);
// var imgData = img['data'];
// for(var i = 0; i <100; i += 4) {
//   console.log("oke");
//   imgData[i] = 255;     //R
//   imgData[i + 1] = 0;   //G
//   imgData[i + 2] = 0;   //B
//   imgData[i + 3] = 255    //A
// }
// console.log(imgData);
// ctx.putImageData(img, 0,0);
