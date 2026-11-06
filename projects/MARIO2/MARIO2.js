// This is 100% vibe coded AI slop
// The original version I made myself

// JOYSTICK
var STEP = 1000 / 60;
var SPAWN_X = 40, SPAWN_Y = 208;     // feet on top of the ground (row 11 -> y = 32 + 11*16)
var SCREEN_MID = 112, LEFT_PAD = 8;  // try SCREEN_MID = 160 for a more centered feel on a 427 px screen
var VERSION = 12;                     // bump after editing physics or the level

var TILE = 16, TOP = 32, ROWS = 13;
var W = 224;                         // 3584 px BG / 16 = 224 tiles
var HW = 6, HEIGHT = 16;             // small Mario, anchor = bottom-center (16x16 layer, anchor [8, 16])
var SOLID = "GB?PSU";                // G ground, B brick, ? question, P pipe, S hard block, U used block
                                     // H = hidden 1-up block: NOT in SOLID, so Mario passes through it until he bumps it from below
var BREAK_BRICKS = false;            // true: bricks vanish when hit (you'd need to hide the art too)

var START_LIVES = 3, START_TIME = 400;
var COIN_SCORE = 200, BRICK_SCORE = 50;
var START_MOVE = 1;                  // px the joystick must leave its centre to dismiss the start screen (the deadzone does not apply)
var TITLE_TIME = 60;                 // steps the black screen shows after a death (60 = 1 s)
var ANIM_DIST = 10;                  // px Mario travels per walk-cycle frame (faster = quicker steps)
var BUMP = 8;                        // block bump animation length in physics steps (about 0.13 s)

var GHW = 6, GH = 16;                // goomba half-width / height, anchor = bottom-center (16x16 layer, anchor [8, 16])
var GOOMBA_SPEED = 0.5;              // px per step, tune to taste
var GOOMBA_SCORE = 100, SQUISH = 30; // squished goombas stay flat for 30 steps
var GOOMBA_Y = 208;                  // feet on top of the ground
var GOOMBA_COLS = [22, 40, 51, 53, 80, 82, 97, 99, 114, 116, 124, 126, 128, 130, 174, 176];   // tile columns (approximate 1-1 layout)
var ACTIVATE = thisComp.width + 16;  // goombas start walking when this close to the right screen edge

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

// ---------- BLOCK DATA ----------
// one entry per B / ? / H tile, ordered left to right, top to bottom within a column.
// Layer "Block N" in the comp reads entry N-1. Collision still lives in $.level.
function buildBlocks(level) {
	var list = [], idx = {};
	for (var c = 0; c < W; c++) {
		for (var r = 0; r < ROWS; r++) {
			var ch = level[r].charAt(c);
			if ("B?H".indexOf(ch) >= 0) {
				idx[c + "," + r] = list.length;
				list.push({ c: c, r: r, type: ch, used: false, revealed: ch !== "H", gone: false, off: 0, t: 0 });
			}
		}
	}
	return { list: list, idx: idx };
}

// called when Mario's head hits tile (c, r)
function hitBlock(m, c, r) {
	var k = $.blocks.idx[c + "," + r];
	if (k === undefined) return null;
	var b = $.blocks.list[k];
	if (b.gone) return b;
	if (b.type === "?" && !b.used) { b.used = true; m.addCoin(); }
	if (b.t === 0) b.t = BUMP;                       // bump even if already used
	return b;
}

// advance bump animations one physics step
function tickBlocks() {
	var L = $.blocks.list;
	for (var i = 0; i < L.length; i++) {
		var b = L[i];
		if (b.t > 0) { b.t--; b.off = Math.sin(Math.PI * (1 - b.t / BUMP)) * 8; }
		else b.off = 0;
	}
}

// ---------- GOOMBAS ----------
// state: 0 = waiting offscreen, 1 = walking, 2 = squished, 3 = gone
// Layer "Goomba N" in the comp reads entry N-1.
function buildGoombas() {
	var list = [];
	for (var i = 0; i < GOOMBA_COLS.length; i++) {
		list.push({ x: GOOMBA_COLS[i] * TILE + TILE / 2, y: GOOMBA_Y, vx: -GOOMBA_SPEED, vy: 0, state: 0, t: 0, anim: 0 });
	}
	return list;
}

