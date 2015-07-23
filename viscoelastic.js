"use strict";

var Particle2 = function(pos, vel) {
  this.position = new Vec2(pos.x, pos.y);
  this.velocity = new Vec2(vel.x, vel.y);
};

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
      };
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

function hash(x, y, z, n) {
  // http://cg.informatik.uni-freiburg.de/publications/2003_VMV_collisionDetectionHashing.pdf
  var p1 = 73856093;
  var p2 = 19349663;
  var p3 = 83492791;
  return Math.abs(x * p1 ^ y * p2 ^ z * p3) % n;
}

function hashVec(v, n) {
  return hash(v.x, v.y, 0, n);
}

function vecToBinId(h, n, v) {
  var q = Vec2.quantize(h, v);
  return hashVec(q, n);
}

var findNeighbours = function(bins, h, n, p) {
  var q = Vec2.quantize(h, p.position);
  var neighbourCellIds = _.flatten(_.range(-1, 2).map(function(dy) {
    return _.range(-1, 2).map(function(dx) {
      return new Vec2(q.x + dx, q.y + dy);
    })
  }));
  var neighbourCellHashIds = neighbourCellIds.map(function(q) {
    return hashVec(q, n);
  });
  var candidateParticles = _.flatten(neighbourCellHashIds.map(function(i) {
    return bins[i];
  }));

  return candidateParticles.filter(function(p1) {
    if (typeof p1 === 'undefined') {
      return false;
    }
    return Vec2.distance(p1.position, p.position) < h;
    //return true;
  });
}

var findNeighbours2 = function(h, particles, p) {
  return particles.filter(function(p1) {
    return Vec2.distance(p1.position, p.position) < h;
  });
}

function doubleDensityRelaxation(h, dt, particles) {
  var n = 100;
  var bins = _.groupBy(particles, function(p) {
    return vecToBinId(h, n, p.position);
  });

  var k = 100;
  var kNear = 100;
  var rhoZero = 5.0;
  var rhoNear = 5.0;

  var relax = function(p) {
    var neighbours = findNeighbours(bins, h, n, p);
    //var neighbours = findNeighbours2(h, particles, p)
    var rho = 0;
    var rhoNear = 0;

    neighbours.forEach(function(j) {
      var q = Vec2.distance(j.position, p.position) / h;
      if (q < 1) {
        var q1 = 1 - q;
        rho += q1 * q1;
        rhoNear += q1 * q1 * q1;
      }
    });

    var P = k * (rho - rhoZero);
    var PNear = kNear * rhoNear;
    var dx = new Vec2(0, 0);

    neighbours.forEach(function(j) {
      var q = Vec2.distance(j.position, p.position) / h;
      if (q < 1) {
        console.log(q)
        var q1 = 1 - q;
        var rij = Vec2.subtract(j.position, p.position);
        var halfD = Vec2.multiplyByScalar(0.5 * dt * dt * (P * q1 + PNear * q1 * q1), rij);

        j.position = Vec2.add(j.position, halfD);
        dx = Vec2.subtract(dx, halfD);
      }
    });
    p.position = Vec2.add(p.position, dx);
  };

  particles.forEach(relax);

  /*
  var p = _.range(particles.length).map(_.partial(gimme, 0));
  var pnear = _.range(particles.length).map(_.partial(gimme, 0));
  */

  return particles;
}

function integrate(particles, dt) {
  // http://www.tfsoft.org.ua/~blinkenlichten/viscoelastic-sph-10.1.1.59.9379.pdf
  var h = 0.5;

  particles = particles.map(_.partial(applyGravity, dt));
  var xprev = _.pluck(particles, 'position').map(Vec2.clone);
  particles = particles.map(_.partial(advance, dt));
  particles = doubleDensityRelaxation(h, dt, particles);
  particles = _.zip(particles, xprev).map(_.partial(computeNewVelocity, dt));
  return particles;
}


function run() {
  var canvas = document.getElementById('myCanvas');

  var particles = _.range(100).map(_.partial(randomDisc, {
    x: 10,
    y: 10
  }, 1));

  var dt = 1.0 / 24.0;

  var timestep = function() {
    particles = integrate(particles, dt);
    clearCanvas(canvas);
    particles.map(_.partial(drawParticle, canvas));
    window.requestAnimationFrame(timestep);
  };

  timestep();
}




window.onload = run;
