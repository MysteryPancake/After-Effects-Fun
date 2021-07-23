(function() {

	var comp = app.project.activeItem;

	// Make sure a composition is active
	if (comp !== null && comp instanceof CompItem) {

		// Get the selected layers in this composition
		var selectedLayers = comp.selectedLayers;

		for (var i = 0; i < selectedLayers.length; i++) {

			// Get the effects list of this layer
			var effects = selectedLayers[i].property("ADBE Effect Parade");

			// Add Fractal Noise
			effects.addProperty("ADBE Fractal Noise");
		}
	} else {
		alert("Please select or open a composition first.");
	}

})();