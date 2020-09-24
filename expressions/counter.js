temp = effect("Number")("Slider");
a = temp.value;
b = temp.valueAtTime(time-thisComp.frameDuration);
[0,(b-a)*((thisComp.height*0.5)-(time*10000)%thisComp.height)];
