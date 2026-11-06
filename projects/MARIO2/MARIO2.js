// This is vibe coded AI slop using the $ debug object method.
// The original version I made myself :)

// JOYSTICK
var STEP = 1000 / 60;
var SPAWN_X = 40, SPAWN_Y = 208;     // feet on top of the ground (row 11 -> y = 32 + 11*16)
var MIDWAY_COL = 96;                 // tile column of the midway checkpoint: crossing it makes deaths respawn here
var RESPAWN_SAFE = 96;               // goombas within this many px ahead of the respawn point are removed, so you never respawn on top of one
var SCREEN_MID = 112, LEFT_PAD = 8;  // try SCREEN_MID = 160 for a more centered feel on a 427 px screen
var VERSION = 25;                     // bump after editing physics or the level

var TILE = 16, TOP = 32, ROWS = 13;
var W = 224;                         // 3584 px BG / 16 = 224 tiles
var HW = 6, HEIGHT = 16;             // small Mario, anchor = bottom-center (16x16 layer, anchor [8, 16])
var SOLID = "GB?PSU";                // G ground, B brick, ? question, P pipe, S hard block, U used block
                                     // H = hidden 1-up block: NOT in SOLID, so Mario passes through it until he bumps it from below
var BREAK_BRICKS = false;            // true: bricks vanish when hit (you'd need to hide the art too)

var START_LIVES = 3, START_TIME = 400;
var LOW_TIME = 100;                  // the TIME text flashes red once the timer drops below this
var COIN_SCORE = 200, BRICK_SCORE = 50;
var DEATH_FREEZE = 30, DEATH_VY = -5, DEATH_G = 0.25;   // death animation: pause (steps), hop speed, gravity
var FLICK_DELTA = 8;                 // px the joystick must move UP in a single evaluation to count as a flick (lower = easier)
var FLICK_HOLD = 14;                 // steps a flick counts as "jump held" (full-height hop even if you let go right away)
var JUMP_BUFFER = 6;                 // steps a flick is remembered, so one just before landing still jumps
var HOLD_UP = 0.1;                   // keeping the joystick this far above centre (fraction of height) holds the jump for a higher hop
var HOLD_DOWN = 0.1;                 // joystick this far below centre (fraction of height) = jump released, heavier gravity
var START_MOVE = 1;                  // px the joystick must leave its centre to dismiss the start screen (the deadzone does not apply)
var TITLE_TIME = 60;                 // steps the black screen shows after a death (60 = 1 s)
var ANIM_DIST = 10;                  // px Mario travels per walk-cycle frame (faster = quicker steps)
var POPUP_POOL = 3;                  // text layers "Popup 1" ... "Popup 3"; if all are busy the oldest popup is recycled
var POPUP_TIME = 45;                 // steps a popup lives (45 = 0.75 s)
var POPUP_RISE = 40;                 // px a popup floats upward over its life
// ---------- ENDING (flagpole -> slide -> castle walk -> time bonus -> restart) ----------
var POLE_COL = 198;                  // tile column of the F tiles (must match buildLevel)
var POLE_X = POLE_COL * TILE + TILE / 2;   // x of the pole itself
var POLE_BASE = TOP + 10 * TILE;     // y of the top of the base block = where Mario's feet end up
var GRAB_REACH = 8;                  // Mario grabs when his right edge is this close to the pole (8 = left edge of the tile, so touching the base block counts too)
var SLIDE_OFF = 7;                   // px Mario's centre sits left (sliding) / right (waiting) of the pole
var FLAG_SLIDE = 2;                  // px per step Mario and the flag slide down
var FLAG_SCORES = [100, 400, 800, 2000, 5000];   // grab height score, lowest to highest
var FLAG_ZONES = [16, 48, 80, 112];  // px above the base block where each next score starts (pole is 128 px tall)
var FLAG_X = POLE_X - 8;             // centre of the 16x16 flag layer (it sits just left of the pole)
var FLAG_Y0 = TOP + 2 * TILE + 8;    // flag centre y when raised  (match this to where the flag sits in your BG art)
var FLAG_Y1 = POLE_BASE - 8;         // flag centre y when lowered
var END_PAUSE = 20;                  // steps Mario waits on the far side of the pole before walking
var END_WALK = 1.5;                  // px per step walking to the castle
var CASTLE_X = 204 * TILE + TILE / 2;   // x of the castle door: Mario vanishes here (move to match your art)
var CASTLE_WAIT = 30;                // steps before the time bonus starts counting
var TIME_BONUS = 50, BONUS_RATE = 2; // points per leftover time unit, units converted per step
var END_HOLD = 90;                   // steps to hold after the bonus, then cut to black (like a death) and restart
var MAX_CAM = Math.max(0, W * TILE - thisComp.width);   // camera never scrolls past the end of the BG
var BUMP = 8;                        // block bump animation length in physics steps (about 0.13 s)

