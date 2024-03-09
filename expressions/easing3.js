function customEase(t, tMin, tMax, value1,  value2, easeFunc) {
	t = Math.max(tMin, Math.min(t, tMax)); // Same as t = clamp(t, tMin, tMax);
	var eased = easeFunc((t - tMin) / (tMax - tMin)); // Inverse lerp and apply easing
	return (1 - eased) * value1 + eased * value2; // Lerp
};

// Example: inOutQuad
customEase(time, 0, 1, [0, 0], [960, 540], function(t) {
	return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
});
