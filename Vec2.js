"use strict";

var Vec2 = function(x, y) {
  this.x = x;
  this.y = y;
};

Vec2.clone = function(v) {
  return new Vec2(v.x, v.y);
};

Vec2.add = function(v0, v1, result) {
  result.x = v0.x + v1.x;
  result.y = v0.y + v1.y;
  return result;
};

Vec2.subtract = function(v0, v1, result) {
  result.x = v0.x - v1.x;
  result.y = v0.y - v1.y;
  return result;
};

Vec2.multiplyByScalar = function(s, v, result) {
  result.x = v.x * s;
  result.y = v.y * s;
  return result;
};

Vec2.quantize = function(radius, v, result) {
  result.x = Math.floor(v.x / radius);
  result.y = Math.floor(v.y / radius);
  return result;
};

Vec2.magnitude = function(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

Vec2.distance = function(v0, v1) {
  return Vec2.magnitude(Vec2.subtract(v1, v0, new Vec2(0, 0)));
};