var GHW = 6, GH = 16;                // goomba half-width / height (hitbox only; sprite layers all use anchor [8, 8])
var GOOMBA_SPEED = 0.5;              // px per step, tune to taste
var GOOMBA_SCORE = 100, SQUISH = 30;
var STOMP_SCORES = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];   // chained stomps without touching the ground; past the end = 1-UP
var KNOCK_VX = 0.5, KNOCK_VY = -3;   // goomba knocked off a bumped block: sideways speed, upward pop // squished goombas stay flat for 30 steps
var GOOMBA_Y = 208;                  // feet on top of the ground
var GOOMBA_COLS = [22, 40, 51, 53, 80, 82, 97, 99, 114, 116, 124, 126, 128, 130, 174, 176];   // tile columns (approximate 1-1 layout)
var ACTIVATE = thisComp.width + 16;
var ENTITY_POOL = 26;                // sprite layers needed: at most 19 blocks + ~4-6 goombas are ever on screen at once in this level (checked)  // goombas start walking when this close to the right screen edge

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

// ---------- ENTITIES (blocks + goombas) ----------
// One class for everything that gets a sprite. Position is always the bottom-centre of the 16x16 sprite.
//   kind  BLOCK, GOOMBA or FLAG (the flagpole flag: y is the flag's bottom, it slides down during the ending)
//   state BLOCK: unused. GOOMBA: 0 = waiting offscreen, 1 = walking, 2 = squished, 3 = gone,
//         4 = knocked off a block (flips and falls)
//   t     BLOCK: bump timer.  GOOMBA: squish timer
//   off   upward bump offset in px (blocks only, 0 otherwise)
//   frame / flip   what the sprite layer should show, filled in by refresh()
var BLOCK = 0, GOOMBA = 1, FLAG = 2;
// frames of the single sprite precomp (comp frame numbers, 0-based)
var F_BRICK = 0, F_QUESTION = 1, F_USED = 2, F_GOOMBA = 3 /* 3 and 4 = walk cycle */, F_SQUISH = 5, F_FLAG = 6;

function Entity(kind, x, y) {
	this.kind = kind;
	this.x = x; this.y = y;
	this.vx = 0; this.vy = 0;
	this.state = 1; this.t = 0; this.anim = 0; this.off = 0;
	this.frame = 0; this.flip = false;
	// block-only fields
	this.c = 0; this.r = 0; this.type = ""; this.used = false; this.revealed = true; this.gone = false;
}

Entity.makeBlock = function (c, r, type) {
	var e = new Entity(BLOCK, c * TILE + TILE / 2, TOP + (r + 1) * TILE);
	e.c = c; e.r = r; e.type = type;
	e.revealed = type !== "H";                       // hidden blocks start invisible
	return e;
};

Entity.makeFlag = function () {
	return new Entity(FLAG, FLAG_X, FLAG_Y0 + 8);
};

Entity.makeGoomba = function (col) {
	var e = new Entity(GOOMBA, col * TILE + TILE / 2, GOOMBA_Y);
	e.vx = -GOOMBA_SPEED; e.state = 0;
	return e;
};

// is this entity drawn at all right now?
Entity.prototype.shown = function () {
	if (this.kind === FLAG) return true;
	if (this.kind === BLOCK) return this.revealed && !this.gone;
	return this.state === 1 || this.state === 2 || this.state === 4;
};

// pick the sprite frame and flip for the layer that is showing this entity
Entity.prototype.refresh = function () {
	if (this.kind === FLAG) {
		this.frame = F_FLAG; this.flip = false;
	} else if (this.kind === BLOCK) {
		this.frame = this.used ? F_USED : (this.type === "?" ? F_QUESTION : F_BRICK);
		this.flip = false;
	} else {
		this.frame = this.state === 2 ? F_SQUISH : F_GOOMBA + Math.floor(this.anim / 10) % 2;
		this.flip = this.state === 4;
	}
};

