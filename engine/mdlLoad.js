/**
Loads a.obj model
**/
function mdlLoad () {


}

mdlLoad.loadObject = function(url, texture){
//Reserved for requesting multiple objects
  var prom = this.requestObject(url);
  return prom.then( result => {
    modelGeometry = new Geometry();
    modelGeometry.parseOBJ(result, texture);
    return modelGeometry;
  })
}

mdlLoad.requestObject = function(url){
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
