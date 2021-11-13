function customEase(t, tMin, tMax, value1,  value2, easeFunc) {
	t = Math.max(tMin, Math.min(t, tMax));
	var eased = easeFunc((t - tMin) / (tMax - tMin));
	return (1 - eased) * value1 + eased * value2;
};

// Example: inOutQuad
customEase(time, 0, 1, [0, 0], [960, 540], function(t) {
	return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
});
