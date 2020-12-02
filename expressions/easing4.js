// Easing thanks to Tim on /r/AfterEffects Discord (https://webkit.org/demos/spring/spring.js)
function spring(t, mass = 1, stiffness = 100, damping = 10, initialVelocity = 0) {
	var m_w0 = Math.sqrt(stiffness / mass);
	var m_zeta = damping / (2 * Math.sqrt(stiffness * mass));
	var m_A = 1;
	if (m_zeta < 1) {
		// Under-damped
		var m_wd = m_w0 * Math.sqrt(1 - m_zeta * m_zeta);
		var m_B = (m_zeta * m_w0 + -initialVelocity) / m_wd;
		// Map range from [1..0] to [0..1].
		return 1 - (Math.exp(-t * m_zeta * m_w0) * (m_A * Math.cos(m_wd * t) + m_B * Math.sin(m_wd * t)));
	} else {
		// Critically damped (ignoring over-damped case for now).
		var m_B = -initialVelocity + m_w0;
		// Map range from [1..0] to [0..1].
		return 1 - ((m_A + m_B * t) * Math.exp(-t * m_w0));
	}
}

function springEasing(t, tMin, tMax, value1, value2, mass, stiffness, damping, initialVelocity) {
	var normal = (t - tMin) / (tMax - tMin);
	var eased = spring(normal, mass, stiffness, damping, initialVelocity);
	return (1 - eased) * value1 + eased * value2;
}

// EXAMPLE USAGE:
springEasing(time, 0, 1, [0, 0], [960, 540], 1, 100, 10, 0);
