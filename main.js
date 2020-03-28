//// TODO:
//Load a model
//console.log it
main();

function main() {
  var prom = requestObject("models/cat.obj");
  prom.then(function(result) {
    console.log(result);
  }).catch(function(error) {
    console.log(error);
  });

}

function requestObject(url) {
  console.log("loading model from: " + url);

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest(url);

    xhr.onload= function() {
      if(this.status === 200){
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    }

    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: this.statusText
      });
    }

    xhr.open('GET', url, true);
    xhr.send(null);
 });

}
