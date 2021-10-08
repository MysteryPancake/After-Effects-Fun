// This moves in a random straight-line direction

// 5% chance of changing direction
if (!$.direction || Math.random() > 0.95) {
	$.direction = [Math.floor(Math.random() * 3 - 1), Math.floor(Math.random() * 3 - 1)];
}

// Reset origin at start of video
if (!$.origin || time === 0) {
	$.origin = value;
}

let speed = 10;
$.origin += $.direction * speed;