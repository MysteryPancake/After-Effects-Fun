const path = thisComp.layer("Shape Layer 1").content("Ellipse 1").content("Path 1").path;
const rotation = effect("Rotation")("Angle");
const pointCount = effect("Number of Points")("Slider");

const points = [];
for (let i = 0; i < pointCount; i++) {
	const offset = (i / pointCount) - (rotation / 360);
	points.push(path.pointOnPath(((offset % 1) + 1) % 1)); // Negative modulo bug
}
createPath(points);