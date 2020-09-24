rect = thisComp.layer("Camera Control").effect("Other Layer")("Layer");
scale = Math.max(rect.scale[0]/100,rect.scale[1]/100);
size = Math.max(rect.width/thisComp.width,rect.height/thisComp.height);
toWorld(fromWorld(rect.position)-[0,0,cameraOption.zoom*scale*size]);
