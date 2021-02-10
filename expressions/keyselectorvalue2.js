// Written by conigs on the /r/AfterEffects Discord

// Slider named "Key Selector"
const keySelector = effect("Key Selector")(1).value;

// Current index and next, clamped to the number of keys
const thisIndex = Math.floor(clamp(keySelector, 1, numKeys));
const nextIndex = Math.min(thisIndex+1, numKeys);

// Result
linear(keySelector%1, key(thisIndex).value, key(nextIndex).value);