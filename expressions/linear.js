// I created this after learning about arithmetic sequence formulas (see github.com/MysteryPancake/Fun/blob/master/html/arithmetic.html)
// Turns out this combines lerp and inverse lerp (I didn't know either formula at the time)

function limitlessLinear(t, tMin, tMax, value1, value2) { // Combination of lerp and inverse lerp
	var normal = (t - tMin) / (tMax - tMin); // Normalize t between 0 and 1 (can exceed)
	return (1 - normal) * value1 + normal * value2; // Use this value as a weighted sum (e.g. 25% of value 1, 75% of value 2)
}

function limitedLinear(t, tMin, tMax, value1, value2) { // Default AE linear
	t = Math.max(tMin, Math.min(t, tMax)); // Clamp t between tMin and tMax
	var normal = (t - tMin) / (tMax - tMin); // Normalize t between 0 and 1 (cannot exceed)
	return (1 - normal) * value1 + normal * value2; // Use this value as a weighted sum (e.g. 25% of value 1, 75% of value 2)
}
