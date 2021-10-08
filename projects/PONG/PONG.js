/* This code uses my original variable leaking technique.

EXPLOIT 1: VARIABLE LEAKING

	I discovered variable names aren't properly deleted by After Effects.
	You can test this by running Object.keys(this) in JavaScript.

	Object.keys(this) finds all current variable names, but not values.
	Therefore to store values, I put the value in the name itself.

	For example:
	eval("var leak") means you can find "leak".
	eval("var leak_5") means you can find "leak_5"
	eval("var leak_" + x) means you can find anything you want to store.
	For example, if x was 530, you get "leak_530", then split it into "leak" and "530".

	Using this idea, you can store all kinds of data in the variable name itself.
	For example, a variable might be named "leak_3_5_M40D5_20D7_4_2_49":
	X: 3
	Y: 5
	X velocity: -40.5
	Y velocity: 20.7
	Left score: 4
	Right score: 2
	Paddle Y position: 49

	I added "leak_" to the variable name so I can tell which variables aren't built-in.

	I swapped - and . with M and D, because variable names can't contain certain characters.
	There are many other limits to storing values in names, so you have to be creative.

EXPLOIT 2: THE DEBUG OBJECT

	Later a user named "stib" informed me about the debug object, $.

	$ allows any form of data to be stored, including objects and arrays.
	For example, $.leak = 5 replaces eval("var leak_5").

	Nowadays I use this method, because it's flexible and easy.

EXPLOIT 3: ENVIRONMENT VARIABLES

	Later I discovered ExtendScript has a method for setting environment variables.
	$.setenv(key, value)

	However it only allows strings to be stored, so it's not as useful.

SUMMARY

	There are 3 options for storing global variables:

	1. Variable leaking (JavaScript only)

		// Set value
		var str = "hello_this_is_global";
		eval(`var ${str}`);

		// Get value
		Object.keys(this).pop();

		Capable of storing:
		Strings, excluding certain characters

	2. The debug object (JavaScript and ExtendScript)

		// Set value
		$.str = "hello_this_is_global";

		// Get value
		$.str;

		Capable of storing:
		Any type of data!

	3. Environment variables (ExtendScript only)

		// Set value
		$.setenv("str", "hello_this_is_global");

		// Get value
		$.getenv("str");

		Capable of storing:
		Strings

Author: MysteryPancake */

// BALL

const speed = 16;

const encodeNumber = function(num) {
	// Replace . with D (for decimal) and - with M (for minus)
	return num.toString().replace(".", "D").replace("-", "M");
};

