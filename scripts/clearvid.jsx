(function() {

	function convex(points, pointLookup) {
		var verts = [];
		for (var i = 0; i < points.length; i++) {
			var x = points[i][0];
			var y = points[i][1];
			if (pointLookup[(x + 1) + ", " + y] && pointLookup[(x - 1) + ", " + y] && pointLookup[x + ", " + (y + 1)] && pointLookup[x + ", " + (y - 1)]) continue;
			verts.push(points[i]);
		}
		verts.sort(function(a, b) {
			return a[1] - b[1]
		});
		var centerY = (verts[0][1] + verts[verts.length - 1][1]) / 2;
		verts.sort(function(a, b) {
			return b[0] - a[0]
		});
		var centerX = (verts[0][0] + verts[verts.length - 1][0]) / 2;
		var center = { x: centerX, y: centerY };
		verts.sort(function(a, b) {
			return Math.atan2(a[1] - center.y, a[0] - center.x) - Math.atan2(b[1] - center.y, b[0] - center.x);
		});
		return verts;
	}

	function parse(txt, layer, comp) {
		//var roto = layer.property("Effects").addProperty("Roto Brush & Refine Edge");
		var mask = layer.property("Masks").addProperty("Mask");
		var path = mask.property("Mask Path");
		var lines = txt.split("\n");
		while (lines.length > 0) {
			var line = lines.shift();
			if (line.indexOf("frame: ") !== -1) {
				var frame = parseInt(line.split(": ").pop());
				if (!isNaN(frame)) {
					lines.shift();
					var points = [];
					var pointLookup = {};
					var coords = lines.shift().split(",");
					for (var i = 0; i < coords.length; i += 2) {
						var y = parseInt(coords[i]);
						var x = parseInt(coords[i + 1]);
						if (!isNaN(x) && !isNaN(y)) {
							points.push([x, y]);
							pointLookup[x + ", " + y] = true;
						}
					}
					var maskShape = new Shape();
					maskShape.vertices = convex(points, pointLookup);
					maskShape.closed = true;
					path.setValueAtTime(frame * comp.frameDuration, maskShape);
				}
			}
		}
	}
	
	function importMask() {
		var activeItem = app.project.activeItem;
		if ((activeItem == null) || !(activeItem instanceof CompItem)) {
			alert("Please select a video in a composition first.");
		} else {
			var selectedLayers = activeItem.selectedLayers;
			if (activeItem.selectedLayers.length === 0) {
				alert("Please select a video in the composition first.");
			} else {
				var layer = selectedLayers[0];
				if (layer instanceof AVLayer) {
					var textFile = File.openDialog("Import Clearvid Mask");
					if (!textFile) return;
					if (textFile.open("r")) {
						var extension = textFile.name.split(".").pop();
						if (extension === "txt") {
							parse(textFile.read(), layer, activeItem);
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
		}
	}

	importMask();
})();