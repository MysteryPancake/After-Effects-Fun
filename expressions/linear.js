// I made this based on arithmetic sequence formulas (see github.com/MysteryPancake/Fun/blob/master/html/arithmetic.html)
// Turns out this combines lerp and inverse lerp (didn't know at the time)

function limitlessLinear(t, tMin, tMax, value1, value2) {
	var normal = (t - tMin) / (tMax - tMin); // Inverse Lerp: Normalize t to a number between 0 and 1 (can exceed)
	return (1 - normal) * value1 + normal * value2; // Lerp: Weighted sum (e.g. 25% of value 1, 75% of value 2)
}

function limitlessLinear2(t, tMin, tMax, value1, value2) { // Alternative from rwaldron.github.io/proposal-math-extensions/#sec-math.scale
	return (t - tMin) * (value2 - value1) / (tMax - tMin) + value1;
}

function limitedLinear(t, tMin, tMax, value1, value2) { // Not equal to AE linear after all! twitter.com/broadcastGEMs/status/1458088326896947209
	t = Math.max(tMin, Math.min(t, tMax)); // Clamp t between tMin and tMax
	var normal = (t - tMin) / (tMax - tMin); // Inverse Lerp: Normalize t to a number between 0 and 1 (cannot exceed)
	return (1 - normal) * value1 + normal * value2; // Lerp: Weighted sum (e.g. 25% of value 1, 75% of value 2)
}

function limitedLinear2(t, tMin, tMax, value1, value2) { // Alternative from rwaldron.github.io/proposal-math-extensions/#sec-math.scale
	t = Math.max(tMin, Math.min(t, tMax)); // Clamp t between tMin and tMax
	return (t - tMin) * (value2 - value1) / (tMax - tMin) + value1;
}
