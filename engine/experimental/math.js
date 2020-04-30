this.onmessage = function(e) {
  if(e.data.multiply !== undefined) {
    console.log('multiplying');

    this.postMessage({result: e.data.multiply.var1 * e.data.multiply.var2});
  }

};
