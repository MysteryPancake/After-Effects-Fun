posterizeTime(10);

var words = value.split(" ");

function punctuation(letter) {
	return ",.?!@#$%^&*()-_=+<>/\\|\"\'".indexOf(letter) !== -1;
}

function ruin(word) {
	var first = Math.floor(random(1, word.length - 1));
	var second = Math.floor(random(1, word.length - 1));
	var letters = word.split("");
	if (punctuation(letters[first]) || punctuation(letters[second])) return word;
	letters[first] = word[second];
	letters[second] = word[first];
	return letters.join("");
}

for (var i = 0; i < words.length; i++) {
	words[i] = ruin(words[i]);
}

words.join(" ");