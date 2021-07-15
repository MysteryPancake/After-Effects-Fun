// Change this to any parameter you wish to track
var volume = thisComp.layer("Audio Amplitude").effect("Both Channels")("Slider");

// Accumulate all values from 0 seconds to the current time
var accum = 0;
for (var t = 0; t < time; t += thisComp.frameDuration) {
    accum += volume.valueAtTime(t);
}
accum;