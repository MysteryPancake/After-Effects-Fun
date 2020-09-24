const flerp = (x, inMin, inMax, f, outMin, outMax) => (ratio => (outMax - outMin) * ratio(f(ratio(x, inMin, inMax)), f(0), f(1)) + outMin)((a, b, c) => (a - b) / (c - b));
