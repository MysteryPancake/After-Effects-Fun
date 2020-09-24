// To make a layer move in a circle, set the anchor point to this expression
rotSpeed = 8;
rotRadius = 64;
[Math.sin(time * rotSpeed) * rotRadius, Math.cos(time * rotSpeed) * rotRadius];
