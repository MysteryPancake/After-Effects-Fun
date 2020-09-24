// Bent on the /r/AfterEffects Discord came up with this epic one line mod
const llCoolJ = t => (tMin, tMax) => (start, end) => ((start, end, normal) => (start * (1 - normal)) + (end * normal))(start, end, (t - tMin) / (tMax - tMin));
