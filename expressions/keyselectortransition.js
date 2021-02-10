// Written by conigs on the /r/AfterEffects Discord

// Transition between the values of two user-defined keyframes
var keyA = effect("Key A")(1);
var keyB = effect("Key B")(1);
var transition = effect("Transition")(1); // 0% to 100%

linear(transition, 0, 100, key(keyA).value, key(keyB).value);