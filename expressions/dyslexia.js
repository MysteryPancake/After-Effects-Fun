var words = value.split(" ");

function ruin(word) {
	var final = "";
	var first = Math.floor(random(0, word.length));
	var second = Math.floor(random(0, word.length));
	for (var k = 0; k < word.length; k++) {
		if (first === k) {
			final += word[second];
		} else if (second === k) {
			final += word[first];
		} else {
			final += word[k];
		}
	}
	return final;
}

var result = "";
for (var j = 0; j < words.length; j++) {
	var word = words[j];
	for (var i = 0; i < time; i++) {
		word = ruin(word);
	}
	result += word + " ";
}

result;