// Made for <;) on the /r/AfterEffects Discord
// Biases a wiggle towards 0 using a curved function, making it harder to wiggle away from 0
// Separates X and Y influence, check biasedWiggle3.js for a combined version

var frequency = 50;
var amplitude = 100;
var bias = 2;

// Move wiggle center to 0, 0
var wigglePosition = wiggle(frequency, amplitude) - value;

// Multiply wiggle by X ^ bias, so it takes exponentially more "effort" to move away from 0
wigglePosition[0] *= Math.pow(Math.abs(wigglePosition[0]) / amplitude, bias);
wigglePosition[1] *= Math.pow(Math.abs(wigglePosition[1]) / amplitude, bias);

// Move wiggle center back to original position
value + wigglePosition;