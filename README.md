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

Many consider this impossible, but I found the following exploits:

### Exploit 1: Variable Leaking (JavaScript only)

I discovered variable names aren't properly deleted by After Effects until it gets restarted.
```javascript
// Read all variable names
Object.keys(this);
```

`Object.keys(this)` reads variable names, but not values. Therefore to store values, I put them in the name itself.

```javascript
// Write a variable named "leak"
var leak;

// Write a variable named "leak_5"
var leak_5;

// Write any variable name you want
const name = "hello";
eval(`var ${name}`);

// Add a "leak_" prefix to identify which variables we own
eval(`var leak_${name}`);
```

```javascript
// Read all variable names (shared between all expressions)
Object.keys(this);

// Returns ["leak", "leak_5", "hello", "leak_hello"] among others
```

Using this concept, you can store multiple types of data in one variable name.

```javascript
// Write 2 values into a single name
const writeX = 5;
const writeY = "hi";

eval(`var leak_${writeX}_${writeY}`);
```

```javascript
// Read values by splitting
const parts = Object.keys(this).pop().split("_"); // ["leak", "5", "hi"]

const readX = parseInt(parts[1]); // 5
const readY = parts[2]; // "hi"
```

You can also delete variable names like so:

```javascript
// Delete variable named "leak_5_hi"
delete leak_5_hi;
```

There are many characters not allowed in variable names, so [you have to be creative](projects/PONG/PONG.js#L92-L100).

### Exploit 2: The Debug Object (Both)

[@stibinator](https://github.com/stibinator) discovered the debug object `$`.

`$` allows any type of data to be stored.

```javascript
// Write number
$.leak = 5;

// Read number
$.leak; // 5

// Write complex data
$.leak2 = [
    {
        name: "Jeff",
        age: 20
    },
    {
        name: "Joe",
        age: 1
    }
];

// Read complex data
$.leak2; // [{ name: "Jeff", age: 20 }, { name: "Joe", age: 1 }]

// Write using a custom key
const key = "leak3";
$[key] = 123;

// Read using a custom key
$[key]; // 123
```

It also works in ExtendScript, though `Object.keys(this)` does not.

### Exploit 3: Environment Variables (ExtendScript only)

I discovered the ExtendScript expression engine has the ability to [set environment variables](https://extendscript.docsforadobe.dev/extendscript-tools-features/dollar-object.html#setenv).<br>
```javascript
$.setenv(key, value);
```

However it only stores strings.

```javascript
$.setenv("leak", 5);
$.getenv("leak"); // "5"
```

### Summary

|Exploit|Engine|Capable of storing|Set|Get|
|:---|:---|:---|:--|:--|
|Variable leaking|JavaScript|Strings (excluding special characters)|```eval(`var ${x}`)```|`Object.keys(this)`|
|The debug object|Both|Anything|`$.key = value`|`$.key`|
|Environment variables|ExtendScript|Strings|`$.setenv(key, value)`|`$.getenv(key)`|
