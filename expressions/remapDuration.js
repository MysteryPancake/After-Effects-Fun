// This expression time remaps a layer to a new duration in frames.
// For example when frameCount = 15, the layer takes 15 frames to finish.

var subcomp = comp("YourAnimation"); // Current subcomp being time remapped
var frameCount = effect("Frame Slider")("Slider").value; // Target duration in frames
time * subcomp.duration / framesToTime(frameCount + 1); // Normalize time between 0 and 1, then scale to time duration