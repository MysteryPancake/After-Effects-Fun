// This is 100% vibe coded AI slop
// The original version I made myself

// JOYSTICK
var STEP = 1000 / 60;
var SPAWN_X = 40, SPAWN_Y = 208;     // feet on top of the ground (row 11 -> y = 32 + 11*16)
var SCREEN_MID = 112, LEFT_PAD = 8;  // try SCREEN_MID = 160 for a more centered feel on a 427 px screen
var VERSION = 6;                     // bump after editing physics or the level

var TILE = 16, TOP = 32, ROWS = 13;
var W = 224;                         // 3584 px BG / 16 = 224 tiles
var HW = 6, HEIGHT = 32;             // big Mario, anchor = bottom-center (16x32 layer, anchor [8, 32])
var SOLID = "GB?PSU";                // G ground, B brick, ? question, P pipe, S hard block, U used block
                                     // H = hidden 1-up block: NOT in SOLID, so Mario passes through it until he bumps it from below
var BREAK_BRICKS = false;            // true: bricks vanish when hit (you'd need to hide the art too)

var START_LIVES = 3, START_TIME = 400;
var COIN_SCORE = 200, BRICK_SCORE = 50;

// ---------- LEVEL 1-1 ----------
function buildLevel() {
	var g = [];
	for (var r = 0; r < ROWS; r++) {
		g.push([]);
		for (var c = 0; c < W; c++) g[r].push(".");
	}
	function put(c, r, ch) { if (r >= 0 && r < ROWS && c >= 0 && c < W) g[r][c] = ch; }
	function row(c0, r, str) {                       // draw a string of tiles; spaces are skipped
		for (var i = 0; i < str.length; i++) if (str.charAt(i) !== " ") put(c0 + i, r, str.charAt(i));
	}
	function pipe(c, h) {
		for (var i = 0; i < h; i++) { put(c, 10 - i, "P"); put(c + 1, 10 - i, "P"); }
	}
	function stack(c, h) { for (var i = 0; i < h; i++) put(c, 10 - i, "S"); }

	// ground (rows 11-12) with pits
	var pits = [69, 70, 86, 87, 88, 153, 154];
	for (var c = 0; c < W; c++) {
		if (pits.indexOf(c) >= 0) continue;
		put(c, 11, "G"); put(c, 12, "G");
	}

	// question / brick blocks (row 7 = low blocks, row 3 = high blocks)
	put(16, 7, "?");
	put(64, 6, "H");                                 // hidden 1-up block (one tile above the low-block row)
	row(20, 7, "B?B?B");
	put(22, 3, "?");
	row(77, 7, "B?B");
	row(80, 3, "BBBBBBBB");
	row(91, 3, "BBB?");
	put(94, 7, "B");
	row(100, 7, "BB");
	put(106, 7, "?"); put(109, 7, "?"); put(112, 7, "?");
	put(109, 3, "?");
	put(118, 7, "B");
	row(121, 3, "BBB");
	row(128, 3, "B??B");
	row(129, 7, "BB");
	row(168, 7, "BB?B");

	// pipes (col, height in tiles)
	pipe(28, 2); pipe(38, 3); pipe(46, 4); pipe(57, 4);
	pipe(163, 2); pipe(179, 2);

	// staircases (col, height)
	var i;
	for (i = 0; i < 4; i++) stack(134 + i, i + 1);   // up
	for (i = 0; i < 4; i++) stack(140 + i, 4 - i);   // down
	for (i = 0; i < 4; i++) stack(148 + i, i + 1);   // up
	stack(152, 4);                                   // extra full-height column before the pit
	for (i = 0; i < 4; i++) stack(155 + i, 4 - i);   // down
	for (i = 0; i < 8; i++) stack(181 + i, i + 1);   // final stairs
	stack(189, 8);

	// flagpole (not solid)
	for (i = 2; i < 10; i++) put(198, i, "F");
	put(198, 10, "S");

	var lines = [];
	for (r = 0; r < ROWS; r++) lines.push(g[r].join(""));
	return lines;
}

// ---------- MARIO ----------
function Mario() {
	this.score = 0; this.coins = 0; this.lives = START_LIVES;
	this.reset();
}

