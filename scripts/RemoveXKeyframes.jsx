// Written for 1412 on the /r/AfterEffects Discord

(function() {

	var comp = app.project.activeItem;

	// Make sure a composition is active
	if (comp !== null && comp instanceof CompItem) {

		// Get the selected layers in this composition
		var layers = comp.selectedLayers;

		for (var i = 0; i < layers.length; i++) {

			// Separate the position coordinates if not already separate
			layers[i].transform.position.dimensionsSeparated = true;

			// Get the X position, getSeparationFollower(1) gets the Y position
			var posX = layers[i].transform.position.getSeparationFollower(0);

			// Remove all keyframes
			while (posX.numKeys > 0) {
				posX.removeKey(1);
			}
		}
	}

})();