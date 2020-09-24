// ON PEN POSITION

const encodeNumber = function(num) {
	return num.toString().replace(".", "D").replace("-", "N");
}
eval(`var leak_${encodeNumber(value[0])}_${encodeNumber(value[1])} = true`);
value;

// ON PATH

const decodeNumber = function(str) {
	return parseFloat(str.replace("N", "-").replace("D", "."));
}
let result = [];
const arr = Object.keys(this);
for (let i = 0; i < arr.length; i++) {
	if (arr[i].startsWith("leak_")) {
		const parts = arr[i].slice(5).split("_");
		result.push([decodeNumber(parts[0]), decodeNumber(parts[1])]);
	}
}
if (result.length) {
	createPath(result, [], [], false);
} else {
	value;
}