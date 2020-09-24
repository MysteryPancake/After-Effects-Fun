/**
 * Converts a position expressed in polar coordinates as
 * cartesian x & y coordinates.
 * 
 * @param {Number} distance The radius from the center point.
 * @param {Number} angle The angle theta in radians.
 * @return An object with the properties x and y.
 */
const polarToCartesian = ({distance = 100, angle = 0} = {}) => ({x : distance * Math.cos(angle), y : distance * Math.sin(angle)})

// Example:
polarToCartesian({distance : 10, angle : Math.PI})
