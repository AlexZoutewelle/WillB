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

function EdgeFunction(v0,v1,v2) {

  return ( ((v1.position[0] - v0.position[0]) * (v2.position[1] - v0.position[1])) - ((v1.position[1] - v0.position[1]) * (v2.position[0] - v0.position[0]))   );
}
