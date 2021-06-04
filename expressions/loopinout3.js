// This expression loops path keyframes in and out
// Adapted from Zack's on the /r/AfterEffects Discord
// More readable version of loopinout2.js

var timeStart = key(1).time;
var duration = key(numKeys).time - timeStart;
var pingPong = true; // Change to false to prevent ping-pong

function fixedMod(x, n) { // Fixes negative modulo bug
	return ((x % n) + n) % n;
}

if (pingPong) {
	var i = fixedMod(time - timeStart, duration * 2);
	if (i >= duration) {
		valueAtTime(duration * 2 - i + timeStart);
	} else {
		valueAtTime(i + timeStart);
	}
} else {
	valueAtTime(fixedMod(time - timeStart, duration) + timeStart);
}