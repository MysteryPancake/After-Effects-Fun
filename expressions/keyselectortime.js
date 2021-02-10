// Written by fad on the /r/AfterEffects Discord

// With 3 keyframes, n = 1 uses the first, n = 2 uses the second, n = 3 uses the third and so on
// Works on the Property type as well as regular types
var n = 1;

var rounded = Math.floor(n);
var prevKey = key(clamp(rounded, 1, numKeys)).time;
var nextKey = key(clamp(rounded + 1, 1, numKeys)).time;

valueAtTime(linear(n % 1, 0, 1, prevKey, nextKey));