function workerVec(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.q = 1;

}

workerx = new Worker('/engine/experimental/math.js');
workery = new Worker('/engine/experimental/math.js');
workerz = new Worker('/engine/experimental/math.js');


//Parallel Hadamard product
 workerVec.prototype.multiply = async function(vector) {



  var result = new workerVec();
  var promises = [];

  promises.push(
    new Promise(function(resolve,reject) {

    var var1 = 2; var var2 = vector.position[0];
    var messagex = {multiply: {var1, var2}}

    workerx.postMessage(messagex);

    workerx.addEventListener('message', e => {
      console.log(e.data.result);
      resolve( e.data.result);
    });

  }));

  promises.push(
    new Promise(function(resolve,reject) {

    var var1 = 2; var var2 = vector.position[1];
    var messagey = {multiply: {var1, var2}}

    workery.postMessage(messagey);


    workery.addEventListener('message', e => {
      console.log(e.data.result);
      resolve(e.data.result);
    });

  }));

  promises.push(new Promise(function(resolve,reject) {
    var var1 = 2; var var2 = vector.position[2];
    var messagez = {multiply: {var1, var2}}
    workerz.postMessage(messagez);

    workerz.addEventListener('message', e => {
      resolve( e.data.result);
    });

  }));

  await Promise.all(promises).then(function(data) {
    console.log(data);
      return data;
  });


}
