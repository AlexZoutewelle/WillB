function ZBuffer(width, height) {
  this.width = width;
  this.height = height;
  this.buffer = new Int32Array(width * height);
  this.clear();
}

ZBuffer.prototype.clear = function() {
  var bufferSize = this.buffer.length;
  for(var i = 0; i < bufferSize; i++) {

    this.buffer[i] = 99999;
  }
}

ZBuffer.prototype.getZ = function(x, y) {
  if(x > 0 &&
     x < this.width &&
     y > 0 &&
     y < this.height) {

    return this.buffer[x + (y * this.width)];
  }
}

//Test whether a point should be drawn or not.
ZBuffer.prototype.Ztest = function(x, y, zIn) {
  var zValue = this.getZ(x, y);

  if(zIn < zValue) {
    this.buffer[x + (y * this.width)] = zIn;
    return true;
  }

  return false;
}
