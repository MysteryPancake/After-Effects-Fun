// Inspired by crust's issue on the /r/AfterEffects Discord
// Creates a path around another, like decimating or approximating the path

var path = thisComp.layer("Shape Layer 1").content("Ellipse 1").content("Path 1").path;
var rotation = effect("Rotation")("Angle");
var pointCount = effect("Number of Points")("Slider");

var points = [];
for (var i = 0; i < pointCount; i++) {
	var offset = (i / pointCount) - (rotation / 360);
	points.push(path.pointOnPath(((offset % 1) + 1) % 1)); // Negative modulo bug
}
createPath(points);
