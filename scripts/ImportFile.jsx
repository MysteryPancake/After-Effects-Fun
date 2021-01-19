// Simple example of importing a file with a dialog

var file = File.openDialog("Popup Title");

if (file && file.open("r")) {
	// Read file
	var contents = file.read();
	// Print contents
	alert(contents);
	// Close file
	file.close();
}