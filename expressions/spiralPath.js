// Generates a spiral path, can be archimedes or fake logarithmic
// Based on pastebin.com/Y2YWSusr, adjusted for GhostGeemo on /r/AfterEffects Discord

// Connect to sliders
let spiralWidth = 1000;
let points = 200;
let steps = 20;
let vertices = [];
let scaleFactor = 8; // 1 = archimedes spiral, above = more logarithmic

// Main
let angle = 0;
const step = (Math.PI * 2) / steps;
const r = spiralWidth * 0.5;
for (let i = 0; i < points; i++) {
    angle += step;
    const radius = Math.pow(i / points, scaleFactor) * r; // Actual log spirals are theta^a, not a^theta
    const x = Math.cos(angle) * radius; // Math.sin for clockwise
    const y = Math.sin(angle) * radius; // Math.cos for clockwise
    vertices[i] = [x, y];
}

createPath(vertices, [], [], false);