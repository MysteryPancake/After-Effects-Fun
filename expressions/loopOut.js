// This expression loops path keyframes out only
// Inspired by ibeenjammin on the /r/AfterEffects Discord

if (numKeys >= 2) {
	
	var timeStart = key(1).time;
	var duration = key(numKeys).time - timeStart;
	var pingPong = true; // Change to false to prevent ping-pong

	var quant = Math.floor((time - timeStart) / duration);
	if (quant < 0) quant = 0;
	if (quant % 2 && pingPong) { // This works because -1 is truthy
		valueAtTime(2 * timeStart + (quant + 1) * duration - time);
	} else {
		valueAtTime(time - quant * duration);
	}
} else {
	value; // Prevent divide by zero error
}
