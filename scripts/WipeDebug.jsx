(function() {
	
	var activeItem = app.project.activeItem;
	// Make sure a composition is active
	if ((activeItem == null) || !(activeItem instanceof CompItem)) {
		alert("Please select or open a composition first.");
	} else {
		// Create temporary layer
		var temp = activeItem.layers.addText();
		// Wipe debug object
		temp.text.sourceText.expression = "for (var key in $) delete $[key];";
		// Wait for the viewport to refresh
		$.sleep(100);
		// Remove temporary layer
		temp.remove();
	}

})();