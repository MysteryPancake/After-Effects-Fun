// Converts from gain (linear scale) to decibels (log scale), useful for volume expressions
var gain = 0.5;
var dB = Math.max(-192, 20 * Math.log10(gain));
[dB, dB];
