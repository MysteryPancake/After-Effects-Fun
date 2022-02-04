// This expression interpolates eased slider keyframes as if they were linear
// Written for Ponzip on the /r/AfterEffects Discord

slider = thisComp.layer("Trigger").effect("Slider Control")("Slider");

n = 0;
if (slider.numKeys > 0) {
	n = slider.nearestKey(time).index;
	if (slider.key(n).time > time) n--;
}
if (n > 0 && n < slider.numKeys) {
    linear(time, slider.key(n).time, slider.key(n + 1).time, slider.key(n).value, slider.key(n + 1).value);
} else {
    slider.value;
}