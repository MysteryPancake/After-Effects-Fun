# After Effects Fun
Expressions, scripts and projects for Adobe After Effects.

Usually created by myself or others on the [/r/AfterEffects Discord](http://discord.gg/aftereffects).

## Projects
These were made using [custom exploits](#break)!

[Playable Pong (JavaScript only)](projects/PONG)

[<img src="images/PongDemo.gif?raw=true" width="320" alt="Pong demo">](https://youtu.be/3HMT1M9F5yA)

[Drawing (JavaScript only)](projects/DRAW)

[<img src="images/DrawDemo.gif?raw=true" width="320" alt="Drawing demo">](https://youtu.be/XxiwhegTduI)

## Expressions

[Limitless linear](expressions/linear.js)

[<img src="images/LinearDemo.gif?raw=true" width="320" alt="Limitless linear demo">](expressions/linear.js)

[Custom easings](expressions/easing2.js)

[<img src="images/EasingDemo.gif?raw=true" width="320" alt="Easings reference">](https://youtu.be/6qnkLmMJ2AE)
[![Easings demo](https://img.youtube.com/vi/jy5WZwaGMhY/mqdefault.jpg)](https://youtu.be/jy5WZwaGMhY)

[Spring easing](expressions/easing4.js)

[<img src="images/SpringDemo.gif?raw=true" width="320" alt="Spring easing demo">](expressions/easing4.js)

[Path rotation](expressions/pathRotation.js)

[![Path rotation demo](https://img.youtube.com/vi/_G5AHLrX-jU/mqdefault.jpg)](https://youtu.be/_G5AHLrX-jU)

[Spiral path](expressions/spiralPath.js)

[<img src="images/SpiralDemo.gif?raw=true" width="320" alt="Spiral path demo">](expressions/spiralPath.js)

[Camera snapping](expressions/cameraSnap.js)

[![Camera snapping demo](https://img.youtube.com/vi/VJOOgkROCwU/mqdefault.jpg)](https://youtu.be/VJOOgkROCwU)

## Tools
[Image to expression converter](https://mysterypancake.github.io/After-Effects-Fun/tools/imagetoexpression)

[![Expression converter](https://img.youtube.com/vi/sEwBKQni7kU/mqdefault.jpg)](https://youtu.be/sEwBKQni7kU)
[![Expression demo](https://img.youtube.com/vi/OfXQXMyMp-U/mqdefault.jpg)](https://youtu.be/OfXQXMyMp-U)

<a name="break"></a>
## Global Variable Exploits

**WARNING: These are all unpredictable to work with!**

To have fun in After Effects, I often need to store data in memory and share it between expressions.

Often this is considered impossible, but there are several ways to do it:

### 1. Variable Leaking (JavaScript only)

I discovered variable names aren't properly deleted by After Effects:
```javascript
// Write a variable named "leak"
var leak = 5;

// Read all variable names
Object.keys(this); // ["leak"] (among others)
```

Variable names are shared between all expressions, and remain in memory until After Effects is restarted.

[`Object.keys(this)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) reads variable names, but not values. Therefore to store values, I put them in the name itself:

```javascript
// Write a variable named "leak_5"
var leak_5;
```

[`eval()`](https://www.w3schools.com/jsref/jsref_eval.asp) allows dynamic variable names:

```javascript
// Write any variable name you want
const name = "hello";
eval(`var ${name}`);
```

To tell whether a variable is built-in, you can add a prefix:

```javascript
// Add a "leak_" prefix to identify custom variables
const data = "hello";
eval(`var leak_${data}`);
```

```javascript
// Read all variable names
Object.keys(this); // ["leak", "leak_5", "hello", "leak_hello"] (among others)
```

Using this concept, you can store multiple types of data in one variable name:

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

You can delete variable names like so:

```javascript
// Delete variable named "leak_5_hi"
delete leak_5_hi;
```

[Many characters aren't allowed in variable names](https://www.dummies.com/web-design-development/javascript/naming-javascript-variables/), so [you have to be creative](projects/PONG/PONG.js#L92-L100).

### 2. The Debug Object (JavaScript + ExtendScript)

[@stibinator](https://github.com/stibinator) [told me](https://blob.pureandapplied.com.au/the-global-object-in-after-effects/) about the [debug object `$`](https://helpx.adobe.com/cy_en/after-effects/using/legacy-and-extend-script-engine.html#dollar-object).

`$` is shared between all expressions, and remains in memory until After Effects is restarted.

```javascript
// Write number
$.leak = 5;

// Read number
$.leak; // 5
```

[`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) works on `$`:

```javascript
// Read all keys
Object.keys($); // [{ leak: 5 }] (among others)
```

`$` allows any type of data to be stored:

```javascript
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
```

`$` allows custom keys:

```javascript
// Write using a custom key
const key = "leak3";
$[key] = 123;

// Read using a custom key
$[key]; // 123
```

`$` also works in ExtendScript, but `Object.keys` doesn't.

### 3. Environment Variables (ExtendScript only)

I discovered ExtendScript has a method which [sets environment variables](https://extendscript.docsforadobe.dev/extendscript-tools-features/dollar-object.html#setenv):
```javascript
$.setenv(key, value);
```

However it only writes string values:

```javascript
$.setenv("leak", 5);
$.getenv("leak"); // "5"
```

### Summary

|Exploit|Engine|Get|Set|Capable of storing|
|:---|:---|:---|:--|:--|
|Variable leaking|JavaScript|`Object.keys(this)`|```eval(`var ${value}`)```|Strings (excluding special characters)|
|The debug object|Both|`$.key`|`$.key = value`|Anything|
|Environment variables|ExtendScript|`$.getenv(key)`|`$.setenv(key, value)`|Strings|