// advance every goomba one physics step
function tickGoombas(m) {
	var L = $.goombas;
	for (var i = 0; i < L.length; i++) {
		var g = L[i];
		if (g.state === 0) {
			if (g.x < m.camX + ACTIVATE) g.state = 1;
			continue;
		}
		if (g.state === 2) {
			if (--g.t <= 0) g.state = 3;
			continue;
		}
		if (g.state !== 1) continue;

		g.anim++;

		// horizontal: turn around at walls
		g.x += g.vx;
		var d = g.vx < 0 ? -1 : 1, edge = g.x + d * GHW;
		if (solid(edge, g.y - 1) || solid(edge, g.y - 8)) {
			var c = Math.floor(edge / TILE);
			g.x = d > 0 ? c * TILE - GHW : (c + 1) * TILE + GHW;
			g.vx = -g.vx;
		}

		// vertical: gravity, land on tiles, walk off ledges
		g.y += g.vy;
		g.vy = Math.min(g.vy + 0.4375, 4);
		if (g.vy >= 0 && (solid(g.x - GHW + 1, g.y) || solid(g.x + GHW - 1, g.y))) {
			g.y = TOP + Math.floor((g.y - TOP) / TILE) * TILE;
			g.vy = 0;
		}

		if (g.y > TOP + ROWS * TILE + GH) g.state = 3;     // fell in a pit
		if (g.x < m.camX - 32) g.state = 3;                 // left behind
	}
}

// ---------- MARIO ----------
function Mario() {
	this.score = 0; this.coins = 0; this.lives = START_LIVES;
	this.reset();
	this.title = 1; this.titleT = 0;                 // black screen until the first input
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
	this.frame = 0; this.animT = 0;
};

// pick the sprite frame: 0 idle, 1-3 walk cycle, 4 skid, 5 jump
Mario.prototype.animate = function (dir) {
	if (!this.onGround) {
		this.frame = 5;
	} else if (dir !== 0 && this.vx !== 0 && Math.sign(this.vx) !== dir) {
		this.frame = 4;                                  // pushing against his momentum
	} else if (Math.abs(this.vx) > 0.01) {
		this.animT += Math.abs(this.vx);                 // cycle speed follows ground speed
		this.frame = 1 + Math.floor(this.animT / ANIM_DIST) % 3;
	} else {
		this.frame = 0; this.animT = 0;
	}
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
	$.level = buildLevel();                          // restore used / broken blocks
	$.blocks = buildBlocks($.level);
	$.goombas = buildGoombas();
	this.reset();
	this.title = 2; this.titleT = TITLE_TIME;        // black screen for a moment, then play resumes
};

// stomp from above = squish + bounce; any other contact = die. returns true if Mario died
Mario.prototype.touchGoombas = function () {
	var L = $.goombas;
	for (var i = 0; i < L.length; i++) {
		var g = L[i];
		if (g.state !== 1) continue;
		if (Math.abs(this.x - g.x) < HW + GHW && this.y > g.y - GH && this.y - HEIGHT < g.y) {
			if (this.vy > 0 && this.y < g.y - 6) {
				g.state = 2; g.t = SQUISH;
				this.addScore(GOOMBA_SCORE);
				this.vy = -4; this.holdG = 0.125; this.fallG = 0.4375; this.g = this.holdG;   // bounce (holding jump = higher)
				this.onGround = false;
			} else {
				this.die();
				return true;
			}
		}
	}
	return false;
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
		if (solid(edge, this.y - 1) || solid(edge, this.y - 8) ||
		    solid(edge, this.y - HEIGHT + 2)) {
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
				var hb = $.blocks.list[$.blocks.idx[hc + "," + hr]];
				if (hb) { hb.revealed = true; hb.used = true; hb.t = BUMP; }
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
				hitBlock(this, bc, r);                       // awards the coin + starts the bump
			} else if (ch === "B") {
				if (BREAK_BRICKS) {
					$.level[r] = line.substr(0, bc) + "." + line.substr(bc + 1);
					var bb = hitBlock(this, bc, r);
					if (bb) bb.gone = true;
					this.addScore(BRICK_SCORE);
				} else {
					hitBlock(this, bc, r);
				}
			} else if (ch === "U") {
				hitBlock(this, bc, r);                       // used blocks still bump
			}
		}
	}

	if (this.y > TOP + ROWS * TILE + HEIGHT) { this.die(); return; }   // fell in a pit
	if (this.touchGoombas()) return;                                   // stomped or killed by a goomba

	// --- camera: forward only, no right-edge clamp ---
	this.camX = Math.max(this.camX, this.x - SCREEN_MID);
	if (this.x < this.camX + LEFT_PAD) {
		this.x = this.camX + LEFT_PAD;
		this.vx = Math.max(this.vx, 0);
	}

	this.animate(dir);
};

