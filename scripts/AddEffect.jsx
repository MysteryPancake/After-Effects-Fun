(function() {

	var currentComp = app.project.activeItem;

	// Make sure a composition is active
	if (currentComp != null && currentComp instanceof CompItem) {

		// Get the selected layers in this composition
		var selectedLayers = currentComp.selectedLayers;

		for (var i = 0; i < selectedLayers.length; i++) {

			// Get the effects list of this layer
			var effects = selectedLayers[i].property("ADBE Effect Parade");

			// Add Fractal Noise
			effects.addProperty("ADBE Fractal Noise");
		}
	}

})();