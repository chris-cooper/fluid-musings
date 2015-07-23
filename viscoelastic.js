"use strict";
var Vec2 = function(x, y) {
  this.x = x;
  this.y = y;
};

Vec2.clone = function(v) {
  return new Vec2(v.x, v.y);
}

Vec2.add = function(v0, v1) {
  return new Vec2(
    v0.x + v1.x,
    v0.y + v1.y
  );
};

Vec2.subtract = function(v0, v1) {
  return new Vec2(
    v0.x - v1.x,
    v0.y - v1.y
  );
}

Vec2.multiplyByScalar = function(s, v) {
  return new Vec2(v.x * s, v.y * s);
}

Vec2.quantize = function(v, radius) {
  return new Vec2(Math.floor(v.x / radius), Math.floor(v.y / radius));
};

var Particle2 = function(pos, vel) {
  this.position = new Vec2(pos.x, pos.y);
  this.velocity = new Vec2(vel.x, vel.y);
}

function applyGravity(dt, p) {
  var g = new Vec2(0, -9.8);
  var newVelocity = Vec2.add(p.velocity, Vec2.multiplyByScalar(dt, g));
  return new Particle2(p.position, newVelocity);
}

function advance(dt, p) {
  var newPosition = Vec2.add(p.position, Vec2.multiplyByScalar(dt, p.velocity));
  return new Particle2(newPosition, p.velocity);
}

function computeNewVelocity(dt, ar) {
  var x = ar[0].position;
  var xprev = ar[1];
  var newVelocity = Vec2.multiplyByScalar(1.0 / dt, Vec2.subtract(x, xprev));
  return new Particle2(x, newVelocity);
}

function randomDisc(centre, radius) {
  var l;
  while (!l) {
    var x = Math.random() * 2 - 1,
      y = Math.random() * 2 - 1;
    if (x * x + y * y < 1) {
      l = {
        x: x,
        y: y
      }
    }
  }

  return new Particle2({
    x: centre.x + radius * l.x,
    y: centre.y + radius * l.y
  }, {
    x: 0,
    y: 0
  });
}

function clearCanvas(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function drawParticle(canvas, p) {
  var ctx = canvas.getContext('2d');

  var radius = 1;

  // remap
  var centerX = p.position.x * 10;
  var centerY = canvas.height - p.position.y * 10;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
}

// http://cg.informatik.uni-freiburg.de/publications/2003_VMV_collisionDetectionHashing.pdf
function hash(x, y, z, n) {
  var p1 = 73856093;
  var p2 = 19349663;
  var p3 = 83492791;
  return ((x * p1) ^ (y * p2) ^ (z * p3)) % n;
}


function integrate(particles, dt) {
  particles = particles.map(_.partial(applyGravity, dt));
  var xprev = _.pluck(particles, 'position').map(Vec2.clone);
  particles = particles.map(_.partial(advance, dt));
  particles = _.zip(particles, xprev).map(_.partial(computeNewVelocity, dt));
  return particles;
}


function run() {
  var canvas = document.getElementById('myCanvas');

  var particles = _.range(100).map(_.partial(randomDisc, {
    x: 10,
    y: 10
  }, 1));

  var dt = 0.001;

  var timestep = function() {
    particles = integrate(particles, dt);
    clearCanvas(canvas);
    particles.map(_.partial(drawParticle, canvas));
    window.requestAnimationFrame(timestep);
  };

  timestep();
}




window.onload = run;
