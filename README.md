# After Effects Fun
Expressions, scripts and projects for Adobe After Effects.

## Projects
[Playable Pong (JavaScript engine only)](projects/PONG)

[<img src="images/PongDemo.gif?raw=true" width="320" alt="Pong demo">](https://youtu.be/3HMT1M9F5yA)

[Drawing (JavaScript engine only)](projects/DRAW)

[<img src="images/DrawDemo.gif?raw=true" width="320" alt="Drawing demo">](https://youtu.be/XxiwhegTduI)

## Expressions

[Custom easings](expressions/easing2.js)

[<img src="images/EasingDemo.gif?raw=true" width="320" alt="Easings reference">](https://youtu.be/6qnkLmMJ2AE)
[![Easings demo](https://img.youtube.com/vi/jy5WZwaGMhY/mqdefault.jpg)](https://youtu.be/jy5WZwaGMhY)

[Spring easing](expressions/easing4.js)

[<img src="images/SpringDemo.gif?raw=true" width="320" alt="Spring easing demo">](expressions/easing4.js)

[Limitless linear](expressions/linear.js)

[<img src="images/LinearDemo.gif?raw=true" width="320" alt="Limitless linear demo">](expressions/linear.js)

[Path rotation](expressions/pathrotation.js)

[![Path rotation demo](https://img.youtube.com/vi/_G5AHLrX-jU/mqdefault.jpg)](https://youtu.be/_G5AHLrX-jU)

[Camera snapping](expressions/camerasnap.js)

[![Camera snapping demo](https://img.youtube.com/vi/VJOOgkROCwU/mqdefault.jpg)](https://youtu.be/VJOOgkROCwU)

## Tools
[Image to expression converter](https://mysterypancake.github.io/After-Effects-Fun/tools/imagetoexpression)

[![Expression converter](https://img.youtube.com/vi/sEwBKQni7kU/mqdefault.jpg)](https://youtu.be/sEwBKQni7kU)
[![Expression demo](https://img.youtube.com/vi/OfXQXMyMp-U/mqdefault.jpg)](https://youtu.be/OfXQXMyMp-U)

## Global Variables
To have fun in After Effects, I often need to store data in memory and share it between expressions.

Many consider this impossible, but I found many exploits to achieve this:

### Exploit 1: Variable Leaking (JavaScript)

I discovered variable names aren't properly deleted by After Effects.
```javascript
// Read all variable names
Object.keys(this);
```

`Object.keys(this)` reads all current variable names, but not values. Therefore to store values, I put the value in the name.

```javascript
// Write a variable named "leak"
var leak;

// Write a variable named "leak_5"
var leak_5;

// Write any variable name you want
var name = "hello";
eval(`var ${name}`);

// Add a "leak_" prefix to identify which variables we own
eval(`var leak_${value}`);

// Read all variable names (shared between all expressions)
Object.keys(this);

// Returns ["leak", "leak_5", "hello", "leak_hello"] among others
```

Using this concept, you can store all kinds of data in the variable name itself.

However there are many limits to storing values in names, so you have to be creative.

### Exploit 2: The Debug Object

Later [@stibinator](https://github.com/stibinator) informed me of the debug object `$`.

`$` allows any form of data to be stored, including objects and arrays.<br>

```javascript
// Store using variable leaking
var leak_5;
Object.keys(this).pop(); // "leak_5"

// Store using debug object
$.leak = 5;
$.leak; // 5
```

It also works in ExtendScript, although `Object.keys(this)` does not.

### Exploit 3: Environment Variables (ExtendScript)

Later I discovered the ExtendScript expression engine has the ability to [set environment variables](https://extendscript.docsforadobe.dev/extendscript-tools-features/dollar-object.html#setenv).<br>
```javascript
$.setenv(key, value)
```

However it only allows strings to be stored.

```javascript
$.setenv("leak", 5);
$.getenv("leak"); // "5"
```

### Summary

There are 3 options for storing global variables:

|Exploit|Expression engine|Capable of storing|Get|Set|
|:---|:---|:---|:--|:--|
|Variable leaking|JavaScript|Strings (excluding special characters)|`Object.keys(this)`|```eval(`var ${x}`)```|
|The debug object|Both|Anything|`$.key`|`$.key = value`|
|Environment variables|ExtendScript|Strings|`$.getenv(key)`|`$.setenv(key, value)`|
