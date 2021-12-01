var subcomp = comp("YourAnimation"); // Current subcomp being time remapped
var frameCount = effect("Frame Slider")("Slider").value; // Target duration in frames
time * subcomp.duration / framesToTime(frameCount + 1); // Normalize time between 0 and 1, then scale to time duration