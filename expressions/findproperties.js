// Good script for finding secret properties in After Effects
// From https://helpx.adobe.com/au/after-effects/using/legacy-and-extend-script-engine.html
let obj = thisProperty; // Replace "thisProperty" with a property-link to your desired property
let props = [];
do {
	Object.getOwnPropertyNames(obj).forEach(prop => {
		if (props.indexOf(prop) === -1) {
			props.push(prop);
		}
	});
} while (obj = Object.getPrototypeOf(obj));
props.join("\n"); // Returns an array of strings listing the properties and methods available
