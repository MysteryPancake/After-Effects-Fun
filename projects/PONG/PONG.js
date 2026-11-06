/* This code uses the global debug object technique. I also added delta time and an FPS counter for time consistent gameplay.

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

const speed = 6;
const maxDt = 0.1;
const refFrame = 1 / 60;
const getTime = function() { return Date.now() / 1000; };
const insidePaddle = function(paddle, x, y, midPoint) {
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
if ($.pong) {
	const state = $.pong;
	let vx = state.vx;
	let vy = state.vy;
	const now = getTime();
	let dt = now - state.ballTime;
	if (!(dt > 0 && dt <= maxDt)) dt = refFrame;
	const step = dt / refFrame;
	let x = state.x + vx * step;
	let y = state.y + vy * step;
	let scoreLeft = state.scoreLeft;
	let scoreRight = state.scoreRight;
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
	state.x = x;
	state.y = y;
	state.vx = vx;
	state.vy = vy;
	state.scoreLeft = scoreLeft;
	state.scoreRight = scoreRight;
	state.ballTime = now;
	[x, y];
} else {
	const original = valueAtTime(0);
	$.pong = {
		x: original[0],
		y: original[1],
		vx: -speed,
		vy: random(-speed, speed),
		scoreLeft: 0,
		scoreRight: 0,
		paddlePos: thisComp.height * 0.5,
		ballTime: getTime(),
		paddleTime: 0
	};
	original;
}

// LEFT PADDLE

[64, value[1]];

// RIGHT PADDLE

const speed = 10;
const maxDt = 0.1;
const refFrame = 1 / 60;
const getTime = function() { return Date.now() / 1000; };
let pos = thisComp.height * 0.5;
if ($.pong) {
	const state = $.pong;
	const now = getTime();
	let dt = now - state.paddleTime;
	if (!(dt > 0 && dt <= maxDt)) dt = refFrame;
	const move = speed * (dt / refFrame);
	pos = state.paddlePos;
	const ballY = state.y;
	if (pos < ballY) {
		pos += move;
		if (pos > ballY) {
			pos = ballY;
		}
	} else {
		pos -= move;
		if (pos < ballY) {
			pos = ballY;
		}
	}
	state.paddlePos = pos;
	state.paddleTime = now;
}
[thisComp.width - 64, pos];

// LEFT SCORE

let score = 0;
if ($.pong) {
	score = $.pong.scoreLeft;
}
score;

// RIGHT SCORE

let score = 0;
if ($.pong) {
	score = $.pong.scoreRight;
}
score;

// FPS

const getTime = function() { return Date.now() / 1000; };
const now = getTime();
const interval = 0.5;
let fps = 0;
if ($.pong) {
	if ($.pong.fpsTime) {
		$.pong.fpsFrames++;
		const elapsed = now - $.pong.fpsTime;
		if (elapsed >= interval) {
			$.pong.fpsValue = $.pong.fpsFrames / elapsed;
			$.pong.fpsFrames = 0;
			$.pong.fpsTime = now;
		}
	} else {
		$.pong.fpsTime = now;
		$.pong.fpsFrames = 0;
		$.pong.fpsValue = 0;
	}
	fps = $.pong.fpsValue;
}
`${Math.round(fps)} FPS`;
