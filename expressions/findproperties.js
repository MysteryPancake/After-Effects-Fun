// Good script for finding secret properties in After Effects
// Written by Adobe https://helpx.adobe.com/au/after-effects/using/legacy-and-extend-script-engine.html
let obj = thisProperty;
let props = [];
do {
	Object.getOwnPropertyNames(obj).forEach(prop => {
		if (props.indexOf(prop) === -1) {
			props.push(prop);
		}
	});
} while (obj = Object.getPrototypeOf(obj));
props.join("\n");