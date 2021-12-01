// Refactor by conigs on the /r/AfterEffects Discord

// Slider named "Key Selector"
var keySelector = effect("Key Selector")(1);

// Get nearest key on keySelector
var nearestSelectorKey = keySelector.nearestKey(time);

// Get current and next keySelector indices, clamped to number of keySelector keyframes
var thisSelector = keySelector.key(clamp(nearestSelectorKey.index - (nearestSelectorKey.time > time ? 1 : 0), 1, keySelector.numKeys));
var nextSelector = keySelector.key(Math.min(thisSelector.index+1, keySelector.numKeys));

// Get current and next key indices for this property
var thisKeyIndex = clamp(thisSelector.value, 1, numKeys);
var nextKeyIndex = clamp(nextSelector.value, 1, numKeys);

// Result 
linear(time, thisSelector.time, nextSelector.time, key(thisKeyIndex).value, key(nextKeyIndex).value);
