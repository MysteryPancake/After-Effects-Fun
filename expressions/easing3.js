function customEase(t, tMin, tMax, value1,  value2, easeFunc) {
	var limitedT = Math.max(tMin, Math.min(t, tMax));
	var normal = (limitedT - tMin) / (tMax - tMin);
	var eased = easeFunc(normal);
    return (value1 * (1 - eased)) + (value2 * eased);
};

// Example: inOutQuad
customEase(time, 0, 1, [0, 0], [960, 540], function(t) {
	return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
});