// advance one physics step
Entity.prototype.tick = function (m) {
	if (this.kind === BLOCK) this.tickBlock(); else if (this.kind === GOOMBA) this.tickGoomba(m);
};

// bump animation
Entity.prototype.tickBlock = function () {
	if (this.t > 0) { this.t--; this.off = Math.sin(Math.PI * (1 - this.t / BUMP)) * 8; }
	else this.off = 0;
};

Entity.prototype.tickGoomba = function (m) {
	var g = this;
	if (g.state === 0) {
		if (g.x < m.camX + ACTIVATE) g.state = 1;
		return;
	}
	if (g.state === 2) {
		if (--g.t <= 0) g.state = 3;
		return;
	}
	if (g.state === 4) {                             // knocked off: no collision, just falls away
		g.x += g.vx;
		g.y += g.vy;
		g.vy = Math.min(g.vy + 0.4375, 4);
		if (g.y > TOP + ROWS * TILE + GH * 2) g.state = 3;
		return;
	}
	if (g.state !== 1) return;

	g.anim++;

	// horizontal: turn around at walls
	g.x += g.vx;
	var d = g.vx < 0 ? -1 : 1, edge = g.x + d * GHW;
	if (solid(edge, g.y - 1) || solid(edge, g.y - 8)) {
		var c = Math.floor(edge / TILE);
		g.x = d > 0 ? c * TILE - GHW : (c + 1) * TILE + GHW;
		g.vx = -g.vx;
	}

	// goombas bounce off each other when they walk into one another
	var L = $.goombas;
	for (var j = 0; j < L.length; j++) {
		var o = L[j];
		if (o === g || o.state !== 1) continue;
		if (Math.abs(g.x - o.x) < GHW * 2 && Math.abs(g.y - o.y) < GH && (o.x - g.x) * g.vx > 0) {
			g.vx = -g.vx;
			g.x += g.vx;                             // step back out of the overlap
			break;
		}
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
};

// builds the level and every entity in it.
// $.entities = everything; $.blocks = { list, idx } and $.goombas = [...] are views onto the same objects.
// blocks: one per B / ? / H tile, left to right, top to bottom within a column. Collision still lives in $.level.
function loadWorld() {
	$.level = buildLevel();
	var blocks = [], idx = {}, goombas = [], c, r;
	for (c = 0; c < W; c++) {
		for (r = 0; r < ROWS; r++) {
			var ch = $.level[r].charAt(c);
			if ("B?H".indexOf(ch) >= 0) {
				idx[c + "," + r] = blocks.length;
				blocks.push(Entity.makeBlock(c, r, ch));
			}
		}
	}
	for (c = 0; c < GOOMBA_COLS.length; c++) goombas.push(Entity.makeGoomba(GOOMBA_COLS[c]));
	$.blocks = { list: blocks, idx: idx };
	$.goombas = goombas;
	$.flag = Entity.makeFlag();
	$.entities = blocks.concat(goombas, [$.flag]);
	$.popups = [];                                   // fixed slots, slot N-1 is shown by text layer "Popup N"
	for (var p = 0; p < POPUP_POOL; p++) $.popups.push({ x: 0, y: 0, t: 0, str: "" });
}

// ---------- SCORE POPUPS ----------
// Take a free slot, or recycle the one closest to finishing. x / y are world coordinates (y = where the text starts).
function spawnPopup(x, y, v) {
	var best = $.popups[0];
	for (var i = 0; i < $.popups.length; i++) {
		var p = $.popups[i];
		if (p.t <= 0) { best = p; break; }
		if (p.t < best.t) best = p;
	}
	best.x = x; best.y = y; best.t = POPUP_TIME; best.str = String(v);
}

function tickPopups() {
	for (var i = 0; i < $.popups.length; i++) {
		var p = $.popups[i];
		if (p.t > 0) { p.t--; p.y -= POPUP_RISE / POPUP_TIME; }
	}
}

// goombas standing on a bumped block get knocked off and die
function bumpKill(m, b) {
	var top = TOP + b.r * TILE;
	for (var i = 0; i < $.goombas.length; i++) {
		var g = $.goombas[i];
		if (g.state !== 1) continue;
		if (Math.abs(g.y - top) < 2 && Math.abs(g.x - b.x) < TILE / 2 + GHW) {
			g.state = 4;
			g.vy = KNOCK_VY;
			g.vx = (g.x >= m.x ? 1 : -1) * KNOCK_VX;     // fly away from Mario
			m.addScore(GOOMBA_SCORE, g.x, g.y - GH);
		}
	}
}

// called when Mario's head hits tile (c, r)
function hitBlock(m, c, r) {
	var k = $.blocks.idx[c + "," + r];
	if (k === undefined) return null;
	var b = $.blocks.list[k];
	if (b.gone) return b;
	if (b.type === "?" && !b.used) { b.used = true; m.addCoin(b.x, TOP + b.r * TILE - 4); }
	if (b.t === 0) { b.t = BUMP; bumpKill(m, b); }   // bump even if already used
	return b;
}

// advance every entity one physics step
function tickEntities(m) {
	var L = $.entities;
	for (var i = 0; i < L.length; i++) L[i].tick(m);
}

// ---------- MARIO ----------
function Mario() {
	this.score = 0; this.coins = 0; this.lives = START_LIVES;
	this.checkpoint = false;                         // survives deaths, cleared on game over
	this.reset();
	this.title = 1; this.titleT = 0;                 // black screen until the first input
}

// resets position/physics/timer, but keeps score, coins and lives
Mario.prototype.reset = function () {
	this.ver = VERSION;
	this.last = Date.now();
	this.acc = 0;
	this.x = this.checkpoint ? MIDWAY_COL * TILE + TILE / 2 : SPAWN_X;
	this.y = SPAWN_Y;
	this.vx = 0; this.vy = 0;
	this.camX = Math.max(0, this.x - SCREEN_MID);
	this.stomp = 0;
	this.onGround = true; this.prevJump = false;
	this.holdG = 0; this.fallG = 0; this.g = 0;
	this.jumpBuf = 0; this.jumpHold = 0; this.cut = false;
	this.facing = 1;
	this.time = START_TIME; this.tick = 0; this.low = false;
	this.frame = 0; this.animT = 0;
	this.dying = false; this.deathT = 0;
	this.end = 0; this.endT = 0; this.hidden = false;   // ending state
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

// x, y (world coords) are optional: when given, a floating number pops up there
Mario.prototype.addScore = function (n, x, y) {
	this.score += n;
	if (x !== undefined) spawnPopup(x, y, n);
};

Mario.prototype.addLife = function (x, y) {
	this.lives++;
	if (x !== undefined) spawnPopup(x, y, "1UP");
};

Mario.prototype.addCoin = function (x, y) {
	this.coins++;
	this.addScore(COIN_SCORE, x, y);
	if (this.coins >= 100) { this.coins = 0; this.lives++; }
};

// start the death animation (goomba / timeout): world freezes, Mario pauses, hops up, falls off the screen
Mario.prototype.startDeath = function () {
	this.dying = true; this.deathT = 0;
	this.vx = 0; this.vy = 0;
	this.frame = 6;
};

// one step of the death animation; calls die() once he has fallen off the bottom
Mario.prototype.deathStep = function () {
	this.frame = 6;
	this.deathT++;
	if (this.deathT === DEATH_FREEZE) this.vy = DEATH_VY;                // the hop
	if (this.deathT >= DEATH_FREEZE) {
		this.y += this.vy;                                               // no collision while dying
		this.vy = Math.min(this.vy + DEATH_G, 4);
		if (this.y - HEIGHT > TOP + ROWS * TILE) this.die();             // off the bottom of the screen
	}
};

// lose a life (pit or timeout); game over wipes everything
Mario.prototype.die = function () {
	this.lives--;
	if (this.lives <= 0) {
		this.score = 0; this.coins = 0; this.lives = START_LIVES;
		this.checkpoint = false;                     // game over: back to the very start
	}
	loadWorld();                                     // restore used / broken blocks and respawn goombas
	this.reset();
	for (var i = 0; i < $.goombas.length; i++)       // goombas behind the respawn point are already gone
		if ($.goombas[i].x < this.x + RESPAWN_SAFE) $.goombas[i].state = 3;   // behind the camera, or too close to the respawn point
	this.title = 2; this.titleT = TITLE_TIME;        // black screen for a moment, then play resumes
};

// camera follows forward only and stops at the end of the level; Mario can't leave the level either
Mario.prototype.follow = function () {
	this.camX = Math.min(Math.max(this.camX, this.x - SCREEN_MID), MAX_CAM);
	if (this.x < this.camX + LEFT_PAD) {
		this.x = this.camX + LEFT_PAD;
		this.vx = Math.max(this.vx, 0);
	}
	if (this.x > W * TILE - HW) {
		this.x = W * TILE - HW;
		this.vx = Math.min(this.vx, 0);
	}
};

// Mario touched the flagpole: score by grab height, clear the goombas, start the slide
Mario.prototype.startEnd = function () {
	var h = Math.max(0, POLE_BASE - this.y), idx = 0, i;
	for (i = 0; i < FLAG_ZONES.length; i++) if (h >= FLAG_ZONES[i]) idx++;
	this.end = 1; this.endT = 0;
	this.x = POLE_X - SLIDE_OFF;
	this.y = Math.min(this.y, POLE_BASE);
	this.vx = 0; this.vy = 0; this.facing = 1; this.frame = 7;
	this.onGround = false; this.jumpBuf = 0; this.jumpHold = 0;
	this.low = false;
	for (i = 0; i < $.goombas.length; i++) $.goombas[i].state = 3;   // enemies vanish
	this.addScore(FLAG_SCORES[idx], POLE_X + 14, this.y - HEIGHT);
};

// one step of the ending. 1 slide, 2 wait on far side, 3 walk to castle, 4 inside, 5 time bonus, 6 hold, then restart
Mario.prototype.endStep = function () {
	var s = this.end;
	this.endT++;
	if (s === 1) {
		var moving = false;
		if (this.y < POLE_BASE) { this.y = Math.min(this.y + FLAG_SLIDE, POLE_BASE); moving = true; }
		var f = $.flag, fBottom = FLAG_Y1 + 8;
		if (f.y < fBottom) f.y = Math.min(f.y + FLAG_SLIDE, fBottom);
		this.frame = moving ? 7 + Math.floor(this.endT / 4) % 2 : 7;
		if (!moving && f.y >= fBottom) { this.end = 2; this.endT = 0; }
	} else if (s === 2) {
		this.frame = 8;
		if (this.endT === 1) { this.x = POLE_X + SLIDE_OFF; this.facing = -1; }   // hop to the other side
		if (this.endT >= END_PAUSE) { this.end = 3; this.endT = 0; this.facing = 1; }
	} else if (s === 3) {
		this.x += END_WALK;
		this.vx = END_WALK;
		this.y += this.vy;                                   // gravity: drops off the base block, lands on the ground
		this.vy = Math.min(this.vy + 0.4375, 4);
		this.onGround = false;
		if (this.vy >= 0 && (solid(this.x - HW + 1, this.y) || solid(this.x + HW - 1, this.y))) {
			this.y = TOP + Math.floor((this.y - TOP) / TILE) * TILE;
			this.vy = 0; this.onGround = true;
		}
		this.animate(1);
		if (this.x >= CASTLE_X) { this.hidden = true; this.vx = 0; this.end = 4; this.endT = 0; }
	} else if (s === 4) {
		if (this.endT >= CASTLE_WAIT) { this.end = 5; this.endT = 0; }
	} else if (s === 5) {
		var n = Math.min(this.time, BONUS_RATE);
		this.time -= n;
		this.score += n * TIME_BONUS;
		if (this.time <= 0) { this.end = 6; this.endT = 0; }
	} else if (s === 6) {
		if (this.endT >= END_HOLD) { this.win(); return; }
	}
	this.follow();
};

// level beaten: brand-new game, after the same timed black screen a death gets
Mario.prototype.win = function () {
	this.score = 0; this.coins = 0; this.lives = START_LIVES;
	this.checkpoint = false;
	loadWorld();
	this.reset();
	this.title = 2; this.titleT = TITLE_TIME;
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
				var n = this.stomp++;                        // chain: 100, 200, 400 ... then 1-UP
				if (n < STOMP_SCORES.length) this.addScore(STOMP_SCORES[n], g.x, g.y - GH); else this.addLife(g.x, g.y - GH);
				this.vy = -4; this.holdG = 0.125; this.fallG = 0.4375; this.g = this.holdG;   // bounce (holding jump = higher)
				this.onGround = false;
			} else {
				this.startDeath();
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
	this.low = this.time < LOW_TIME;
	if (this.time <= 0) { this.startDeath(); return; }   // out of time

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

	// --- jump start: a flick up queues a jump (jumpBuf); it fires once Mario is on the ground ---
	if (this.jumpBuf > 0) {
		if (!this.onGround) this.jumpBuf--;
	}
	if (this.jumpBuf > 0 && this.onGround) {
		this.jumpBuf = 0;
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
			this.stomp = 0;                                            // touching the ground ends the chain
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
				this.addLife(hc * TILE + TILE / 2, TOP + hr * TILE - 4);
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
					this.addScore(BRICK_SCORE, bc * TILE + TILE / 2, TOP + r * TILE - 4);
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

	if (this.x >= MIDWAY_COL * TILE) this.checkpoint = true;           // passed the midway point
	if (this.x + HW >= POLE_X - GRAB_REACH) { this.startEnd(); this.follow(); return; }   // touched the flagpole

	// --- camera: forward only, stops at the end of the level ---
	this.follow();

	this.animate(dir);
};

// ---------- INIT ----------
if ($.mario === undefined || $.mario.ver !== VERSION || $.level === undefined || $.entities === undefined || $.popups === undefined || $.flag === undefined) {
	loadWorld();
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
var down = dy > thisComp.height * HOLD_DOWN;    // joystick held low in the air = jump released (heavier gravity)
var jump = dy < -thisComp.height * HOLD_UP;   // joystick held up: keeps the jump going (higher hop). Starting a jump needs a flick, see below

// ---------- FIXED TIMESTEP (clamped) ----------
var now = Date.now();
var dt = now - m.last;
m.last = now;

if (dt > 100) dt = STEP;                 // long idle: discard it, resume as a single frame
m.acc += Math.min(dt, STEP * 3);         // never bank more than 3 steps of time

// start screen: ANY joystick movement on even a single evaluation dismisses it. Uses START_MOVE, not the
// walking deadzone, and sits outside the step loop so a frame that banks less than one step can't miss it
if (m.title === 1 && (Math.abs(dx) > START_MOVE || Math.abs(dy) > START_MOVE)) { m.title = 0; m.prevJump = jump; }

// flick up = jump: a fast upward move of the joystick within one evaluation (only while actually playing)
if (m.prevDy === undefined) m.prevDy = dy;
if (m.title === 0 && !m.dying && m.end === 0 && dy - m.prevDy <= -FLICK_DELTA) {
	m.jumpBuf = JUMP_BUFFER;
	m.jumpHold = FLICK_HOLD;
	m.cut = false;                                   // a fresh jump
}
// flick down = let go of the jump: heavier gravity for the rest of this airtime, so the hop is cut short
if (m.title === 0 && !m.dying && m.end === 0 && dy - m.prevDy >= FLICK_DELTA) {
	m.cut = true;
	m.jumpHold = 0;
}
m.prevDy = dy;

var steps = 0;
while (m.acc >= STEP && steps < 3) {     // hard limit per evaluation
	m.acc -= STEP;
	if (m.title === 2) {                 // death screen: timed
		if (--m.titleT <= 0) { m.title = 0; m.prevJump = jump; }
	}
	if (m.title === 0) {                 // game is frozen while the screen shows
		if (m.dying) {
			m.deathStep();               // only Mario moves during the death animation
		} else if (m.end > 0) {
			m.endStep();                 // flagpole / castle / time bonus: scripted, joystick ignored
			tickEntities(m);
			tickPopups();
		} else {
			if (m.jumpHold > 0) m.jumpHold--;
			if (m.onGround) m.cut = false;               // cut only lasts for one airtime
			m.step(dir, run, (m.jumpHold > 0 || (jump && !down)) && !m.cut);   // a flick holds the jump wherever the stick is
			tickEntities(m);
			tickPopups();
		}
	}
	steps++;
}
m.acc = Math.min(m.acc, STEP);           // drop any leftover backlog

// ---------- LAYER POOL ----------
// Only entities that are drawn AND on (or just next to) the screen get a layer. "Entity N" layers show the Nth
// entry of this list, so a fixed set of layers gets reused as the level scrolls past.
var camL = m.camX - TILE, camR = m.camX + thisComp.width + TILE;
var ve = [], q;
for (q = 0; q < $.entities.length; q++) {
	var en = $.entities[q];
	if (en.shown() && en.x + TILE / 2 > camL && en.x - TILE / 2 < camR) { en.refresh(); ve.push(en); }
}
$.visEntities = ve;

value;

// MARIO
$.mario ? [$.mario.x - $.mario.camX, $.mario.y] : value;

// MARIO TIME REMAP (0 idle, 1-3 walk, 4 skid, 5 jump, 6 death, 7-8 flagpole climb)
$.mario ? framesToTime($.mario.frame) : 0;

// MARIO SCALE (flips horizontally with facing)
$.mario ? [$.mario.facing * 100, 100] : [100, 100];

// TIME (Source Text; flashes red below LOW_TIME, needs After Effects 2020 / v17+ for setFillColor)
var m = $.mario;
var str = "TIME\n" + (m ? ("000" + m.time).slice(-3) : "400");
if (m && m.low && m.tick < 12) {                 // red for half of each timer unit (12 of 24 steps), base colour otherwise
	text.sourceText.createStyle().setFillColor([1, 0.2, 0.2]).setText(str);
} else {
	str;
}

// COINS
$.mario ? "x" + ("00" + $.mario.coins).slice(-2) : "x00";

// SCORE
"MARIO\n" + ($.mario ? ("000000" + $.mario.score).slice(-6) : "000000");

// LIVES
"LIVES\n" + ($.mario ? "x" + $.mario.lives : "x3");

// COURSE
var BASE_X = 1792, BASE_Y = 120;
$.mario ? [BASE_X - $.mario.camX, BASE_Y] : value;

// ENTITY LAYERS: 26 duplicates (ENTITY_POOL) of ONE 16x16 precomp named "Entity 1" ... "Entity 26", anchor [8, 8]
// precomp frames: 0 brick, 1 ? block, 2 used block, 3-4 goomba walk cycle, 5 goomba squished, 6 flagpole flag (the F_ constants)
// (Entity N shows entry N-1 of $.visEntities, whatever block, goomba or the flag is on screen; paste each expression onto every entity layer)

// ENTITY POSITION (centre of the sprite; bump offset lifts blocks)
var m = $.mario;
var e = $.visEntities ? $.visEntities[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(m && e) ? [e.x - m.camX, e.y - e.off - 8] : value;

// ENTITY TIME REMAP
var e = $.visEntities ? $.visEntities[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
e ? framesToTime(e.frame) : 0;

// ENTITY OPACITY (0% when the layer has no entity assigned)
var e = $.visEntities ? $.visEntities[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
e ? 100 : 0;

// ENTITY SCALE (flips upside down when a goomba is knocked off a block)
var e = $.visEntities ? $.visEntities[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(e && e.flip) ? [100, -100] : [100, 100];

// TITLE SCREEN: a black solid named "Title Black", ABOVE the gameplay layers but BELOW the HUD text layers

// TITLE BLACK OPACITY
($.mario && $.mario.title === 0) ? 0 : 100;      // only hidden once the game says play has started; undefined = fully opaque

// ---------- SCORE POPUP TEXT LAYERS ----------
// 3 (POPUP_POOL) text layers named "Popup 1", "Popup 2", "Popup 3". Set each one's paragraph to CENTER justified,
// so the Position below is the middle of the number. Paste each expression onto every popup layer.

// POPUP SOURCE TEXT
var p = $.popups ? $.popups[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(p && p.t > 0) ? p.str : "";

// POPUP POSITION
var p = $.popups ? $.popups[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
($.mario && p && p.t > 0) ? [p.x - $.mario.camX, p.y] : value;

// POPUP OPACITY
var p = $.popups ? $.popups[parseInt(thisLayer.name.split(" ")[1], 10) - 1] : null;
(p && p.t > 0) ? 100 : 0;

// ---------- ENDING LAYERS ----------
// (the flag is an ordinary entity now: it uses the "Entity N" layers above, no separate Flag layer or expression needed)

// MARIO OPACITY (new expression on the Mario layer: he disappears into the castle door)
($.mario && $.mario.hidden) ? 0 : 100;