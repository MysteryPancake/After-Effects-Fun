// Expression 1: Store global variable with ExtendScript support

function setGlobal(key, val) {
	return $.engineName === "" ? $.setenv(key, val) : $[key] = val;
}

setGlobal("hello", 420);

// Expression 2: Retrieve global variable with ExtendScript support

function getGlobal(key) {
	return $.engineName === "" ? $.getenv(key) : $[key];
}

getGlobal("hello");
