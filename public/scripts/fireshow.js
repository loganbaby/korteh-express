window.onload = function () {
  const currentUrlHash = window.location.hash;
  console.log('Current hash location -> ' + currentUrlHash);

  if (currentUrlHash == '#firework') {
    var firework = JS_FIREWORKS.Fireworks({
      id : 'fireworks-canvas',
      hue : 3,
      particleCount : 50,
      delay : 0,
      minDelay : 3,
      maxDelay : 6,
      boundaries : { // of respawn and target
          top: 50,
          bottom: 240,
          left: 50,
          right: 590
      },
      fireworkSpeed : 10,
      fireworkAcceleration : 1.05,
      particleFriction : .95,
      particleGravity : 1.5
    });

    firework.start();
  }
}