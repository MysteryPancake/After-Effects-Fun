// Lerps from blue -> yellow -> red

var blueToRedRatio = 0; // Between 0 and 1
if (blueToRedRatio < 0.5) {
	// Blue to yellow
	linear(blueToRedRatio, 0, 0.5, [0, 0, 1, 1], [1, 1, 0, 1]); // [red, green, blue, alpha]
} else {
	// Yellow to red
	linear(blueToRedRatio, 0.5, 1, [1, 1, 0, 1], [1, 0, 0, 1]); // [red, green, blue, alpha]
}
