(function() {
	
	// Make sure a composition is active
	var comp = app.project.activeItem;
	
	if (comp !== null && comp instanceof CompItem) {
		// Create temporary layer
		var temp = comp.layers.addText();
		// Wipe debug object
		temp.text.sourceText.expression = "for (var key in $) delete $[key];";
		// Hope the viewport refreshes (hacky)
		$.sleep(100);
		// Remove temporary layer
		temp.remove();
	} else {
		alert("Please select or open a composition first.");
	}

})();