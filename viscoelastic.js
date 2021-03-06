"use strict";

var Particle2 = function(pos, vel) {
  this.position = new Vec2(pos.x, pos.y);
  this.velocity = new Vec2(vel.x, vel.y);
};

function applyGravity(dt, p) {
  //var g = new Vec2(0, -9.8);
  var time = Date.now() * 0.001;
  var g = new Vec2(Math.sin(time * 0.2), Math.sin(time * 0.1 + 1.32));
  var scaledG = Vec2.multiplyByScalar(dt, g, new Vec2(0, 0));
  Vec2.add(p.velocity, scaledG, p.velocity);
}

function advance(dt, p) {
  Vec2.add(p.position, Vec2.multiplyByScalar(dt, p.velocity, new Vec2(0, 0)), p.position);
}

function clamp(x, mn, mx) {
  return Math.min(mx, Math.max(mn, x));
}

function enforceBoundaries(canvas, particle) {
  var aspect = canvas.height / canvas.width;
  particle.position.x = clamp(particle.position.x, 0, 10);
  particle.position.y = clamp(particle.position.y, 0, 10 * aspect);
}

function computeNewVelocity(dt, ar) {
  var x = ar[0].position;
  var xprev = ar[1];
  Vec2.multiplyByScalar(1.0 / dt, Vec2.subtract(x, xprev, new Vec2(0, 0)), ar[0].velocity);
}

function randomDisc() {
  var pt;
  while (typeof pt === 'undefined') {
    var x = Math.random() * 2 - 1,
      y = Math.random() * 2 - 1;
    if (x * x + y * y < 1) {
      pt = {
        x: x,
        y: y
      };
    }
  }
  return pt;
}

function randomParticle(centre, radius) {
  var l = randomDisc();
  Vec2.multiplyByScalar(radius, l, l);

  return new Particle2(Vec2.add(centre, l, new Vec2(0, 0)), {
    x: 0,
    y: 0
  });
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
  var q = Vec2.quantize(h, v, new Vec2(0, 0));
  return hashVec(q, n);
}

function findNeighbours(bins, h, n, p) {
  var q = Vec2.quantize(h, p.position, new Vec2(0, 0));
  var neighbourCellIds = _.flatten(_.range(-1, 2).map(function(dy) {
    return _.range(-1, 2).map(function(dx) {
      return new Vec2(q.x + dx, q.y + dy);
    });
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
    // Ignore thyself
    if (p1.position === p.position) {
      return false;
    }
    // Final strict test
    return Vec2.distance(p1.position, p.position) < h;
  });
}

function findNeighboursLinear(h, particles, p) {
  return particles.filter(function(p1) {
    return Vec2.distance(p1.position, p.position) < h;
  });
}

function doubleDensityRelaxation(h, dt, particles) {
  var binCount = 1000;
  var bins = _.groupBy(particles, function(p) {
    return vecToBinId(h, binCount, p.position);
  });

  var k = 30;
  var kNear = 30;
  var rhoZero = 5.0;
  var rhoNear = 5.0;

  var relax = function(p) {
    var neighbours = findNeighbours(bins, h, binCount, p);
    //var neighbours = findNeighboursLinear(h, particles, p)
    var rho = 0;
    var rhoNear = 0;

    neighbours.forEach(function(j) {
      var q = Vec2.distance(j.position, p.position) / h;
      var q1 = 1 - q;
      rho += q1 * q1;
      rhoNear += q1 * q1 * q1;
    });

    var P = k * (rho - rhoZero);
    var PNear = kNear * rhoNear;
    var dx = new Vec2(0, 0);

    neighbours.forEach(function(j) {
      var q = Vec2.distance(j.position, p.position) / h;
      var q1 = 1 - q;
      var rij = Vec2.subtract(j.position, p.position, new Vec2(0, 0));
      var halfD = Vec2.multiplyByScalar(0.5 * dt * dt * (P * q1 + PNear * q1 * q1), rij, new Vec2(0, 0));

      Vec2.add(j.position, halfD, j.position);
      Vec2.subtract(dx, halfD, dx);
    });
    Vec2.add(p.position, dx, p.position);
  };

  particles.forEach(relax);
}

function integrate(particles, dt, canvas) {
  // A subset of Algorithm 1
  // http://www.ligum.umontreal.ca/Clavet-2005-PVFS/pvfs.pdf
  var h = 0.25;

  particles.forEach(_.partial(applyGravity, dt));
  var xprev = _.pluck(particles, 'position').map(Vec2.clone);
  particles.forEach(_.partial(advance, dt));
  doubleDensityRelaxation(h, dt, particles);
  particles.forEach(_.partial(enforceBoundaries, canvas));
  _.zip(particles, xprev).forEach(_.partial(computeNewVelocity, dt));
  return particles;
}

function run() {
  var canvas = document.getElementById('myCanvas');
  var aspect = canvas.height / canvas.width;
  Renderer.init(canvas);
  var particleCount = 1000;

  var particles = _.range(particleCount).map(_.partial(randomParticle, {
    x: 5,
    y: 5 * aspect
  }, 1.5));

  var dt = 1.0 / 50.0;

  var timestep = function() {
    particles = integrate(particles, dt, canvas);
    Renderer.clear(canvas);
    particles.forEach(_.partial(Renderer.renderParticle, canvas));
    window.requestAnimationFrame(timestep);
  };

  timestep();
}

window.onload = run;
