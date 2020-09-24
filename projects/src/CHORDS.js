// ON SAMPLE

let bpm = thisComp.layer("MASTER").effect("Beats Per Minute")("Slider");
let delay = thisComp.layer("MASTER").effect("Sample Offset (seconds)")("Slider");
let beatSeconds = 60 / bpm;
let beatRate = (4 / effect("Rate")("Slider")) * beatSeconds;
((time % beatRate) * effect("Pitch")("Slider")) + delay;

// ON TONE

function getFrequency(note) {
    let notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
    let octave;
    let keyNumber;
    if (note.length === 3) {
        octave = note.charAt(2);
    } else {
        octave = note.charAt(1);
    }
    keyNumber = notes.indexOf(note.slice(0, -1));
    if (keyNumber < 3) {
        keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1; 
    } else {
        keyNumber = keyNumber + ((octave - 1) * 12) + 1; 
    }
    return 440 * Math.pow(2, (keyNumber- 49) / 12);
};
let notes = text.sourceText.split(" ");
let thisNote = notes[thisProperty.name.split(" ").pop()];
if (thisNote) {
	getFrequency(thisNote);
} else {
	0;
}
// Chords: A#3 F4 C#5 F5
// Chords: C#4 F4 C#5 F5 G#5
// Chords: C#4 A#4 F5 C#6
// Chords: C#4 G#4 D#5 C6