offset = 0.2; // Between 0 and 1
cyclesPerSecond = 1; // 1 cycle every second

myShape = thisComp.layer("Shape Layer 1").content("Shape 1").content("Path 1").path;
myShape.pointOnPath((offset + (time * cyclesPerSecond)) % 1);