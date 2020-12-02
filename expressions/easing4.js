// Easing thanks to Tim on /r/AfterEffects Discord (https://webkit.org/demos/spring/spring.js)
function spring(t, mass = 1, stiffness = 100, damping = 10, initialVelocity = 0) {
	this.m_w0 = Math.sqrt(stiffness / mass);
	this.m_zeta = damping / (2 * Math.sqrt(stiffness * mass));
	if (this.m_zeta < 1) {
		// Under-damped
		this.m_wd = this.m_w0 * Math.sqrt(1 - this.m_zeta * this.m_zeta);
		this.m_A = 1;
		this.m_B = (this.m_zeta * this.m_w0 + -initialVelocity) / this.m_wd;
		t = Math.exp(-t * this.m_zeta * this.m_w0) * (this.m_A * Math.cos(this.m_wd * t) + this.m_B * Math.sin(this.m_wd * t));
	} else {
		// Critically damped (ignoring over-damped case for now).
		this.m_wd = 0;
		this.m_A = 1;
		this.m_B = -initialVelocity + this.m_w0;
		t = (this.m_A + this.m_B * t) * Math.exp(-t * this.m_w0);
	}
	// Map range from [1..0] to [0..1].
	return 1 - t;
}

function springEasing(t, tMin, tMax, value1, value2, mass, stiffness, damping, initialVelocity) {
	var limitedT = Math.max(tMin, Math.min(t, tMax));
	var normal = (limitedT - tMin) / (tMax - tMin);
	var eased = spring(normal, mass, stiffness, damping, initialVelocity);
	return (1 - eased) * value1 + eased * value2;
}

// EXAMPLE USAGE:
springEasing(time, 0, 1, [0, 0], [960, 540], 1, 100, 10, 0);