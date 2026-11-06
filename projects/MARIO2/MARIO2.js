// This is vibe coded AI slop using the $ debug object method.
// The original version I made myself :)

// JOYSTICK
const STEP = 1000 / 60;
const SPAWN_X = 40, SPAWN_Y = 208;     // feet on top of the ground (row 11 -> y = 32 + 11*16)
const MIDWAY_COL = 96;                 // tile column of the midway checkpoint: crossing it makes deaths respawn here
const RESPAWN_SAFE = 96;               // goombas within this many px ahead of the respawn point are removed, so you never respawn on top of one
const SCREEN_MID = 112, LEFT_PAD = 8;  // screen x where Mario is kept while the camera scrolls; minimum distance from the left screen edge
const X_GAIN = 2;                      // joystick x sensitivity: 2 = half the stick travel is needed to walk / run
const VERSION = 34;                     // changing this value reinitialises the stored game state

const TILE = 16, TOP = 32, ROWS = 13;
const W = 224;                         // 3584 px BG / 16 = 224 tiles
const HW = 6, HEIGHT = 16;             // small Mario's hitbox height
const BIG_HEIGHT = 32;                 // big Mario's hitbox height. The Mario layer is 16x32 with anchor [8, 32] (feet = bottom-centre)
const SOLID = new Set("GB?PSU");   // solid tiles: G ground, B brick, ? question, P pipe, S hard block, U used block
                                     // H = hidden 1-up block: NOT in SOLID, so Mario passes through it until he bumps it from below

// ---------- POWER-UPS: mushroom (small <-> big) ----------
const POWER_BLOCKS = ["21,7", "78,7", "109,7"];   // "col,row" of the ? blocks that hold a mushroom (every other ? block gives a coin)
const MUSH_SCORE = 1000;               // points for collecting a mushroom (small or big)
const MUSH_RISE = 0.5;                 // px per step while it rises out of the block (16 px = 32 steps)
const MUSH_SPEED = 1;                  // px per step once it is out
const MUSH_HW = 7;                     // mushroom half-width (hitbox)
const GROW_TIME = 48, SHRINK_TIME = 48;   // steps the whole game freezes while Mario grows / shrinks
const MORPH_STEP = 4;                  // steps per sprite swap during that freeze
const INVULN = 120;                    // steps of flickering invulnerability after being hit (120 = 2 s)
const BEHIND_HIGH_INDEX = false;       // which entity layers the mushrooms, stars and coin pops use, so they can rise out from BEHIND the block.
                                     // false = the FIRST layers (Entity 1, 2 ...): Entity 1 must sit at the BOTTOM of the entity layers, Entity 30 at the top
                                     //         (the order you get by duplicating the layer upwards)
                                     // true  = the LAST layers: Entity 30 must sit at the bottom, Entity 1 at the top
const F_MARIO_BIG = 9;                 // Mario precomp: big frames = small frame + 9 (9 idle, 10-12 walk, 13 skid, 14 jump, 16-17 pole)
const F_MARIO_DUCK = 18;               // Mario precomp: big Mario ducking (drawn in the bottom 16 px, like a small frame)
const F_MARIO_MID = 15;                // Mario precomp: the in-between size, only seen during the grow / shrink flicker (fills the slot where a big death frame would be)

// ---------- BLOCK CONTENTS ----------
const MULTI_BRICKS = ["94,7"];          // "col,row" of bricks that hold several coins
const STAR_BRICKS = ["101,7"];          // "col,row" of bricks that hold a star
const MULTI_COINS = 10;                // coins in a multi-coin brick
const MULTI_TIME = 240;                // steps (4 s) after the FIRST hit: the next hit after that gives the last coin and uses the brick up
const COIN_VY = -5, COIN_G = 0.25;     // coin popping out of a block: launch speed and gravity (rises ~50 px, lands back on the block)
const COIN_ANIM = 3;                   // steps per coin spin frame (4 frames)
const Q_HOLD = 24, Q_STEP = 8;         // ? block flicker: steps the bright frame holds, then steps per shade (bright, mid, dark, mid ...)
const STAR_SPEED = 1, STAR_BOUNCE = -5;   // star: walking speed and the hop it makes every time it lands
const STAR_ANIM = 4;                   // steps per star frame (2 frames)
const STAR_TIME = 600;                 // steps of invincibility after grabbing a star (600 = 10 s)
const STAR_SCORE = 1000;

const START_LIVES = 3, START_TIME = 400;
const LOW_TIME = 100;                  // the TIME text flashes red once the timer drops below this
const COIN_SCORE = 200, BRICK_SCORE = 50;
const DEATH_FREEZE = 30, DEATH_VY = -5, DEATH_G = 0.25;   // death animation: pause (steps), hop speed, gravity
const FLICK_DELTA = 8;                 // px the joystick must move UP in a single evaluation to count as a flick (lower = easier)
const FLICK_HOLD = 14;                 // steps a flick counts as "jump held" (full-height hop even if you let go right away)
const JUMP_BUFFER = 6;                 // steps a flick is remembered, so one just before landing still jumps
const HOLD_UP = 0.1;                   // keeping the joystick this far above centre (fraction of height) holds the jump for a higher hop
const DUCK_DOWN = 0.2;                 // joystick this far below centre (fraction of height) on the ground = big Mario ducks
const HOLD_DOWN = 0.1;                 // joystick this far below centre (fraction of height) = jump released, heavier gravity
const START_MOVE = 1;                  // px the joystick must leave its centre to dismiss the start screen (the deadzone does not apply)
const MSG_START = "Move joystick to play!", MSG_OVER = "Game over!", MSG_TIMEUP = "Time up!", MSG_WIN = "You win!";   // the text of the title-screen label
const TITLE_TIME = 120;                 // steps every black screen shows (death, Game over, Time up, You win): 120 = 2 s
const ANIM_DIST = 10;                  // px Mario travels per walk-cycle frame (faster = quicker steps)
const POPUP_POOL = 3;                  // text layers "Popup 1" ... "Popup 3"; if all are busy the oldest popup is recycled
const POPUP_TIME = 45;                 // steps a popup lives (45 = 0.75 s)
const POPUP_RISE = 40;                 // px a popup floats upward over its life
// ---------- ENDING (flagpole -> slide -> castle walk -> time bonus -> restart) ----------
const POLE_COL = 198;                  // tile column of the F tiles (must match buildLevel)
const POLE_X = POLE_COL * TILE + TILE / 2;   // x of the pole itself
const POLE_BASE = TOP + 10 * TILE;     // y of the top of the base block = where Mario's feet end up
const GRAB_REACH = 8;                  // Mario grabs when his right edge is this close to the pole (8 = left edge of the tile, so touching the base block counts too)
const SLIDE_OFF = 7;                   // px Mario's centre sits left (sliding) / right (waiting) of the pole
const FLAG_SLIDE = 2;                  // px per step Mario and the flag slide down
const FLAG_SCORES = [100, 400, 800, 2000, 5000];   // grab height score, lowest to highest
const FLAG_ZONES = [16, 48, 80, 112];  // px above the base block where each next score starts (pole is 128 px tall)
const FLAG_X = POLE_X - 8;             // centre of the 16x16 flag layer (it sits just left of the pole)
const FLAG_Y0 = TOP + 2 * TILE + 8;    // flag centre y when raised
const FLAG_Y1 = POLE_BASE - 8;         // flag centre y when lowered
const END_PAUSE = 20;                  // steps Mario waits on the far side of the pole before walking
const END_WALK = 1.5;                  // px per step walking to the castle
const CASTLE_X = 204 * TILE + TILE / 2;   // x of the castle door: Mario vanishes here
const CFLAG_X = CASTLE_X;              // x of the castle flag (centre of the 16x16 sprite)
const CFLAG_Y1 = TOP + 6 * TILE;       // flag BOTTOM y when fully raised (castle roof line = row 6 for a 5-tile castle)
const CFLAG_Y0 = CFLAG_Y1 + TILE;      // flag BOTTOM y when it starts rising (one tile lower)
const CFLAG_RISE = 0.5;                // px per step the flag rises (16 px = 32 steps, about the length of CASTLE_WAIT)
const CASTLE_WAIT = 30;                // steps before the time bonus starts counting
const TIME_BONUS = 50, BONUS_RATE = 2; // points per leftover time unit, units converted per step
const END_HOLD = 90;                   // steps to hold after the bonus, then cut to black (like a death) and restart
const MAX_CAM = Math.max(0, W * TILE - thisComp.width);   // camera never scrolls past the end of the BG
const BUMP = 8;                        // block bump animation length in physics steps (about 0.13 s)
const GRAVITY = 0.4375, TERMINAL_VY = 4;   // px per step^2 and max fall speed (goombas, mushrooms, stars, Mario)

