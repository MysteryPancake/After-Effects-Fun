// Written in collaboration with AECartographer on the /r/AfterEffects Discord

// This approximates the length of a bezier path by dividing it into line segments
// Idea stolen from https://youtu.be/aVwxzDHniEw?t=857

var pathToTrace = thisComp.layer("Shape Layer 1").content("Shape 1").content("Path 1").path; 

var totalLength = 0;
var iterations = 100;
for (var i = 0; i < iterations; i++) {
	var p1 = pathToTrace.pointOnPath(i / iterations);
	var p2 = pathToTrace.pointOnPath((i + 1) / iterations);
	totalLength += length(p1, p2);
}
totalLength;