var EasingFunctions = {
	linear: t => t,
	easeInQuad: t => t*t,
	easeOutQuad: t => t*(2-t),
	easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
	easeInCubic: t => t*t*t,
	easeOutCubic: t => (--t)*t*t+1,
	easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
	easeInQuart: t => t*t*t*t,
	easeOutQuart: t => 1-(--t)*t*t*t,
	easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
	easeInQuint: t => t*t*t*t*t,
	easeOutQuint: t => 1+(--t)*t*t*t*t,
	easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
}

function customEasing(name, t, tMin, tMax, value1, value2) {
	t = Math.max(tMin, Math.min(t, tMax)); // Same as t = clamp(t, tMin, tMax);
	var eased = EasingFunctions[name]((t - tMin) / (tMax - tMin)); // Inverse lerp and apply easing
	return (1 - eased) * value1 + eased * value2; // Lerp
};

// EXAMPLE USAGE:
customEasing("easeInOutQuad", time, 0, 1, [0, 0], [960, 540]);
