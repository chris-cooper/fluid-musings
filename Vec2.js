"use strict";

var Vec2 = function(x, y) {
  this.x = x;
  this.y = y;
};

Vec2.clone = function(v) {
  return new Vec2(v.x, v.y);
};

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
};

Vec2.multiplyByScalar = function(s, v) {
  return new Vec2(v.x * s, v.y * s);
};

Vec2.quantize = function(radius, v) {
  return new Vec2(Math.floor(v.x / radius), Math.floor(v.y / radius));
};

Vec2.magnitude = function(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

Vec2.distance = function(v0, v1) {
  return Vec2.magnitude(Vec2.subtract(v1,v0));
}