const GHW = 6, GH = 16;                // goomba half-width / height (hitbox only; sprite layers all use anchor [8, 8])
const GOOMBA_SPEED = 0.5;              // px per step
const GOOMBA_SCORE = 100, SQUISH = 30;   // squished goombas stay flat for 30 steps
const STOMP_SCORES = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];   // chained stomps without touching the ground; past the end = 1-UP
const KNOCK_VX = 0.5, KNOCK_VY = -3;   // goomba knocked off a bumped block: sideways speed, upward pop
const GOOMBA_Y = 208;                  // feet on top of the ground
const GOOMBA_COLS = [22, 40, 51, 53, 80, 82, 97, 99, 114, 116, 124, 126, 128, 130, 174, 176];   // tile columns (approximate 1-1 layout)
const ACTIVATE = thisComp.width + 16;   // goombas start walking when this close to the right screen edge
const ENTITY_POOL = 30;                // number of "Entity N" sprite layers

// ---------- LEVEL 1-1 ----------
function buildLevel() {
	const g = Array.from({ length: ROWS }, () => new Array(W).fill("."));
	function put(c, r, ch) { if (r >= 0 && r < ROWS && c >= 0 && c < W) g[r][c] = ch; }
	function row(c0, r, str) {                       // draw a string of tiles; spaces are skipped
		[...str].forEach((ch, i) => { if (ch !== " ") put(c0 + i, r, ch); });
	}
	function pipe(c, h) {
		for (let i = 0; i < h; i++) { put(c, 10 - i, "P"); put(c + 1, 10 - i, "P"); }
	}
	function stack(c, h) { for (let i = 0; i < h; i++) put(c, 10 - i, "S"); }

	// ground (rows 11-12) with pits
	const pits = [69, 70, 86, 87, 88, 153, 154];
	for (let c = 0; c < W; c++) {
		if (pits.includes(c)) continue;
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
	let i;
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

	return g;                                        // rows of single-character tiles
}

// ---------- TILE COLLISION + SHARED MOVEMENT ----------
function solid(px, py) {
	const col = Math.floor(px / TILE);
	const row = Math.floor((py - TOP) / TILE);
	if (row < 0 || row >= ROWS) return false;        // above the map or in a pit: open
	if (col < 0) return true;                        // left of level start: wall
	return SOLID.has($.level[row][col]);             // past the right end of the level the tile is undefined: open
}

// horizontal move shared by goombas, mushrooms and stars: walk, and turn around at walls
function walkX(o, hw) {
	o.x += o.vx;
	const d = o.vx < 0 ? -1 : 1, edge = o.x + d * hw;
	if (solid(edge, o.y - 1) || solid(edge, o.y - 8)) {
		const c = Math.floor(edge / TILE);
		o.x = d > 0 ? c * TILE - hw : (c + 1) * TILE + hw;
		o.vx = -o.vx;
	}
}

// vertical move shared by goombas, mushrooms, stars and Mario's walk to the castle: gravity, then land on tile tops. Returns true when it lands
function fallY(o, hw) {
	o.y += o.vy;
	o.vy = Math.min(o.vy + GRAVITY, TERMINAL_VY);
	if (o.vy >= 0 && (solid(o.x - hw + 1, o.y) || solid(o.x + hw - 1, o.y))) {
		o.y = TOP + Math.floor((o.y - TOP) / TILE) * TILE;
		o.vy = 0;
		return true;
	}
	return false;
}

// ---------- ENTITIES (blocks + goombas) ----------
// One class for everything that gets a sprite. Position is always the bottom-centre of the 16x16 sprite.
//   kind  BLOCK, GOOMBA, MUSHROOM, STAR, COIN (a coin popping out of a block) or FLAG (the flagpole flag: y is the flag's bottom, it slides down during the ending)
//   state BLOCK: unused. GOOMBA: 0 = waiting offscreen, 1 = walking, 2 = squished, 3 = gone,
//         4 = knocked off a block (flips and falls).  MUSHROOM / STAR: 0 = rising out of the block, 1 = moving, 3 = gone.  COIN: 1 = flying, 3 = gone
//   t     BLOCK: bump timer.  GOOMBA: squish timer
//   off   upward bump offset in px (blocks only, 0 otherwise)
//   frame / flip   what the sprite layer should show, filled in by refresh()
const BLOCK = 0, GOOMBA = 1, FLAG = 2, MUSHROOM = 3, COIN = 4, STAR = 5, CFLAG = 6;   // CFLAG: the flag that rises on the castle (state 0 = hidden, waiting for Mario to enter the door, 1 = rising / raised)
// frames of the single sprite precomp (comp frame numbers, 0-based)
const F_BRICK = 0, F_QUESTION = 1, F_USED = 2, F_GOOMBA = 3 /* 3 and 4 = walk cycle */, F_SQUISH = 5, F_FLAG = 6, F_MUSHROOM = 7,
    F_QUESTION2 = 8, F_QUESTION3 = 9 /* ? flicker shades */, F_COIN = 10 /* 10-13 spin */, F_STAR = 14 /* 14-15 */,
    F_CFLAG = 16,                    // castle flag: add this frame to the Entity precomp
    F_1UP = 17;                      // green 1-UP mushroom (from the hidden block): add this frame to the Entity precomp

// the shade of an unused ? block right now: bright (held), then mid, dark, mid, driven by Mario's step clock.
// computed once per evaluation into $.qf, which every ? block reads
function questionFrame() {
	const clk = ($.mario && isFinite($.mario.clock)) ? $.mario.clock : 0;
	const t = clk % (Q_HOLD + 3 * Q_STEP);
	if (t < Q_HOLD) return F_QUESTION;
	const f = [F_QUESTION2, F_QUESTION3, F_QUESTION2][Math.floor((t - Q_HOLD) / Q_STEP)];
	return f === undefined ? F_QUESTION : f;
}

class Entity {
	constructor(kind, x, y) {
		this.kind = kind;
		this.x = x; this.y = y;
		this.vx = 0; this.vy = 0;
		this.state = 1; this.t = 0; this.anim = 0; this.off = 0;
		this.frame = 0; this.flip = false;
		this.oneup = false;                              // MUSHROOM only: true = green 1-UP mushroom (gives a life instead of growing)
		// block-only fields
		this.c = 0; this.r = 0; this.type = ""; this.content = ""; this.coins = 0; this.mt = 0; this.used = false; this.revealed = true; this.gone = false; this.active = false;
	}

	static makeBlock(c, r, type) {
		const e = new Entity(BLOCK, c * TILE + TILE / 2, TOP + (r + 1) * TILE);
		e.c = c; e.r = r; e.type = type;
		e.revealed = type !== "H";                       // hidden blocks start invisible
		const key = `${c},${r}`;                           // what is inside: "coin", "mushroom", "multi" (several coins), "star" or "" (empty brick)
		if (type === "?") e.content = POWER_BLOCKS.includes(key) ? "mushroom" : "coin";
		else if (type === "B") e.content = MULTI_BRICKS.includes(key) ? "multi" : (STAR_BRICKS.includes(key) ? "star" : "");
		if (e.content === "multi") e.coins = MULTI_COINS;
		return e;
	}

	static makeFlag() {
		return new Entity(FLAG, FLAG_X, FLAG_Y0 + 8);
	}

	// the castle flag: y is the flag's bottom. Hidden until Mario goes inside, then it rises
	static makeCastleFlag() {
		const e = new Entity(CFLAG, CFLAG_X, CFLAG_Y0);
		e.state = 0;
		return e;
	}

	// a mushroom or star rising out of block b: starts hidden inside the block, its feet at the block's bottom edge (the star then bounces along)
	static makePowerup(kind, b, oneup) {
		const e = new Entity(kind, b.x, TOP + (b.r + 1) * TILE);
		e.oneup = !!oneup;
		e.state = 0; e.vx = kind === STAR ? STAR_SPEED : MUSH_SPEED;
		e.destY = TOP + b.r * TILE;                      // feet on top of the block once it is out
		return e;
	}

	// a coin popping out of block b: flies up and lands back on the block, where it turns into the score popup
	static makeCoin(b) {
		const e = new Entity(COIN, b.x, TOP + b.r * TILE);
		e.vy = COIN_VY; e.y0 = e.y;
		return e;
	}

	static makeGoomba(col) {
		const e = new Entity(GOOMBA, col * TILE + TILE / 2, GOOMBA_Y);
		e.vx = -GOOMBA_SPEED; e.state = 0;
		return e;
	}

	// is this entity drawn at all right now?
	shown() {
		if (this.kind === FLAG) return true;
		if (this.kind === CFLAG) return this.state === 1;
		if (this.kind === BLOCK) return this.revealed && !this.gone;
		if (this.kind === MUSHROOM || this.kind === STAR) return this.state === 0 || this.state === 1;
		if (this.kind === COIN) return this.state === 1;
		return this.state === 1 || this.state === 2 || this.state === 4;
	}

	// pick the sprite frame and flip for the layer that is showing this entity
	refresh() {
		if (this.kind === FLAG) {
			this.frame = F_FLAG; this.flip = false;
		} else if (this.kind === CFLAG) {
			this.frame = F_CFLAG; this.flip = false;
		} else if (this.kind === MUSHROOM) {
			this.frame = this.oneup ? F_1UP : F_MUSHROOM; this.flip = false;
		} else if (this.kind === STAR) {
			this.frame = F_STAR + Math.floor(this.anim / STAR_ANIM) % 2; this.flip = false;
		} else if (this.kind === COIN) {
			this.frame = F_COIN + Math.floor(this.anim / COIN_ANIM) % 4; this.flip = false;
		} else if (this.kind === BLOCK) {
			this.frame = this.used ? F_USED : (this.type === "?" ? (isFinite($.qf) ? $.qf : F_QUESTION) : F_BRICK);
			this.flip = false;
		} else {
			this.frame = this.state === 2 ? F_SQUISH : F_GOOMBA + Math.floor(this.anim / 10) % 2;
			this.flip = this.state === 4;
		}
	}

	// advance one physics step
	tick(m) {
		if (this.kind === GOOMBA) this.tickGoomba(m); else if (this.kind === MUSHROOM || this.kind === STAR) this.tickPowerup(m); else if (this.kind === COIN) this.tickCoin(); else if (this.kind === CFLAG) this.tickCastleFlag(m);
	}

	// castle flag: appears and rises as soon as Mario has walked into the castle door (ending step 4 onwards)
	tickCastleFlag(m) {
		if (this.state === 0) {
			if (m.end >= 4) this.state = 1;
			return;
		}
		if (this.y > CFLAG_Y1) this.y = Math.max(this.y - CFLAG_RISE, CFLAG_Y1);
	}

	// bump animation + multi-coin timer. Returns false once there is nothing left to animate, so the block leaves $.active
	tickBlock() {
		const timing = this.content === "multi" && !this.used && this.coins < MULTI_COINS;   // timer starts on the first hit
		if (timing && this.mt > 0) this.mt--;
		if (this.t > 0) this.t--;
		this.off = this.t > 0 ? Math.sin(Math.PI * (1 - this.t / BUMP)) * 8 : 0;
		return this.t > 0 || (timing && this.mt > 0);
	}

	tickGoomba(m) {
		const g = this;
		if (g.state === 0) {
			if (g.x < m.camX + ACTIVATE) { g.state = 1; $.walkers.push(g); }
			return;
		}
		if (g.state === 2) {
			if (--g.t <= 0) g.state = 3;
			return;
		}
		if (g.state === 4) {                             // knocked off: no collision, just falls away
			g.x += g.vx;
			g.y += g.vy;
			g.vy = Math.min(g.vy + GRAVITY, TERMINAL_VY);
			if (g.y > TOP + ROWS * TILE + GH * 2) g.state = 3;
			return;
		}
		if (g.state !== 1) return;

		g.anim++;

		// horizontal: turn around at walls
		walkX(g, GHW);

		// goombas bounce off each other when they walk into one another
		for (const o of $.walkers) {
			if (o === g || o.state !== 1) continue;
			if (Math.abs(g.x - o.x) < GHW * 2 && Math.abs(g.y - o.y) < GH && (o.x - g.x) * g.vx > 0) {
				g.vx = -g.vx;
				g.x += g.vx;                             // step back out of the overlap
				break;
			}
		}

		// vertical: gravity, land on tiles, walk off ledges
		fallY(g, GHW);

		if (g.y > TOP + ROWS * TILE + GH) g.state = 3;     // fell in a pit
		if (g.x < m.camX - 32) g.state = 3;                 // left behind
	}

	// mushroom / star: rises out of its block, then moves right, turns at walls and falls off ledges like a goomba.
	// the star also hops every time it lands
	tickPowerup(m) {
		const g = this;
		g.anim++;
		if (g.state === 0) {                             // rising: no collision, drawn behind the block
			g.y -= MUSH_RISE;
			if (g.y <= g.destY) { g.y = g.destY; g.vy = 0; g.state = 1; }
			return;
		}
		if (g.state !== 1) return;

		walkX(g, MUSH_HW);
		if (fallY(g, MUSH_HW) && g.kind === STAR) g.vy = STAR_BOUNCE;   // the star hops every time it lands
		if (g.vy < 0 && (solid(g.x - MUSH_HW + 1, g.y - 16) || solid(g.x + MUSH_HW - 1, g.y - 16))) g.vy = 0;   // bonked a ceiling

		if (g.y > TOP + ROWS * TILE + 16) g.state = 3;   // fell in a pit
		if (g.x < m.camX - 32) g.state = 3;              // left behind
	}

	// coin popping out of a block
	tickCoin() {
		this.anim++;
		this.y += this.vy;
		this.vy += COIN_G;
		if (this.vy > 0 && this.y >= this.y0) {          // back on the block: gone, the score pops up
			this.state = 3;
			spawnPopup(this.x, this.y0 - 4, COIN_SCORE);
		}
	}
}

// builds the level and every entity in it.
// $.blocks = { list, idx }: one block per B / ? / H tile, left to right, top to bottom within a column.
//   $.colStart[c] = index in the list of the first block at column c or later, so the layer pool only looks at blocks near the camera.
//   $.active = the blocks that are bumping or timing a multi-coin brick (only these are ticked).
// $.entities = goombas + both flags, ticked every step. $.goombas = the goombas alone. $.walkers = the goombas currently walking (rebuilt every step).
// Collision lives in $.level: an array of rows, each an array of tile characters.
function loadWorld() {
	$.level = buildLevel();
	const blocks = [], idx = {};
	for (let c = 0; c < W; c++) {
		for (let r = 0; r < ROWS; r++) {
			const ch = $.level[r][c];
			if ("B?H".includes(ch)) {
				idx[`${c},${r}`] = blocks.length;
				blocks.push(Entity.makeBlock(c, r, ch));
			}
		}
	}
	const goombas = GOOMBA_COLS.map(col => Entity.makeGoomba(col));
	const colStart = [];
	for (let c = 0, k = 0; c <= W; c++) {
		while (k < blocks.length && blocks[k].c < c) k++;
		colStart.push(k);
	}
	$.blocks = { list: blocks, idx };
	$.colStart = colStart;
	$.active = [];
	$.walkers = [];
	$.qf = F_QUESTION;
	$.goombas = goombas;
	$.flag = Entity.makeFlag();
	$.cflag = Entity.makeCastleFlag();
	$.entities = [...goombas, $.flag, $.cflag];
	$.items = [];                                // mushrooms, stars and coin pops spawned by blocks while playing (not part of $.entities)
	$.popups = Array.from({ length: POPUP_POOL }, () => ({ x: 0, y: 0, t: 0, str: "" }));   // fixed slots, slot N-1 is shown by text layer "Popup N"
	$.slots = {};                                    // layer name -> pool index, so the layer expressions need no string parsing
	for (let p = 1; p <= ENTITY_POOL; p++) $.slots[`Entity ${p}`] = p - 1;
	for (let p = 1; p <= POPUP_POOL; p++) $.slots[`Popup ${p}`] = p - 1;
}

// ---------- SCORE POPUPS ----------
// Take a free slot, or recycle the one closest to finishing. x / y are world coordinates (y = where the text starts).
function spawnPopup(x, y, v) {
	const best = $.popups.find(p => p.t <= 0) || $.popups.reduce((a, b) => (b.t < a.t ? b : a));
	best.x = x; best.y = y; best.t = POPUP_TIME; best.str = String(v);
}

function tickPopups() {
	for (const p of $.popups) if (p.t > 0) { p.t--; p.y -= POPUP_RISE / POPUP_TIME; }
}

// goombas standing on a bumped block get knocked off and die
function bumpKill(m, b) {
	const top = TOP + b.r * TILE;
	for (const g of $.goombas) {
		if (g.state !== 1) continue;
		if (Math.abs(g.y - top) < 2 && Math.abs(g.x - b.x) < TILE / 2 + GHW) {
			g.state = 4;
			g.vy = KNOCK_VY;
			g.vx = (g.x >= m.x ? 1 : -1) * KNOCK_VX;     // fly away from Mario
			m.addScore(GOOMBA_SCORE, g.x, g.y - GH);
		}
	}
	for (const u of $.items) {                   // a mushroom standing on the block hops and runs away from Mario
		if (u.kind !== MUSHROOM || u.state !== 1) continue;
		if (Math.abs(u.y - top) < 2 && Math.abs(u.x - b.x) < TILE / 2 + MUSH_HW) {
			u.vy = KNOCK_VY;
			u.vx = (u.x >= m.x ? 1 : -1) * MUSH_SPEED;
		}
	}
}

// the block turns into a used (solid, empty) block
function useBlock(b) {
	b.used = true;
	$.level[b.r][b.c] = "U";
}

// a coin pops out: counts and scores now, the popup shows when the coin lands back on the block
function popCoin(m, b) {
	m.addCoin();
	$.items.push(Entity.makeCoin(b));
}

// blocks are only ticked while they are bumping or timing a multi-coin brick
function activate(b) {
	if (!b.active) { b.active = true; $.active.push(b); }
}

// called when Mario's head hits tile (c, r)
function hitBlock(m, c, r) {
	const k = $.blocks.idx[`${c},${r}`];
	if (k === undefined) return null;
	const b = $.blocks.list[k];
	if (b.gone) return b;
	if (!b.used && b.content) {
		if (b.content === "multi") {
			if (b.coins === MULTI_COINS) b.mt = MULTI_TIME;   // the first hit starts the timer
			b.coins--;
			if (b.coins <= 0 || b.mt <= 0) useBlock(b);       // last coin, or the timer already ran out: this hit empties it
			popCoin(m, b);
		} else {
			useBlock(b);
			if (b.content === "coin") popCoin(m, b);
			else if (b.content === "star") $.items.push(Entity.makePowerup(STAR, b));
			else $.items.push(Entity.makePowerup(MUSHROOM, b));        // mushroom
		}
	}
	if (b.t === 0) { b.t = BUMP; bumpKill(m, b); }   // bump even if already used
	activate(b);
	return b;
}

// advance every entity one physics step
function tickEntities(m) {
	const A = $.active;
	for (let i = A.length - 1; i >= 0; i--) {        // blocks: only the ones bumping or timing
		if (!A[i].tickBlock()) { A[i].active = false; A.splice(i, 1); }
	}
	$.walkers = $.goombas.filter(g => g.state === 1);
	$.entities.forEach(e => e.tick(m));
	$.items.forEach(u => u.tick(m));
	$.items = $.items.filter(u => u.state !== 3);    // drop collected, fallen and left-behind items
}

// ---------- MARIO ----------
class Mario {
	constructor() {
		this.score = 0; this.coins = 0; this.lives = START_LIVES;
		this.checkpoint = false;                         // survives deaths, cleared on game over
		this.clock = 0;                                  // counts physics steps forever, drives the ? block flicker
		this.reset();
		this.title = 1;                                  // black screen until the first input
		this.titleMsg = MSG_START;                       // what the title label says while title !== 0 ("" = nothing)
	}

	// resets position/physics/timer, but keeps score, coins and lives
	reset() {
		this.ver = VERSION;
		this.last = Date.now();
		this.acc = 0;
		this.x = this.checkpoint ? MIDWAY_COL * TILE + TILE / 2 : SPAWN_X;
		this.y = SPAWN_Y;
		this.vx = 0; this.vy = 0;
		this.camX = Math.max(0, this.x - SCREEN_MID);
		this.stomp = 0;
		this.onGround = true;
		this.holdG = 0; this.fallG = 0; this.g = 0;
		this.jumpBuf = 0; this.jumpHold = 0; this.cut = false;
		this.facing = 1;
		this.time = START_TIME; this.tick = 0; this.low = false;
		this.frame = 0; this.animT = 0;
		this.dying = false; this.deathT = 0;
		this.end = 0; this.endT = 0; this.hidden = false;   // ending state
		this.big = false; this.h = HEIGHT;               // size: always small after a death / restart
		this.timeUp = false;                             // true when the current death was caused by the timer running out
		this.ducking = false;                            // big Mario crouching: hitbox drops to small height
		this.star = 0;                                   // invincibility steps left after a star
		this.inv = 0;                                    // invulnerability steps left (flickers)
		this.morph = 0; this.morphDir = 0; this.morphT = 0;   // grow / shrink freeze: steps left, +1 grow / -1 shrink, steps elapsed
		this.spr = 0;                                    // sprite frame actually drawn, see sprite()
	}

	// SIZE ----------------------------------------------------------------------------------------------
	// dir +1: grow (mushroom), -1: shrink (hit). The whole game freezes for the animation, the timer too.
	startMorph(dir) {
		this.morph = dir > 0 ? GROW_TIME : SHRINK_TIME;
		this.morphDir = dir; this.morphT = 0;
		this.ducking = false;                            // stands up for the size-change flicker
	}

	morphStep() {
		this.morphT++;
		if (--this.morph > 0) return;
		if (this.morphDir > 0) { this.big = true; this.h = BIG_HEIGHT; }
		else { this.big = false; this.h = HEIGHT; this.inv = INVULN; }
		this.morphDir = 0;
	}

	// the frame of the Mario precomp to show: small 0-8, big +F_MARIO_BIG, F_MARIO_DUCK while ducking, F_MARIO_MID during a size change
	sprite() {
		const r = this.spriteRaw();
		return isFinite(r) ? r : 0;
	}

	spriteRaw() {
		if (this.dying) return 6;
		if (this.morph > 0) {
			const k = [0, 1, 2, 1][(Math.floor(this.morphT / MORPH_STEP) + (this.morphDir > 0 ? 0 : 2)) % 4];   // small, mid, big, mid
			return k === 1 ? F_MARIO_MID : (k === 2 ? F_MARIO_BIG + this.frame : this.frame);
		}
		if (this.big && this.ducking) return F_MARIO_DUCK;
		return this.big ? F_MARIO_BIG + this.frame : this.frame;
	}

	// a goomba touched Mario from the side: big Mario shrinks, small Mario dies
	hurt() {
		if (this.big) this.startMorph(-1); else this.startDeath();
	}

	// pick the sprite frame: 0 idle, 1-3 walk cycle, 4 skid, 5 jump
	animate(dir) {
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
	}

	// x, y (world coords) are optional: when given, a floating number pops up there
	addScore(n, x, y) {
		this.score += n;
		if (x !== undefined) spawnPopup(x, y, n);
	}

	addLife(x, y) {
		this.lives++;
		if (x !== undefined) spawnPopup(x, y, "1UP");
	}

	addCoin() {
		this.coins++;
		this.addScore(COIN_SCORE);
		if (this.coins >= 100) { this.coins = 0; this.lives++; }
	}

	// start the death animation (goomba / timeout): world freezes, Mario pauses, hops up, falls off the screen
	startDeath() {
		this.dying = true; this.deathT = 0;
		this.big = false; this.h = HEIGHT; this.morph = 0; this.ducking = false;   // the death sprite is always the small one
		this.vx = 0; this.vy = 0;
	}

	// one step of the death animation; calls die() once he has fallen off the bottom
	deathStep() {
		this.deathT++;
		if (this.deathT === DEATH_FREEZE) this.vy = DEATH_VY;                // the hop
		if (this.deathT >= DEATH_FREEZE) {
			this.y += this.vy;                                               // no collision while dying
			this.vy = Math.min(this.vy + DEATH_G, TERMINAL_VY);
			if (this.y - HEIGHT > TOP + ROWS * TILE) this.die();             // off the bottom of the screen
		}
	}

	// wipes score, coins, lives and the checkpoint
	newGame() {
		this.score = 0; this.coins = 0; this.lives = START_LIVES;
		this.checkpoint = false;
	}

	// lose a life (pit or timeout); game over wipes everything
	die() {
		const timeUp = this.timeUp;                      // read before reset() clears it
		this.lives--;
		const over = this.lives <= 0;
		if (over) this.newGame();                        // game over: back to the very start
		loadWorld();                                     // restore used / broken blocks and respawn goombas
		this.reset();
		for (const g of $.goombas) if (g.x < this.x + RESPAWN_SAFE) g.state = 3;   // goombas behind the camera or too close to the respawn point are gone
		this.title = 2;                                  // black screen for a moment, then play resumes
		if (over) { this.titleMsg = MSG_OVER; this.titleT = TITLE_TIME; }
		else if (timeUp) { this.titleMsg = MSG_TIMEUP; this.titleT = TITLE_TIME; }
		else { this.titleMsg = `${this.lives} ${this.lives === 1 ? "life" : "lives"} remaining!`; this.titleT = TITLE_TIME; }   // plain death: show the lives remaining
	}

	// camera follows forward only and stops at the end of the level; Mario can't leave the level either
	follow() {
		this.camX = Math.min(Math.max(this.camX, this.x - SCREEN_MID), MAX_CAM);
		if (this.x < this.camX + LEFT_PAD) {
			this.x = this.camX + LEFT_PAD;
			this.vx = Math.max(this.vx, 0);
		}
		if (this.x > W * TILE - HW) {
			this.x = W * TILE - HW;
			this.vx = Math.min(this.vx, 0);
		}
	}

	// Mario touched the flagpole: score by grab height, clear the goombas, start the slide
	startEnd() {
		const h = Math.max(0, POLE_BASE - this.y);
		const idx = FLAG_ZONES.filter(zone => h >= zone).length;
		this.end = 1; this.endT = 0;
		this.x = POLE_X - SLIDE_OFF;
		this.y = Math.min(this.y, POLE_BASE);
		this.vx = 0; this.vy = 0; this.facing = 1; this.frame = 7;
		this.ducking = false; this.h = this.big ? BIG_HEIGHT : HEIGHT;   // grabs the pole standing up
		this.onGround = false; this.jumpBuf = 0; this.jumpHold = 0;
		this.low = false;
		$.goombas.forEach(g => { g.state = 3; });                       // enemies vanish
		this.addScore(FLAG_SCORES[idx], POLE_X + 14, this.y - this.h);
	}

	// one step of the ending. 1 slide, 2 wait on far side, 3 walk to castle, 4 inside, 5 time bonus, 6 hold, then restart
	endStep() {
		const s = this.end;
		this.endT++;
		if (s === 1) {
			let moving = false;
			if (this.y < POLE_BASE) { this.y = Math.min(this.y + FLAG_SLIDE, POLE_BASE); moving = true; }
			const f = $.flag, fBottom = FLAG_Y1 + 8;
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
			this.onGround = fallY(this, HW);                     // gravity: drops off the base block, lands on the ground
			this.animate(1);
			if (this.x >= CASTLE_X) { this.hidden = true; this.vx = 0; this.end = 4; this.endT = 0; }
		} else if (s === 4) {
			if (this.endT >= CASTLE_WAIT) { this.end = 5; this.endT = 0; }
		} else if (s === 5) {
			const n = Math.min(this.time, BONUS_RATE);
			this.time -= n;
			this.score += n * TIME_BONUS;
			if (this.time <= 0) { this.end = 6; this.endT = 0; }
		} else if (s === 6) {
			if (this.endT >= END_HOLD) { this.win(); return; }
		}
		this.follow();
	}

	// level beaten: brand-new game, after the same timed black screen a death gets
	win() {
		this.newGame();
		loadWorld();
		this.reset();
		this.title = 2; this.titleMsg = MSG_WIN; this.titleT = TITLE_TIME;
	}

	// stomp from above = squish + bounce; any other contact = hurt (big: shrink, small: die). returns true if Mario was hurt
	// while flickering after a hit he passes straight through goombas
	touchGoombas() {
		if (this.inv > 0) return false;
		for (const g of $.goombas) {
			if (g.state !== 1) continue;
			if (Math.abs(this.x - g.x) < HW + GHW && this.y > g.y - GH && this.y - this.h < g.y) {
				if (this.star > 0) {                         // starman: touching a goomba knocks it off the screen
					g.state = 4;
					g.vy = KNOCK_VY;
					g.vx = (g.x >= this.x ? 1 : -1) * KNOCK_VX;
					this.addScore(GOOMBA_SCORE, g.x, g.y - GH);
				} else if (this.vy > 0 && this.y < g.y - 6) {
					g.state = 2; g.t = SQUISH;
					const n = this.stomp++;                        // chain: 100, 200, 400 ... then 1-UP
					if (n < STOMP_SCORES.length) this.addScore(STOMP_SCORES[n], g.x, g.y - GH); else this.addLife(g.x, g.y - GH);
					this.vy = -4; this.holdG = 0.125; this.fallG = 0.4375; this.g = this.holdG;   // bounce (holding jump = higher)
					this.onGround = false;
				} else {
					this.hurt();
					return true;
				}
			}
		}
		return false;
	}

	// item pickup. Mushroom: 1000 points, and small Mario grows. Star: 1000 points and a few seconds of invincibility.
	// returns true if a grow started
	touchItems() {
		for (const u of $.items) {
			if (u.kind === COIN || u.state !== 1) continue;   // coins can't be grabbed; nothing can be grabbed while still rising
			if (Math.abs(this.x - u.x) < HW + MUSH_HW && this.y > u.y - 16 && this.y - this.h < u.y) {
				u.state = 3;
				if (u.kind === STAR) {
					this.addScore(STAR_SCORE, u.x, u.y - 16);
					this.star = STAR_TIME;
				} else if (u.oneup) {
					this.addLife(u.x, u.y - 16);                   // 1-UP mushroom: extra life, no growing
				} else {
					this.addScore(MUSH_SCORE, u.x, u.y - 16);
					if (!this.big) { this.startMorph(1); return true; }
				}
			}
		}
		return false;
	}

	step(dir, run, jump, duck) {
		// --- timer: 1 unit every 24 frames ---
		if (++this.tick >= 24) {
			this.tick = 0;
			if (this.time > 0) this.time--;
		}
		this.low = this.time < LOW_TIME;
		if (this.inv > 0) this.inv--;
		if (this.star > 0) this.star--;
		if (this.time <= 0) { this.timeUp = true; this.startDeath(); return; }   // out of time

		// --- duck (big Mario only): hold the stick down on the ground. He can't walk while ducked, he slides to a stop,
		// and he stays ducked while there is a low ceiling above him ---
		if (this.big) {
			if (duck && this.onGround) this.ducking = true;
			else if (!duck && this.ducking && !solid(this.x - HW + 1, this.y - 20) && !solid(this.x + HW - 1, this.y - 20)) this.ducking = false;
		} else this.ducking = false;
		this.h = (this.big && !this.ducking) ? BIG_HEIGHT : HEIGHT;
		if (this.ducking && this.onGround) dir = 0;

		const maxV = run ? 2.5625 : 1.5625;
		const accel = run ? 0.0556640625 : 0.037109375;
		const decel = 0.05078125, skid = 0.1015625;

		// --- horizontal ---
		if (dir !== 0) {
			if (this.onGround) this.facing = dir;
			if (this.vx !== 0 && Math.sign(this.vx) !== dir && this.onGround) {
				this.vx += dir * skid;
			} else {
				if (this.vx === 0) this.vx = dir * 0.0742;
				this.vx += dir * accel;
				if (Math.abs(this.vx) > maxV) {
					const over = Math.abs(this.vx) - decel;
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
			const ax = Math.abs(this.vx);
			if (ax < 1.0)         { this.vy = -4; this.holdG = 0.125;     this.fallG = 0.4375; }
			else if (ax < 2.3125) { this.vy = -4; this.holdG = 0.1171875; this.fallG = 0.375;  }
			else                  { this.vy = -5; this.holdG = 0.15625;   this.fallG = 0.5625; }
			this.g = this.holdG;
			this.onGround = false;
		}

		// --- move X, resolve against side tiles ---
		this.x += this.vx;
		if (this.vx !== 0) {
			const d = Math.sign(this.vx), edge = this.x + d * HW;
			if (solid(edge, this.y - 1) || solid(edge, this.y - 8) ||
			    (this.h > HEIGHT && solid(edge, this.y - 20)) || solid(edge, this.y - this.h + 2)) {
				const c = Math.floor(edge / TILE);
				this.x = d > 0 ? c * TILE - HW : (c + 1) * TILE + HW;
				this.vx = 0;
			}
		}

		// --- walked off a ledge? ---
		if (this.onGround && !solid(this.x - HW + 1, this.y + 1) && !solid(this.x + HW - 1, this.y + 1)) {
			this.onGround = false;
			this.g = this.fallG = GRAVITY;
		}

		// --- move Y, THEN apply gravity (SMB order), then resolve ---
		const prevY = this.y;
		this.y += this.vy;
		if (!this.onGround) {
			if (!jump) this.g = this.fallG;                    // releasing = stronger gravity
			this.vy = Math.min(this.vy + this.g, TERMINAL_VY);
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
			const hr = Math.floor((this.y - this.h - TOP) / TILE);
			const hBottom = TOP + (hr + 1) * TILE;
			if (hr >= 0 && hr < ROWS && prevY - this.h >= hBottom) {
				const hrow = $.level[hr];
				let hc = Math.floor(this.x / TILE);                          // the tile above his head centre, else under his left or right edge
				if (hrow[hc] !== "H") hc = Math.floor((this.x - HW + 1) / TILE);
				if (hrow[hc] !== "H") hc = Math.floor((this.x + HW - 1) / TILE);
				if (hrow[hc] === "H") {
					hrow[hc] = "U";                                          // becomes a used block, now solid
					const hb = $.blocks.list[$.blocks.idx[`${hc},${hr}`]];
					if (hb) {
						hb.revealed = true; hb.used = true; hb.t = BUMP; activate(hb);
						$.items.push(Entity.makePowerup(MUSHROOM, hb, true));   // green 1-UP mushroom rises out of the block
					} else {
						this.addLife(hc * TILE + TILE / 2, TOP + hr * TILE - 4);   // fallback: no block entity found
					}
				}
			}

			if (solid(this.x - HW + 1, this.y - this.h) || solid(this.x + HW - 1, this.y - this.h)) {
				const r = Math.floor((this.y - this.h - TOP) / TILE);
				this.y = TOP + (r + 1) * TILE + this.h;                    // bonk head
				this.vy = 0;

				// block hit: decided by the tile above his head center
				const bc = Math.floor(this.x / TILE);
				const ch = $.level[r][bc];
				if (ch === "?") {
					hitBlock(this, bc, r);                       // releases what is inside + starts the bump
				} else if (ch === "B") {
					const bk = $.blocks.list[$.blocks.idx[`${bc},${r}`]];
					if (bk && bk.content) {
						hitBlock(this, bc, r);                   // multi-coin / star brick: never breaks
					} else if (this.big) {                         // big Mario smashes the brick
						$.level[r][bc] = ".";
						const bb = hitBlock(this, bc, r);
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

		if (this.y > TOP + ROWS * TILE + this.h) { this.die(); return; }   // fell in a pit
		if (this.touchGoombas()) return;                                   // stomped, or hurt by a goomba (big: shrink, small: die)
		if (this.touchItems()) return;                                     // grabbed a mushroom while small: grow

		if (this.x >= MIDWAY_COL * TILE) this.checkpoint = true;           // passed the midway point
		if (this.x + HW >= POLE_X - GRAB_REACH) { this.startEnd(); this.follow(); return; }   // touched the flagpole

		// --- camera: forward only, stops at the end of the level ---
		this.follow();

		this.animate(dir);
	}
}

// ---------- INIT ----------
if ($.mario === undefined || $.mario.ver !== VERSION || $.level === undefined || $.entities === undefined || $.popups === undefined || $.flag === undefined || $.cflag === undefined || $.items === undefined) {
	loadWorld();
	$.mario = new Mario();
}
const m = $.mario;

// ---------- INPUT: this layer's own position ----------
const HOME_X = thisComp.width / 2;     // horizontal middle of the screen
const HOME_Y = thisComp.height / 2;    // vertical middle of the screen
const dx = (value[0] - HOME_X) * X_GAIN;
const dy = value[1] - HOME_Y;
const dead = thisComp.width * 0.05;
const dir = dx > dead ? 1 : (dx < -dead ? -1 : 0);
const run = Math.abs(dx) > thisComp.width * 0.3;
const down = dy > thisComp.height * HOLD_DOWN;    // joystick held low in the air = jump released (heavier gravity)
const duck = dy > thisComp.height * DUCK_DOWN;   // joystick held well below centre: big Mario ducks (on the ground)
const jump = dy < -thisComp.height * HOLD_UP;   // joystick held up: keeps the jump going (higher hop). Starting a jump needs a flick, see below

// ---------- FIXED TIMESTEP (clamped) ----------
const now = Date.now();
let dt = now - m.last;
m.last = now;

if (dt > 100) dt = STEP;                 // long idle: discard it, resume as a single frame
m.acc += Math.min(dt, STEP * 3);         // never bank more than 3 steps of time

// start screen: ANY joystick movement on even a single evaluation dismisses it. Uses START_MOVE, not the
// walking deadzone, and sits outside the step loop so a frame that banks less than one step can't miss it
if (m.title === 1 && (Math.abs(dx) > START_MOVE || Math.abs(dy) > START_MOVE)) { m.title = 0; }

// flick up = jump: a fast upward move of the joystick within one evaluation (only while actually playing)
if (m.prevDy === undefined) m.prevDy = dy;
// (coming up out of the duck zone only counts as a jump if the stick really ends above centre; just letting go of a duck must not jump)
if (m.title === 0 && !m.dying && m.end === 0 && m.morph === 0 && dy - m.prevDy <= -FLICK_DELTA && (m.prevDy <= thisComp.height * DUCK_DOWN || jump)) {
	m.jumpBuf = JUMP_BUFFER;
	m.jumpHold = FLICK_HOLD;
	m.cut = false;                                   // a fresh jump
}
// flick down = let go of the jump: heavier gravity for the rest of this airtime, so the hop is cut short
if (m.title === 0 && !m.dying && m.end === 0 && m.morph === 0 && dy - m.prevDy >= FLICK_DELTA) {
	m.cut = true;
	m.jumpHold = 0;
}
m.prevDy = dy;

let steps = 0;
while (m.acc >= STEP && steps < 3) {     // hard limit per evaluation
	m.acc -= STEP;
	m.clock++;
	if (m.title === 2) {                 // death screen: timed
		if (--m.titleT <= 0) { m.title = 0; }
	}
	if (m.title === 0) {                 // game is frozen while the screen shows
		if (m.dying) {
			m.deathStep();               // only Mario moves during the death animation
		} else if (m.morph > 0) {
			m.morphStep();               // growing / shrinking: everything freezes except the score popups
			tickPopups();
		} else if (m.end > 0) {
			m.endStep();                 // flagpole / castle / time bonus: scripted, joystick ignored
			tickEntities(m);
			tickPopups();
		} else {
			if (m.jumpHold > 0) m.jumpHold--;
			if (m.onGround) m.cut = false;               // cut only lasts for one airtime
			m.step(dir, run, (m.jumpHold > 0 || (jump && !down)) && !m.cut, duck);   // a flick holds the jump wherever the stick is
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
$.qf = questionFrame();                          // one shade for every ? block this evaluation
const camL = m.camX - TILE, camR = m.camX + thisComp.width + TILE;
const c0 = Math.max(0, Math.floor(camL / TILE) - 1), c1 = Math.min(W, Math.ceil(camR / TILE) + 1);   // block columns near the camera
const inView = en => en.shown() && en.x + TILE / 2 > camL && en.x - TILE / 2 < camR;
const ve = [...$.blocks.list.slice($.colStart[c0], $.colStart[c1]), ...$.entities].filter(inView);   // blocks, goombas, flags
const mv = $.items.filter(inView);               // items (mushrooms, stars, coin pops), kept apart so they get the first (or last) layers
$.visEntities = BEHIND_HIGH_INDEX ? [...ve, ...mv] : [...mv, ...ve];
$.visEntities.forEach(en => en.refresh());
m.spr = m.sprite();                              // frame for the Mario layer's time remap

value;

// MARIO
$.mario ? [$.mario.x - $.mario.camX, $.mario.y] : value;

// MARIO HUE
$.mario && $.mario.star > 0 ? ($.mario.star * 24) % 360 : 0;

// MARIO LAYER SETUP: the Mario precomp is 16x32 (layer anchor [8, 32] = his feet). Small Mario is drawn in the BOTTOM 16 px.
// MARIO TIME REMAP (small: 0 idle, 1-3 walk, 4 skid, 5 jump, 6 death, 7-8 flagpole climb
//                   big:   9 idle, 10-12 walk, 13 skid, 14 jump, 16-17 flagpole climb, 18 duck (bottom 16 px)
//                   15 = in-between size, shown while growing / shrinking)
// guarded: $.mario can be missing, stale (old VERSION without .spr) or not evaluated yet, so force a finite number
let f = 0;
if ($.mario && $.mario.spr !== undefined && $.mario.spr !== null) { f = Number($.mario.spr); if (!isFinite(f)) f = 0; }
framesToTime(f);

// MARIO SCALE (flips horizontally with facing)
$.mario ? [$.mario.facing * 100, 100] : [100, 100];

// TIME (Source Text; flashes red below LOW_TIME, needs After Effects 2020 / v17+ for setFillColor)
const m = $.mario;
const str = `TIME\n${m ? String(m.time).padStart(3, "0") : "400"}`;
if (m && m.low && m.tick < 12) {                 // red for half of each timer unit (12 of 24 steps), base colour otherwise
	text.sourceText.createStyle().setFillColor([1, 0.2, 0.2]).setText(str);
} else {
	str;
}

// COINS
$.mario ? `x${String($.mario.coins).padStart(2, "0")}` : "x00";

// SCORE
`MARIO\n${$.mario ? String($.mario.score).padStart(6, "0").slice(-6) : "000000"}`;

// LIVES
`LIVES\nx${$.mario ? $.mario.lives : 3}`;

// COURSE
const BASE_X = 1792, BASE_Y = 120;
$.mario ? [BASE_X - $.mario.camX, BASE_Y] : value;

// ENTITY LAYERS: 30 duplicates (ENTITY_POOL) of ONE 16x16 precomp named "Entity 1" ... "Entity 30", anchor [8, 8]
// precomp frames: 0 brick, 1 ? block, 2 used block, 3-4 goomba walk cycle, 5 goomba squished, 6 flagpole flag, 7 mushroom, 17 green 1-UP mushroom,
// 8-9 ? block shades (frame 1 = bright, 8 = mid, 9 = dark), 10-13 coin spin, 14-15 star
// Mushrooms, stars and coin pops take the lowest entity numbers (BEHIND_HIGH_INDEX = false), so "Entity 1" must sit at the BOTTOM of the entity layers
// (Entity 30 at the top), otherwise a rising mushroom would be drawn in front of its block.
// (Entity N shows entry N-1 of $.visEntities, whatever block, goomba or the flag is on screen; paste each expression onto every entity layer)

// ENTITY POSITION (centre of the sprite; bump offset lifts blocks)
const m = $.mario;
const e = ($.slots && $.visEntities) ? $.visEntities[$.slots[thisLayer.name]] : null;
(m && e) ? [e.x - m.camX, e.y - e.off - 8] : value;

// ENTITY TIME REMAP
const e = ($.slots && $.visEntities) ? $.visEntities[$.slots[thisLayer.name]] : null;
let f = 0;
if (e && e.frame !== undefined && e.frame !== null) { f = Number(e.frame); if (!isFinite(f)) f = 0; }
framesToTime(f);

// ENTITY OPACITY (0% when the layer has no entity assigned)
const e = ($.slots && $.visEntities) ? $.visEntities[$.slots[thisLayer.name]] : null;
e ? 100 : 0;

// ENTITY SCALE (flips upside down when a goomba is knocked off a block)
const e = ($.slots && $.visEntities) ? $.visEntities[$.slots[thisLayer.name]] : null;
(e && e.flip) ? [100, -100] : [100, 100];

// TITLE SCREEN: a black solid named "Title Black", ABOVE the gameplay layers but BELOW the HUD text layers

// TITLE TEXT SOURCE TEXT (the label on the black screen: "Move joystick to play!" / "Game over!" / "Time up!" / "You win!" / "x lives remaining!")
($.mario && $.mario.titleMsg !== undefined) ? $.mario.titleMsg : "Move joystick to play!";

// TITLE TEXT OPACITY (only while the black screen shows, and only if there is something to say)
($.mario && $.mario.title === 0) ? 0 : (($.mario && !$.mario.titleMsg) ? 0 : 100);

// TITLE BLACK OPACITY
($.mario && $.mario.title === 0) ? 0 : 100;      // only hidden once the game says play has started; undefined = fully opaque

// ---------- SCORE POPUP TEXT LAYERS ----------
// 3 (POPUP_POOL) text layers named "Popup 1", "Popup 2", "Popup 3". Set each one's paragraph to CENTER justified,
// so the Position below is the middle of the number. Paste each expression onto every popup layer.

// POPUP SOURCE TEXT
const p = ($.slots && $.popups) ? $.popups[$.slots[thisLayer.name]] : null;
(p && p.t > 0) ? p.str : "";

// POPUP POSITION
const p = ($.slots && $.popups) ? $.popups[$.slots[thisLayer.name]] : null;
($.mario && p && p.t > 0) ? [p.x - $.mario.camX, p.y] : value;

// POPUP OPACITY
const p = ($.slots && $.popups) ? $.popups[$.slots[thisLayer.name]] : null;
(p && p.t > 0) ? 100 : 0;

// ---------- ENDING LAYERS ----------

// MARIO OPACITY (hidden once he disappears into the castle door; flickers while invulnerable after a hit: 4-step blink)
const m = $.mario;
(m && (m.hidden || (m.inv > 0 && m.inv % 4 < 2))) ? 0 : 100;