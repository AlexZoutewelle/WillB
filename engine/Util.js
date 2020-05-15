//Utility functions

function getMin3(var1, var2, var3) {
  if(var1 <= var2 && var1 <= var3) {
    return var1;
  }

  else if(var2 <= var1 && var2 <= var3) {
    return var2
  }

  else {
    return var3;
  }
}

function getMax3(var1, var2, var3) {
  if(var1 >= var2 && var1 >= var3) {
    return var1;
  }

  else if(var2 >= var1 && var2 >= var3) {
    return var2
  }

  else {
    return var3;
  }
}

function getMinXVertex(v0,v1,v2) {
  if(v0.position.position[0] <= v1.position.position[0] && v0.position.position[0] <= v2.position.position[0]) {
    return v0;
  }

  else if(v1.position.position[0] <= v0.position.position[0] && v1.position.position[0] <= v2.position.position[0]) {
    return v1;
  }
  else {
    return v2;
  }
}

function EdgeFunction(v0,v1,v2) {
  return ( v2.position[0] * (v0.position[1] - v1.position[1]) +
           v2.position[1] * (v1.position[0] - v0.position[0]) +
           ((v1.position[1] * v0.position[0]) - (v1.position[0] * v0.position[1]))
        );
}

function log3(v) {
  console.log(v.position[0] + " " + v.position[1] + " " + v.position[2] + " " + v.position[3]);
}
function log2(v) {
  console.log(v.position[0] + " " + v.position[1]);
}
