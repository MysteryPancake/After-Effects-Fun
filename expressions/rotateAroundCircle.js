// Use this expression on the anchor point or position to make a layer move in a circle
// Based on the circle example from https://wiki.facepunch.com/gmod/surface.DrawPoly
rotSpeed = 8;
rotRadius = 64;
value + [Math.sin(time * rotSpeed) * rotRadius, Math.cos(time * rotSpeed) * rotRadius];
