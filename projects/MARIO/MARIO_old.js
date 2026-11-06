// WIPE ALL
delete $.mario;
delete $.joystick;
delete $.BG;

// MARIO
function Mario(x, y) {
	this.velX = 0;
	this.velY = 0;
	this.posX = x;
	this.posY = y;
	this.ground = 192;
	this.gravity = 2;
	this.jumping = false;
	this.update = function() {
		this.posX += this.velX;
		this.posY += this.velY;
		if (this.posX < 16) {
			this.posX = 16;
		}
		if (this.posY >= this.ground) {
			this.posY = this.ground;
			this.velY = 0;
			this.jumping = false;
		} else {
			this.velY += this.gravity;
		}
	};
	this.getPos = function() {
		return [this.posX, this.posY];
	};
	this.jump = function() {
		if (this.jumping) return;
		this.jumping = true;
		this.velY -= 10;
	}
}
if ($.mario === undefined) {
	$.mario = new Mario(position[0], position[1]);
}
$.mario.update();
$.mario.getPos();


// JOYSTICK
function Joystick() {
	this.update = function(x, y) {
		if (!$.mario) return;
		if (x > thisComp.width / 2) {
			$.mario.velX = 8;
		} else if (x < thisComp.width / 2) {
			$.mario.velX = -8;
		} else {
			$.mario.velX = 0;
		}
		if (y < thisComp.height / 2) {
			$.mario.jump();
		}
	};
}
if ($.joystick === undefined) {
	$.joystick = new Joystick();
}
$.joystick.update(position[0], position[1]);
value;

// BG
function BG() {
	this.x = 1792;
	this.y = 120;
	this.offset = 0;
	this.update = function() {
		//if (!$.mario) return;
		const xPos = thisComp.layer("Mario").position[0];
		if (xPos > 300) {
			this.offset = xPos - 300;
		}
	};
	this.getPos = function() {
		return [this.x - this.offset, this.y];
	};
}
if ($.BG === undefined) {
	$.BG = new BG();
}
$.BG.update();
$.BG.getPos();
