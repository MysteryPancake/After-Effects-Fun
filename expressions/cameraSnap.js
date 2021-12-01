// Script thanks to Jordan and Bak.R on the /r/AfterEffects Discord
// Changes the camera angle and position to line up exactly with a rectangular layer

var rect = thisComp.layer("Camera Control").effect("Other Layer")("Layer");
var scale = Math.max(rect.scale[0] / 100, rect.scale[1] / 100);
var size = Math.max(rect.width / thisComp.width, rect.height / thisComp.height);
toWorld(fromWorld(rect.position) - [0, 0, cameraOption.zoom * scale * size]);
