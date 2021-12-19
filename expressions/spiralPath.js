// Generates a spiral path, can be archimedes or logarithmic
// Based on pastebin.com/Y2YWSusr, adjusted for GhostGeemo on /r/AfterEffects Discord

// Connect to sliders
let spiralWidth = 1000;
let points = 200;
let steps = 20;
let vertices = [];
let scaleFactor = 8; // 1 = archimedes spiral, above = logarithmic spiral

// Main
let angle = 0;
const step = (Math.PI * 2) / steps;
const r = spiralWidth * 0.5;
for (let i = 0; i < points; i++) {
    angle += step;
    const radius = Math.pow(i / points, scaleFactor) * r;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    vertices[i] = [x, y];
}

createPath(vertices, [], [], false);