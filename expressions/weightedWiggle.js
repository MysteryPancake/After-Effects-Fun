// Made for Blanket on the /r/AfterEffects Discord
// Biases a wiggle, making it more likely to approach a certain number or position

var frequency = 100;
var amplitude = 500;

var wigglePosition = wiggle(frequency, amplitude) - value;
var targetPosition = [250, 250]; // This should be within the amplitude range, e.g -500 to 500
// If you want to approach a 1 dimensional number uncomment the line below
// var targetPosition = [effect("Slider Control")("Slider"), effect("Slider Control")("Slider")];

var targetPosition /= amplitude;
var distanceToTarget = length(wigglePosition, targetPosition);
value + wigglePosition + targetPosition * distanceToTarget;
