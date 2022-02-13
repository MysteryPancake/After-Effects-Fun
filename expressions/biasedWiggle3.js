// Made for <;) on the /r/AfterEffects Discord
// Biases a wiggle towards 0, making it harder to wiggle away from 0
// Combines X and Y influence, check biasedWiggle2.js for a separated version

var frequency = 50;
var amplitude = 100;
var bias = 2;

// Move wiggle center to 0, 0
var wigglePosition = wiggle(frequency, amplitude) - value;
// Multiply wiggle by X ^ bias, so it takes more "effort" to move away from 0
wigglePosition *= Math.pow(length(wigglePosition), bias);
// Make sure it's never larger than the amplitude value
wigglePosition /= Math.pow(amplitude, bias);
// Move wiggle center back to original position
value + wigglePosition;