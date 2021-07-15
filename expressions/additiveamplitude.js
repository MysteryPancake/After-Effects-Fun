var volume = thisComp.layer("Audio Amplitude").effect("Both Channels")("Slider");

var accum = 0;
for (var t = 0; t < time; t += thisComp.frameDuration) {
    accum += volume.valueAtTime(t);
}

accum;