// resets position/physics/timer, but keeps score, coins and lives
Mario.prototype.reset = function () {
	this.ver = VERSION;
	this.last = Date.now();
	this.acc = 0;
	this.x = SPAWN_X; this.y = SPAWN_Y;
	this.vx = 0; this.vy = 0;
	this.camX = 0;
	this.onGround = true; this.prevJump = false;
	this.holdG = 0; this.fallG = 0; this.g = 0;
	this.facing = 1;
	this.time = START_TIME; this.tick = 0;
};

Mario.prototype.addScore = function (n) { this.score += n; };

Mario.prototype.addLife = function () { this.lives++; };

Mario.prototype.addCoin = function () {
	this.coins++;
	this.addScore(COIN_SCORE);
	if (this.coins >= 100) { this.coins = 0; this.lives++; }
};

// lose a life (pit or timeout); game over wipes everything
Mario.prototype.die = function () {
	this.lives--;
	if (this.lives <= 0) {
		this.score = 0; this.coins = 0; this.lives = START_LIVES;
	}
	this.reset();
};

function solid(px, py) {
	var col = Math.floor(px / TILE);
	var row = Math.floor((py - TOP) / TILE);
	if (row < 0 || row >= ROWS) return false;        // above the map or in a pit: open
	if (col < 0) return true;                        // left of level start: wall
	var line = $.level[row];
	if (col >= line.length) return false;
	return SOLID.indexOf(line.charAt(col)) >= 0;
}

Mario.prototype.step = function (dir, run, jump) {
	// --- timer: 1 unit every 24 frames ---
	if (++this.tick >= 24) {
		this.tick = 0;
		if (this.time > 0) this.time--;
	}
	if (this.time <= 0) { this.die(); return; }      // out of time

	var maxV = run ? 2.5625 : 1.5625;
	var accel = run ? 0.0556640625 : 0.037109375;
	var decel = 0.05078125, skid = 0.1015625;

	// --- horizontal ---
	if (dir !== 0) {
		if (this.onGround) this.facing = dir;
		if (this.vx !== 0 && Math.sign(this.vx) !== dir && this.onGround) {
			this.vx += dir * skid;
		} else {
			if (this.vx === 0) this.vx = dir * 0.0742;
			this.vx += dir * accel;
			if (Math.abs(this.vx) > maxV) {
				var over = Math.abs(this.vx) - decel;
				this.vx = Math.sign(this.vx) * Math.max(over, maxV);
			}
		}
	} else if (this.onGround) {
		if (Math.abs(this.vx) <= decel) this.vx = 0;
		else this.vx -= Math.sign(this.vx) * decel;
	}

	// --- jump start (button must be re-pressed) ---
	if (jump && !this.prevJump && this.onGround) {
		var ax = Math.abs(this.vx);
		if (ax < 1.0)         { this.vy = -4; this.holdG = 0.125;     this.fallG = 0.4375; }
		else if (ax < 2.3125) { this.vy = -4; this.holdG = 0.1171875; this.fallG = 0.375;  }
		else                  { this.vy = -5; this.holdG = 0.15625;   this.fallG = 0.5625; }
		this.g = this.holdG;
		this.onGround = false;
	}
	this.prevJump = jump;

	// --- move X, resolve against side tiles ---
	this.x += this.vx;
	if (this.vx !== 0) {
		var d = Math.sign(this.vx), edge = this.x + d * HW;
		if (solid(edge, this.y - 1) || solid(edge, this.y - 12) ||
		    solid(edge, this.y - 22) || solid(edge, this.y - HEIGHT + 2)) {
			var c = Math.floor(edge / TILE);
			this.x = d > 0 ? c * TILE - HW : (c + 1) * TILE + HW;
			this.vx = 0;
		}
	}

	// --- walked off a ledge? ---
	if (this.onGround && !solid(this.x - HW + 1, this.y + 1) && !solid(this.x + HW - 1, this.y + 1)) {
		this.onGround = false;
		this.g = this.fallG = 0.4375;
	}

	// --- move Y, THEN apply gravity (SMB order), then resolve ---
	var prevY = this.y;
	this.y += this.vy;
	if (!this.onGround) {
		if (!jump) this.g = this.fallG;                    // releasing = stronger gravity
		this.vy = Math.min(this.vy + this.g, 4);           // terminal velocity
	}

	if (this.vy >= 0) {
		if (solid(this.x - HW + 1, this.y) || solid(this.x + HW - 1, this.y)) {
			this.y = TOP + Math.floor((this.y - TOP) / TILE) * TILE;   // land on tile top
			this.vy = 0;
			this.onGround = true;
		}
	} else {
		// hidden 1-up block: only reacts when his head comes up into it from below
		var hr = Math.floor((this.y - HEIGHT - TOP) / TILE);
		var hBottom = TOP + (hr + 1) * TILE;
		if (hr >= 0 && hr < ROWS && prevY - HEIGHT >= hBottom) {
			var cols = [Math.floor(this.x / TILE), Math.floor((this.x - HW + 1) / TILE), Math.floor((this.x + HW - 1) / TILE)];
			var hc = -1;
			for (var k = 0; k < cols.length && hc < 0; k++) if ($.level[hr].charAt(cols[k]) === "H") hc = cols[k];
			if (hc >= 0) {
				var hline = $.level[hr];
				$.level[hr] = hline.substr(0, hc) + "U" + hline.substr(hc + 1);   // becomes a used block, now solid
				this.addLife();
			}
		}

		if (solid(this.x - HW + 1, this.y - HEIGHT) || solid(this.x + HW - 1, this.y - HEIGHT)) {
			var r = Math.floor((this.y - HEIGHT - TOP) / TILE);
			this.y = TOP + (r + 1) * TILE + HEIGHT;                    // bonk head
			this.vy = 0;

			// block hit: decided by the tile above his head center
			var bc = Math.floor(this.x / TILE);
			var line = $.level[r];
			var ch = line.charAt(bc);
			if (ch === "?") {
				$.level[r] = line.substr(0, bc) + "U" + line.substr(bc + 1);
				this.addCoin();
			} else if (ch === "B" && BREAK_BRICKS) {
				$.level[r] = line.substr(0, bc) + "." + line.substr(bc + 1);
				this.addScore(BRICK_SCORE);
			}
		}
	}

	if (this.y > TOP + ROWS * TILE + HEIGHT) { this.die(); return; }   // fell in a pit

	// --- camera: forward only, no right-edge clamp ---
	this.camX = Math.max(this.camX, this.x - SCREEN_MID);
	if (this.x < this.camX + LEFT_PAD) {
		this.x = this.camX + LEFT_PAD;
		this.vx = Math.max(this.vx, 0);
	}
};

