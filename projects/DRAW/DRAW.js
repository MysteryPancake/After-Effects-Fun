// ON PEN POSITION

if (typeof $.globalVar !== "undefined") {
	$.globalVar.push(value)
} else {
	$.globalVar = [value];
}
value;

// ON PATH

if (typeof $.globalVar !== "undefined") {
	createPath($.globalVar, [], [], false);
} else {
	value;
}