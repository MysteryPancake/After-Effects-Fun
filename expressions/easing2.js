var EasingFunctions = {
	linear: function(t) {
		return t;
	},
	inQuad: function(t) {
		return t * t;
	},
	outQuad: function(t) {
		return t * (2 - t);
	},
	inOutQuad: function(t) {
		return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	},
	inCubic: function(t) {
		return t * t * t;
	},
	outCubic: function(t) {
		return (--t) * t * t + 1;
	},
	inOutCubic: function(t) {
		return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	},
	inQuart: function(t) {
		return t * t * t * t;
	},
	outQuart: function(t) {
		return 1 - (--t) * t * t * t;
	},
	inOutQuart: function(t) {
		return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
	},
	inQuint: function(t) {
		return t * t * t * t * t;
	},
	outQuint: function(t) {
		return 1 + (--t) * t * t * t * t;
	},
	inOutQuint: function(t) {
		return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
	},
	inSine: function(t) {
		return -1 * Math.cos(t / 1 * (Math.PI * 0.5)) + 1;
	},
	outSine: function(t) {
		return Math.sin(t / 1 * (Math.PI * 0.5));
	},
	inOutSine: function(t) {
		return -1 / 2 * (Math.cos(Math.PI * t) - 1);
	},
	inExpo: function(t) {
		return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
	},
	outExpo: function(t) {
		return (t === 1) ? 1 : (-Math.pow(2, -10 * t) + 1);
	},
	inOutExpo: function(t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
		return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
	},
	inCirc: function(t) {
		return -1 * (Math.sqrt(1 - t * t) - 1);
	},
	outCirc: function(t) {
		return Math.sqrt(1 - (t = t - 1) * t);
	},
	inOutCirc: function(t) {
		if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
		return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	inElastic: function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!p) p = 0.3;
		if (a < 1) {
			a = 1;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
	},
	outElastic: function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!p) p = 0.3;
		if (a < 1) {
			a = 1;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
	},
	inOutElastic: function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0) return 0;
		if ((t /= 1 / 2) === 2) return 1;
		if (!p) p = (0.3 * 1.5);
		if (a < 1) {
			a = 1;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
		if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},
	inBack: function(t, s) {
		if (s === undefined) s = 1.70158;
		return 1 * t * t * ((s + 1) * t - s);
	},
	outBack: function(t, s) {
		if (s === undefined) s = 1.70158;
		return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
	},
	inOutBack: function(t, s) {
		if (s === undefined) s = 1.70158;
		if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
		return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
	},
	inBounce: function(t) {
		return 1 - this.outBounce(1 - t);
	},
	outBounce: function(t) {
		if ((t /= 1) < (1 / 2.75)) {
			return (7.5625 * t * t);
		} else if (t < (2 / 2.75)) {
			return (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
		} else if (t < (2.5 / 2.75)) {
			return (7.5625 * (t -= (2.25 / 2.75)) * t + .9375);
		} else {
			return (7.5625 * (t -= (2.625 / 2.75)) * t + .984375);
		}
	},
	inOutBounce: function(t) {
		if (t < 1 / 2) return this.inBounce(t * 2) * 0.5;
		return this.outBounce(t * 2 - 1) * 0.5 + 0.5;
	}
};

function customEasing(name, t, tMin, tMax, value1, value2, s) {
	var limitedT = Math.max(tMin, Math.min(t, tMax));
	var normal = (limitedT - tMin) / (tMax - tMin);
	var eased = EasingFunctions[name](normal, s);
	return (value1 * (1 - eased)) + (value2 * eased);
}

// EXAMPLE USAGE:
customEasing("inOutQuad", time, 0, 1, [0, 0], [960, 540]);