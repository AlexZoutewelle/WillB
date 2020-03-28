console.log('mdlload');

function mdlLoad () {


}

mdlLoad.log = function() {
  var prom = this.loadObject("models/cat.obj");

  prom.then(function(result) {
    console.log(result);
  });

  prom.catch(function(error){
    console.log(error);
  });
}

mdlLoad.loadObject = function(url){
  console.log("loading model...");

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest(url);
    xhr.onload = function() {
      if(this.status = 200) {
        resolve(xhr.response);
      }
      else {
        reject({status: this.status, statusText: this.statusText});
      }
    }
    xhr.onerror = function() {
        reject({status: this.status, statusText: this.statusText});
    }

    xhr.open('GET', url, true);
    xhr.send(null);
  });
}
