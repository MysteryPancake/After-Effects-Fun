// Written by fad on the /r/AfterEffects Discord

// This interpolates between keyframes like keyselectorvalue, but allows keyframes to be skipped
// For example, if the slider goes from 1 to 3, it skips keyframe 2 and interpolates directly from 1 to 3

// use a slider to keyframe key indexes ("poses") to interpolate between without interpolating through the intermediate keyframes 
var s = effect("Slider Control")("Slider");

// find the key indexes of the keys on the slider either side of the current time, and clamp them to the slider's range of key indexes
var prevSliderKeyIndex = clamp((s.nearestKey(time).time > time) ? (s.nearestKey(time).index - 1) : (s.nearestKey(time).index), 1, s.numKeys);
var nextSliderKeyIndex = Math.min(prevSliderKeyIndex + 1, s.numKeys)

// find the value of each of these keys, and clamp them to the this property's range of key indexes (as these values will act as the index for this property's keys)
var prevSliderValue = clamp(s.key(prevSliderKeyIndex).value, 1, numKeys);
var nextSliderValue = clamp(s.key(nextSliderKeyIndex).value, 1, numKeys);

// find the value of each of the keys 
var prevKeyValue = key(prevSliderValue).value;
var nextKeyValue = key(nextSliderValue).value;

// interpolate between the two accordingly 
linear(time, s.key(prevSliderKeyIndex).time, s.key(nextSliderKeyIndex).time, prevKeyValue, nextKeyValue)