(function(thisObj) {

	function ButtonClick() {

		// activeItem is usually the composition open at the moment
		var activeItem = app.project.activeItem;

		// Make sure it is a composition
		if ((activeItem == null) || !(activeItem instanceof CompItem)) {
			alert("Please select or open a composition first.");
		} else {
			// Get the selected layers in the composition (this is an array)
			var selectedLayers = activeItem.selectedLayers;

			// No selected layers
			if (activeItem.selectedLayers.length == 0) {
				alert("Please select at least one layer in the active comp first.");
			} else {

				// PART 1: ADDING MAIN CONTROLLER AND STUFF

				// Get all layers in current comp
				var allLayers = activeItem.layers;
				// Check if null controller exists
				var controllerExists = false;

				// allLayers starts at 1 because it's a LayerCollection rather than an array
				for (var i = 1; i <= allLayers.length; i++) {
					var compLayer = allLayers[i];

					// The controller probably exists if there is a null called "MAIN CONTROLLER"
					if (compLayer.nullLayer && compLayer.name == "MAIN CONTROLLER") {
						controllerExists = true;
					}
				}
				if (controllerExists) {
					alert("Controller already exists! No controller created.");
				} else {
					// Create null controller
					var controller = activeItem.layers.addNull();
					controller.source.name = "MAIN CONTROLLER";

					// Add a couple of sliders to the controller
					var controllerEffects = controller.property("ADBE Effect Parade");

					var slider1 = controllerEffects.addProperty("ADBE Slider Control");
					slider1.name = "NOISE COMPLEXITY";

					var slider2 = controllerEffects.addProperty("ADBE Slider Control");
					slider2.name = "NOISE EVOLUTION";

					var slider3 = controllerEffects.addProperty("ADBE Slider Control");
					slider3.name = "NOISE ROTATION";
				}

				// PART 2: ADDING EFFECTS AND EXPRESSIONS AND STUFF

				// Go through each of the selected layers
				for (var i = 0; i < selectedLayers.length; i++) {
					var curLayer = selectedLayers[i];

					// Get the effects list on this layer
					var effectsProperty = curLayer.property("ADBE Effect Parade");
					// Add a slider to the effects list
					var slider = effectsProperty.addProperty("ADBE Slider Control");
					// Add an effect to the effects list
					var noise = effectsProperty.addProperty("Fractal Noise");

					// Get the brightness property of the noise
					var noiseContrast = noise.property("Brightness");
					// Link the brightness of the noise to the slider control
					noiseContrast.expression = "effect(\"Slider Control\")(\"Slider\")";

					// Link some random stuff to the main controller, why not
					var noiseComplexity = noise.property("Complexity");
					noiseComplexity.expression = "thisComp.layer(\"MAIN CONTROLLER\").effect(\"NOISE COMPLEXITY\")(\"Slider\")";

					var noiseEvolution = noise.property("Evolution");
					noiseEvolution.expression = "thisComp.layer(\"MAIN CONTROLLER\").effect(\"NOISE EVOLUTION\")(\"Slider\")";

					var noiseRotation = noise.property("Rotation");
					noiseRotation.expression = "thisComp.layer(\"MAIN CONTROLLER\").effect(\"NOISE ROTATION\")(\"Slider\")";
				}
			}
		}

	}

	function buildUI(thisObj) {

		var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Window Title", undefined, { resizeable: true });

		var mainButton = myPanel.add("button", undefined, "CLICK ME");
		mainButton.onClick = ButtonClick;

		myPanel.onResizing = myPanel.onResize = function() {
			this.layout.resize();
		};
		if (myPanel instanceof Window) {
			myPanel.center();
			myPanel.show();
		} else {
			myPanel.layout.layout(true);
			myPanel.layout.resize();
		}

	}

	buildUI(thisObj);

})(this);