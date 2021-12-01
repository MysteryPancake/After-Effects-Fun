// Bent on the /r/AfterEffects Discord came up with shorthand versions of the functions in linear.js
const llCoolJ = t => (tMin, tMax) => (start, end) => ((start, end, normal) => (start * (1 - normal)) + (end * normal))(start, end, (t - tMin) / (tMax - tMin));

// However, it may not be as short as rwaldron.github.io/proposal-math-extensions/#sec-math.scale
const fLerp = (x, inMin, inMax, f, outMin, outMax) => (ratio => (outMax - outMin) * ratio(f(ratio(x, inMin, inMax)), f(0), f(1)) + outMin)((a, b, c) => (a - b) / (c - b));
