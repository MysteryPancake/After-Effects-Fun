// Written for Wes on the /r/AfterEffects Discord

// Choose new number every 2 seconds
var numSeconds = 2;

// Get first random number
seedRandom(Math.floor(time / numSeconds), true);
var prevRand = [random(-300, 300), random(-300, 300)];

// Get second random number
seedRandom(Math.floor((time + numSeconds) / numSeconds), true);
var nextRand = [random(-300, 300), random(-300, 300)];

// Interpolate between them
value + linear(time % numSeconds, 0, numSeconds, prevRand, nextRand);
