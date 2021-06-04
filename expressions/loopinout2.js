// This expression loops path keyframes in and out
// Adapted from Zack's on the /r/AfterEffects Discord
// Messy version of loopinout.js

if (numKeys >= 2) {
	
	var timeStart = key(1).time;
	var duration = key(numKeys).time - timeStart;
	var duration2 = duration * 2;
	var pingPong = true; // Change to false to prevent ping-pong

	if (pingPong) {
		var i = ((time - timeStart % duration2) + duration2) % duration2; // Negative modulo bug
		if (i >= duration) {
			valueAtTime(duration2 - i + timeStart);
		} else {
			valueAtTime(i + timeStart);
		}
	} else {
		valueAtTime(((time - timeStart % duration) + duration) % duration + timeStart); // By Zack
	}
} else {
	value; // Prevent divide by zero error
}