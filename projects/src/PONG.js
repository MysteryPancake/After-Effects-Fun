// BALL

const speed = 16;

const encodeNumber = function(num) {
	return num.toString().replace(".", "D").replace("-", "M");
};

const decodeNumber = function(str) {
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

const writeVal = function(x, y, vx, vy, scoreLeft, scoreRight, paddlePos) {
	eval(`var leak_${encodeNumber(x)}_${encodeNumber(y)}_${encodeNumber(vx)}_${encodeNumber(vy)}_${encodeNumber(scoreLeft)}_${encodeNumber(scoreRight)}_${paddlePos};`);
};

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

const arr = Object.keys(this);
const last = arr[arr.length - 1];
if (last.startsWith("leak_")) {
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
	return num.toString().replace(".", "D").replace("-", "M");
};

const decodeNumber = function(str) {
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

const writeVal = function(x, y, vx, vy, scoreLeft, scoreRight, paddlePos) {
	eval(`var leak_${x}_${y}_${vx}_${vy}_${scoreLeft}_${scoreRight}_${encodeNumber(paddlePos)};`);
};

let pos = thisComp.height * 0.5;
const arr = Object.keys(this);
const last = arr[arr.length - 1];
if (last.startsWith("leak_")) {
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
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

let score = 0;
const arr = Object.keys(this);
const last = arr[arr.length - 1];
if (last.startsWith("leak_")) {
	const parts = last.slice(5).split("_");
	score = decodeNumber(parts[4]);
}
score;

// RIGHT SCORE

const decodeNumber = function(str) {
	return parseFloat(str.replace("M", "-").replace("D", "."));
};

let score = 0;
const arr = Object.keys(this);
const last = arr[arr.length - 1];
if (last.startsWith("leak_")) {
	const parts = last.slice(5).split("_");
	score = decodeNumber(parts[5]);
}
score;