const decodeNumber = function(str) {
	// Reverse the previous function
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

const writeVal = function(x, y, vx, vy, scoreLeft, scoreRight, paddlePos) {
	// Write a global variable with the prefix "leak_".
	// For example, a variable might be named "leak_3_5_M40D5_20D7_4_2_49".
	eval(`var leak_${encodeNumber(x)}_${encodeNumber(y)}_${encodeNumber(vx)}_${encodeNumber(vy)}_${encodeNumber(scoreLeft)}_${encodeNumber(scoreRight)}_${paddlePos};`);
};

const insidePaddle = function(paddle, x, y, midPoint) {
	// Check whether something intersects the bounding box of the paddle
	const midWidth = paddle.width * 0.5;
	const midHeight = paddle.height * 0.5;
	const insideLeft = paddle.position[0] - midWidth - midPoint;
	const insideRight = paddle.position[0] + midWidth + midPoint;
	const insideTop = paddle.position[1] - midHeight - midPoint;
	const insideBottom = paddle.position[1] + midHeight + midPoint;
	if (x > insideLeft && x < insideRight && y > insideTop && y < insideBottom) {
		return [insideRight, insideLeft];
	} else {
		return false;
	}
};

// Read all global variables
const arr = Object.keys(this);
// Find the most recently stored variable
const last = arr[arr.length - 1];

// Only consider variables with our prefix
if (last.startsWith("leak_")) {

	// Split apart variable name to retrieve values
	const parts = last.slice(5).split("_");

	let vx = decodeNumber(parts[2]);
	let vy = decodeNumber(parts[3]);
	let x = decodeNumber(parts[0]) + vx;
	let y = decodeNumber(parts[1]) + vy;
	let scoreLeft = decodeNumber(parts[4]);
	let scoreRight = decodeNumber(parts[5]);
	const midPoint = thisLayer.height * 0.5;

	// PADDLE COLLISION
	const insideRight = insidePaddle(thisComp.layer("Right Paddle"), x, y, midPoint);
	const insideLeft = insidePaddle(thisComp.layer("Left Paddle"), x, y, midPoint);
	if (insideLeft) {
		x = insideLeft[0];
		vx = -vx;
	} else if (insideRight) {
		x = insideRight[1];
		vx = -vx;
	}
	// WALL COLLISIONS
	const bottomWall = thisComp.height - midPoint;
	const rightWall = thisComp.width - midPoint;
	if (x >= rightWall) {
		x = thisComp.width * 0.5;
		y = thisComp.height * 0.5;
		vx = speed;
		vy = random(-speed, speed);
		scoreLeft++;
	} else if (x <= midPoint) {
		x = thisComp.width * 0.5;
		y = thisComp.height * 0.5;
		vx = -speed;
		vy = random(-speed, speed);
		scoreRight++;
	}
	if (y > bottomWall) {
		y = bottomWall;
		vy = -vy;
	} else if (y < midPoint) {
		y = midPoint;
		vy = -vy;
	}
	// FINAL OUTPUT
	writeVal(x, y, vx, vy, scoreLeft, scoreRight, parts[6]);
	[x, y];
} else {
	const original = valueAtTime(0);
	writeVal(original[0], original[1], -speed, random(-speed, speed), 0, 0, thisComp.height * 0.5);
	original;
}

// LEFT PADDLE

[64, value[1]];

// RIGHT PADDLE

const speed = 10;

const encodeNumber = function(num) {
	// Replace . with D (for decimal) and - with M (for minus)
	return num.toString().replace(".", "D").replace("-", "M");
};

const decodeNumber = function(str) {
	// Reverse the previous function
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

const writeVal = function(x, y, vx, vy, scoreLeft, scoreRight, paddlePos) {
	// Write a global variable with the prefix "leak_".
	// For example, a variable might be named "leak_3_5_M40D5_20D7_4_2_49".
	eval(`var leak_${x}_${y}_${vx}_${vy}_${scoreLeft}_${scoreRight}_${encodeNumber(paddlePos)};`);
};

let pos = thisComp.height * 0.5;

// Read all global variables
const arr = Object.keys(this);
// Find the most recently stored variable
const last = arr[arr.length - 1];

// Only consider variables with our prefix
if (last.startsWith("leak_")) {

	// Split apart variable name to retrieve values
	const parts = last.slice(5).split("_");

	pos = decodeNumber(parts[6]);
	const ballY = decodeNumber(parts[1]);

	if (pos < ballY) {
		pos += speed;
		if (pos > ballY) {
			pos = ballY;
		}
	} else {
		pos -= speed;
		if (pos < ballY) {
			pos = ballY;
		}
	}
	writeVal(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], pos);
}
[thisComp.width - 64, pos];

// LEFT SCORE

const decodeNumber = function(str) {
	// Replace M with - and D with . to retrieve the original number
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

let score = 0;

// Read all global variables
const arr = Object.keys(this);
// Find the most recently stored variable
const last = arr[arr.length - 1];

// Only consider variables with our prefix
if (last.startsWith("leak_")) {
	// Split apart variable name to retrieve values
	const parts = last.slice(5).split("_");
	score = decodeNumber(parts[4]);
}
score;

// RIGHT SCORE

const decodeNumber = function(str) {
	// Replace M with - and D with . to retrieve the original number
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

let score = 0;

// Read all global variables
const arr = Object.keys(this);
// Find the most recently stored variable
const last = arr[arr.length - 1];

// Only consider variables with our prefix
if (last.startsWith("leak_")) {
	// Split apart variable name to retrieve values
	const parts = last.slice(5).split("_");
	score = decodeNumber(parts[5]);
}
score;