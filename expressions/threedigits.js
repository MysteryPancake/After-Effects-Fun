// Forces a number to have 3 leading zeroes
var s = effect("Slider Control")("Slider").value.toFixed(0);
(s.length < 3 ? (s.length < 2 ? "00" : "0") : "") + s;
