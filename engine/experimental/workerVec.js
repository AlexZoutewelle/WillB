function workerVec(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.q = 1;

  this.workerx = new Worker('/engine/experimental/math.js');
  this.workery = new Worker('/engine/experimental/math.js');
  this.workerz = new Worker('/engine/experimental/math.js');
  this.workerq = new Worker('/engine/experimental/math.js');


}


//Parallel Hadamard product
workerVec.prototype.multiply = function(vector) {

  var result = new workerVec();

  var thisx = this.x; var vx = vector.position[0];
  var messagex = {multiply: {thisx, vx}}

  var thisy = this.y; var vy = vector.position[1];
  var messagey = {multiply: {thisy, vy}}

  var thisz = this.z; var vz = vector.position[2];
  var messagez = {multiply: {thisz,vz}}



  this.workerx.postMessage(messagex);
  this.workery.postMessage(messagey);
  this.workerz.postMessage(messagez);

  this.workerx.onMessage = function(e) {
    result.x = e.data.result;
  }

  this.workery.onMessage = function(e) {
    result.y = e.data.result;
  }

  this.workerz.onMessage = function(e) {
    result.z = e.data.result;
  }

  return result;

}
