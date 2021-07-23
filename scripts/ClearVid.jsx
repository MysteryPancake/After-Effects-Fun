// This script imports pixel data from the now defunct rotoscoping website Clearvid.io.
// The data was a bunch of coordinates definining the exact pixels of the video which should be visible.
// The script turns this pixel-based data into a convex mask using some math I stole from Stack Overflow.
// The convex process doesn't always work, but it worked enough that it was functional most of the time.

(function() {

	function convex(points, pointLookup) {
		var verts = [];
		for (var i = 0; i < points.length; i++) {
			var x = points[i][0];
			var y = points[i][1];
			// If the pixel is surrounded by other pixels, don't bother adding it to the mask
			if (pointLookup[(x + 1) + ", " + y] && pointLookup[(x - 1) + ", " + y] && pointLookup[x + ", " + (y + 1)] && pointLookup[x + ", " + (y - 1)]) continue;
			// Otherwise it's likely to be an edge pixel which defines the edge of the mask
			verts.push(points[i]);
		}
		// Sort the pixels vertically
		verts.sort(function(a, b) {
			return a[1] - b[1]
		});
		// Get the center of the pixels along the Y axis by averaging the topmost and bottommost points
		var centerY = (verts[0][1] + verts[verts.length - 1][1]) / 2;
		// Sort the pixels horizontally
		verts.sort(function(a, b) {
			return b[0] - a[0]
		});
		// Get the center of the pixels along the X axis by averaging the leftmost and rightmost points
		var centerX = (verts[0][0] + verts[verts.length - 1][0]) / 2;
		// Sort the vertices around the centerpoint so they end up clockwise or something like that
		// This only works providing the points don't have any tunnels or concave kind of stuff
		verts.sort(function(a, b) {
			// This was definitely stolen from Stack Overflow, has something to do with polar coordinates
			return Math.atan2(a[1] - centerY, a[0] - centerX) - Math.atan2(b[1] - centerY, b[0] - centerX);
		});
		// Hopefully this forms a convex mask
		return verts;
	}

	function parse(txt, layer, comp) {
		// It seems the coordinates can't be imported as rotobrush data, which is a shame
		// var roto = layer.property("Effects").addProperty("Roto Brush & Refine Edge");
		var mask = layer.property("Masks").addProperty("Mask");
		var path = mask.property("Mask Path");
		var lines = txt.split("\n");
		while (lines.length > 0) {
			var line = lines.shift();
			// The data numbers each frame followed by the pixel coordinates visible on that frame
			if (line.indexOf("frame: ") !== -1) {
				// Get the frame number, e.g. frame: 123 -> 123
				var frame = parseInt(line.split(": ").pop());
				// Make sure it's a valid number
				if (!isNaN(frame)) {
					lines.shift();
					var points = [];
					var pointLookup = {};
					// Split the pixel coordinates by commas
					var coords = lines.shift().split(",");
					for (var i = 0; i < coords.length; i += 2) {
						// First coordinate is Y for some reason
						var y = parseInt(coords[i]);
						// Second coordinate is X
						var x = parseInt(coords[i + 1]);
						// Make sure both coordinates are valid numbers
						if (!isNaN(x) && !isNaN(y)) {
							// Add them to the points array
							points.push([x, y]);
							// Add them side by side to look them up easily layer
							pointLookup[x + ", " + y] = true;
						}
					}
					// Add the mask
					var maskShape = new Shape();
					// Try to make it convex
					maskShape.vertices = convex(points, pointLookup);
					maskShape.closed = true;
					// Add a new keyframe for each set of coordinates
					path.setValueAtTime(frame * comp.frameDuration, maskShape);
				}
			}
		}
	}
	
	function importMask() {
		var comp = app.project.activeItem;
		if (comp !== null && comp instanceof CompItem) {
			var selectedLayers = comp.selectedLayers;
			if (comp.selectedLayers.length === 0) {
				alert("Please select a video in the composition first.");
			} else {
				// Require a video layer to be selected to add the mask to
				var layer = selectedLayers[0];
				if (layer instanceof AVLayer) {
					var textFile = File.openDialog("Import Clearvid Mask");
					if (!textFile) return;
					if (textFile.open("r")) {
						var extension = textFile.name.split(".").pop();
						if (extension === "txt") {
							parse(textFile.read(), layer, comp);
						} else {
							alert("Not a Clearvid Mask!\nPlease open .txt files, not ." + extension + " files!");
							importMask();
						}
						textFile.close();
					} else {
						alert("Couldn't read the file!");
					}
				} else {
					alert("Please select a video layer.");
				}
			}
		} else {
			alert("Please select a video in a composition first.");
		}
	}

	importMask();
})();