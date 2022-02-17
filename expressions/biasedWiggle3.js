// Made for <;) on the /r/AfterEffects Discord
// Biases a wiggle towards 0 using a curved function, making it harder to wiggle away from 0
// Combines X and Y influence, check biasedWiggle2.js for a separated version

var frequency = 50;
var amplitude = 100;
var bias = 2;

// Move wiggle center to 0 and clamp to prevent it from exceeding amplitude
var wigglePosition = clamp(wiggle(frequency, amplitude) - value, -amplitude, amplitude);

// Multiply wiggle by X ^ bias, so it takes exponentially more "effort" to move away from 0
wigglePosition *= Math.pow(length(wigglePosition) / amplitude, bias);

// Move wiggle center back to original position
value + wigglePosition;