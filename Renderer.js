var Renderer = function() {};

Renderer.init = function(canvas) {
  var zoom = window.devicePixelRatio;
  canvas.width = canvas.clientWidth * zoom;
  canvas.height = canvas.clientHeight * zoom;

  this.canvas = canvas;
  this.context = canvas.getContext('2d');
};

Renderer.clear = function(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

Renderer.renderParticle = function(canvas, p) {
  var ctx = canvas.getContext('2d');

  var radius = canvas.width * 0.005;
  var border = 5;

  // remap
  var centerX = border + p.position.x / 10.0 * (canvas.width - border * 2);
  var centerY = canvas.height - (border + p.position.y / 10.0 * (canvas.width - border * 2));

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
};
