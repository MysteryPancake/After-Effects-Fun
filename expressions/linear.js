function limitlessLinear(t, tMin, tMax, value1, value2) { // AKA lerp
	var normal = (t - tMin) / (tMax - tMin);
	return (1 - normal) * value1 + normal * value2;
}

function limitedLinear(t, tMin, tMax, value1, value2) { // Default AE linear
	var limitedT = Math.max(tMin, Math.min(t, tMax));
	var normal = (limitedT - tMin) / (tMax - tMin);
	return (1 - normal) * value1 + normal * value2;
}
