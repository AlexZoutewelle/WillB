var KEY = {
    BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    ESC:      27,
    SPACE:    32,
    PAGEUP:   33,
    PAGEDOWN: 34,
    END:      35,
    HOME:     36,
    LEFT:     37,
    UP:       38,
    RIGHT:    39,
    DOWN:     40,
    INSERT:   45,
    DELETE:   46,
    ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
    TILDA:    192
  };


//A global playerState object. The gameloops update() function will use this to compute the next gameworld state
var playerState = {
  input: {
    strafeLeft: false, strafeRight: false, backward: false, forward: false,
    escape: false, jump: false, crouch: false, turnLeft: false, turnRight: false, scaleUp: false, scaleBack: false,
    angleX: 0, angleY: 0,
    mouseX: 0, mouseY: 0, pointerLocked: false
  }
}

var globalState = {
  wireFrame: false, face: true
}

//Pointer lock for mouse movement
var canvas = document.getElementById('screen');

document.addEventListener('click', function(e) {
  canvas.requestPointerLock();
})

document.addEventListener('pointerlockchange', function(e) {
  console.log(e);
  if(playerState.input.pointerLocked === false) {
    playerState.input.pointerLocked = true;
  }
  else {
    playerState.input.pointerLocked = false;
  }
},false);

document.addEventListener('mousemove', function(event) {
  if(playerState.input.pointerLocked) {
    var turnVelocity = 8;

    var currentX = event.movementX;
    var currentY = event.movementY;

    var angleX = currentX * turnVelocity * Math.PI / 180;
    var angleY = currentY * turnVelocity * Math.PI / 180;
    playerState.input.angleX += angleX;
    playerState.input.angleY += angleY;
  }
});

//Add event listeners to record our state
document.addEventListener('keydown', function(event) {
  return onkeydown(event, event.keyCode, true);
}, false);

document.addEventListener('keyup',   function(event) {
  return onkeyup( event, event.keyCode, false);
}, false);


//Player is pressing a key
function onkeydown(e, key, pressed) {

  switch(key) {
    case KEY.A:
      playerState.input.strafeLeft = pressed;
      e.preventDefault();
      break;
    case KEY.W:
      playerState.input.forward = pressed;
      e.preventDefault();
      break;
    case KEY.S:
      playerState.input.backward = pressed;
      e.preventDefault();
      break;
    case KEY.D:
      playerState.input.strafeRight = pressed;
      e.preventDefault();
      break;
    case KEY.ESC:
      playerState.input.escape = pressed;
      e.preventDefault();
      break;
    case KEY.SPACE:
      playerState.input.jump = pressed;
      e.preventDefault();
      break;
    case KEY.C:
      playerState.input.crouch = pressed;
      e.preventDefault();
      break;
    case KEY.LEFT:
      playerState.input.turnLeft = pressed;
      e.preventDefault();
      break;
    case KEY.RIGHT:
      playerState.input.turnRight = pressed;
      e.preventDefault();
      break;
    case KEY.UP:
      playerState.input.tiltForward = pressed;
      e.preventDefault();
      break;
    case KEY.DOWN:
      playerState.input.tiltBack = pressed;
      e.preventDefault();
      break;
    case KEY.Q:

      globalState.wireFrame = !globalState.wireFrame;
      e.preventDefault();
      break;
    case KEY.E:
      globalState.face = !globalState.face;
      e.preventDefault();
      break;
  }
}

//Player has released a key
function onkeyup(e, key, pressed) {
  switch(key) {
    case KEY.A:
      playerState.input.strafeLeft = pressed;
      e.preventDefault();
      break;
    case KEY.W:
      playerState.input.forward = pressed;
      e.preventDefault();
      break;
    case KEY.S:
      playerState.input.backward = pressed;
      e.preventDefault();
      break;
    case KEY.D:
      playerState.input.strafeRight = pressed;
      e.preventDefault();
      break;
    case KEY.ESC:
      playerState.input.escape = pressed;
      e.preventDefault();
      break;
    case KEY.SPACE:
      playerState.input.jump = pressed;
      e.preventDefault();
      break;
    case KEY.C:
      playerState.input.crouch = pressed;
      e.preventDefault();
      break;
    case KEY.LEFT:
      playerState.input.turnLeft = pressed;
      e.preventDefault();
      break;
    case KEY.RIGHT:
      playerState.input.turnRight = pressed;
      e.preventDefault();
      break;
    case KEY.UP:
      playerState.input.tiltForward = pressed;
      e.preventDefault();
      break;
    case KEY.DOWN:
      playerState.input.tiltBack = pressed;
      e.preventDefault();
      break;
    }
}
