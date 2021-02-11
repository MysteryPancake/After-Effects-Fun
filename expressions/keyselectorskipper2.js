// Refactor by conigs on the /r/AfterEffects Discord

// Slider named "Key Selector"
const keySelector = effect("Key Selector")(1);

// Get nearest key on keySelector
let nearestSelectorKey = keySelector.nearestKey(time);

// Get current and next keySelector indices, clamped to number of keySelector keyframes
const thisSelector = keySelector.key(clamp(nearestSelectorKey.index - (nearestSelectorKey.time > time ? 1 : 0), 1, keySelector.numKeys));
const nextSelector = keySelector.key(Math.min(thisSelector.index+1, keySelector.numKeys));

// Get current and next key indices for this property
const thisKeyIndex = clamp(thisSelector.value, 1, numKeys);
const nextKeyIndex = clamp(nextSelector.value, 1, numKeys);

// Result 
linear(time, thisSelector.time, nextSelector.time, key(thisKeyIndex).value, key(nextKeyIndex).value);