// ---------- INIT ----------
if ($.mario === undefined || $.mario.ver !== VERSION || $.level === undefined) {
	$.level = buildLevel();
	$.mario = new Mario();
}
var m = $.mario;

// ---------- INPUT: this layer's own position ----------
var HOME_X = thisComp.width / 2;     // horizontal middle of the screen
var HOME_Y = thisComp.height / 2;    // vertical middle of the screen
var dx = value[0] - HOME_X;
var dy = value[1] - HOME_Y;
var dead = thisComp.width * 0.05;
var dir = dx > dead ? 1 : (dx < -dead ? -1 : 0);
var run = Math.abs(dx) > thisComp.width * 0.3;
var jump = dy < -thisComp.height * 0.1;

// ---------- FIXED TIMESTEP (clamped) ----------
var now = Date.now();
var dt = now - m.last;
m.last = now;

if (dt > 100) dt = STEP;                 // long idle: discard it, resume as a single frame
m.acc += Math.min(dt, STEP * 3);         // never bank more than 3 steps of time

var steps = 0;
while (m.acc >= STEP && steps < 3) {     // hard limit per evaluation
	m.acc -= STEP;
	m.step(dir, run, jump);
	steps++;
}
m.acc = Math.min(m.acc, STEP);           // drop any leftover backlog

value;

// TIME
thisComp.layer("Joystick").position;
"TIME\n" + ($.mario ? ("000" + $.mario.time).slice(-3) : "400");

// COINS
thisComp.layer("Joystick").position;
$.mario ? "x" + ("00" + $.mario.coins).slice(-2) : "x00";

// SCORE
thisComp.layer("Joystick").position;
"MARIO\n" + ($.mario ? ("000000" + $.mario.score).slice(-6) : "000000");

// LIVES
thisComp.layer("Joystick").position;
"LIVES\n" + ($.mario ? "x" + $.mario.lives : "x3");

// COURSE

thisComp.layer("Joystick").position;   // dependency: joystick evaluates first
var BASE_X = 1792, BASE_Y = 120;
$.mario ? [BASE_X - $.mario.camX, BASE_Y] : value;
