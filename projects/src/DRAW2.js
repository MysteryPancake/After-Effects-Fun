// ON PEN POSITION

if ($.globalVar) {
	$.globalVar.push(value)
} else {
	$.globalVar = [value];
}
value;

// ON PATH

if ($.globalVar) {
	createPath($.globalVar, [], [], false);
} else {
	value;
}