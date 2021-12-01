// With 3 keyframes, n = 1 uses the first, n = 2 uses the second, n = 3 uses the third and so on
// Does not work on the Property type, only regular types (check keySelectorTime.js for an improved version)

var n = 1;
var rounded = Math.floor(n);
var prevKey = key(clamp(rounded, 1, numKeys)).value;
var nextKey = key(clamp(rounded + 1, 1, numKeys)).value;

linear(n % 1, 0, 1, prevKey, nextKey);
