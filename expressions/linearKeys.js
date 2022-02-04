// This expression interpolates eased keyframes as if they were linear
// Written for Ponzip on the /r/AfterEffects Discord

n = 0;
if (numKeys > 0) {
	n = nearestKey(time).index;
	if (key(n).time > time) n--;
}
if (n > 0 && n < numKeys) {
    linear(time, key(n).time, key(n + 1).time, key(n).value, key(n + 1).value);
} else {
    value;
}