// ---------- INIT ----------
if ($.mario === undefined || $.mario.ver !== VERSION || $.level === undefined) {
	$.level = buildLevel();
	$.blocks = buildBlocks($.level);
	$.goombas = buildGoombas();
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

// start screen: ANY joystick movement on even a single evaluation dismisses it. Uses START_MOVE, not the
// walking deadzone, and sits outside the step loop so a frame that banks less than one step can't miss it
if (m.title === 1 && (Math.abs(dx) > START_MOVE || Math.abs(dy) > START_MOVE)) { m.title = 0; m.prevJump = jump; }

var steps = 0;
while (m.acc >= STEP && steps < 3) {     // hard limit per evaluation
	m.acc -= STEP;
	if (m.title === 2) {                 // death screen: timed
		if (--m.titleT <= 0) { m.title = 0; m.prevJump = jump; }
	}
	if (m.title === 0) {                 // game is frozen while the screen shows
		m.step(dir, run, jump);
		tickBlocks();
		tickGoombas(m);
	}
	steps++;
}
m.acc = Math.min(m.acc, STEP);           // drop any leftover backlog

value;

// MARIO
$.mario ? [$.mario.x - $.mario.camX, $.mario.y] : value;

// MARIO TIME REMAP (0 idle, 1-3 walk, 4 skid, 5 jump)
$.mario ? framesToTime($.mario.frame) : 0;

// MARIO SCALE (flips horizontally with facing)
$.mario ? [$.mario.facing * 100, 100] : [100, 100];

// TIME
"TIME\n" + ($.mario ? ("000" + $.mario.time).slice(-3) : "400");

// COINS
$.mario ? "x" + ("00" + $.mario.coins).slice(-2) : "x00";

// SCORE
"MARIO\n" + ($.mario ? ("000000" + $.mario.score).slice(-6) : "000000");

// LIVES
"LIVES\n" + ($.mario ? "x" + $.mario.lives : "x3");

// COURSE
var BASE_X = 1792, BASE_Y = 120;
$.mario ? [BASE_X - $.mario.camX, BASE_Y] : value;

// BLOCK LAYERS: 44 duplicates of the 16x16 BlockArt precomp named "Block 1" ... "Block 44", anchor [8, 8]
// (Block N shows entry N-1 of $.blocks.list; paste each expression onto every block layer)

// BLOCK POSITION
var m = $.mario;
var b = $.blocks ? $.blocks.list[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(m && b) ? [b.c * 16 + 8 - m.camX, 32 + b.r * 16 + 8 - b.off] : value;

// BLOCK TIME REMAP (frame 0 = brick, 1 = ? block, 2 = used block)
var b = $.blocks ? $.blocks.list[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
b ? framesToTime(b.used ? 2 : (b.type === "?" ? 1 : 0)) : 0;

// BLOCK OPACITY (0% until revealed, 0% when broken)
var b = $.blocks ? $.blocks.list[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(b && (!b.revealed || b.gone)) ? 0 : 100;

// GOOMBA LAYERS: 16 duplicates of the 16x16 GoombaArt precomp named "Goomba 1" ... "Goomba 16", anchor [8, 16]
// (Goomba N shows entry N-1 of $.goombas; paste each expression onto every goomba layer)

// GOOMBA POSITION
var m = $.mario;
var g = $.goombas ? $.goombas[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(m && g) ? [g.x - m.camX, g.y] : value;

// GOOMBA TIME REMAP (frames 0 and 1 = walk cycle, 2 = squished)
var g = $.goombas ? $.goombas[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
g ? framesToTime(g.state === 2 ? 2 : Math.floor(g.anim / 10) % 2) : 0;

// GOOMBA OPACITY (0% while waiting offscreen or after they are gone)
var g = $.goombas ? $.goombas[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(g && (g.state === 1 || g.state === 2)) ? 100 : 0;

// TITLE SCREEN: a black solid named "Title Black", ABOVE the gameplay layers but BELOW the HUD text layers

// TITLE BLACK OPACITY
($.mario && $.mario.title === 0) ? 0 : 100;      // only hidden once the game says play has started; undefined = fully opaque