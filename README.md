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

### Exploit 1: Variable Leaking

I discovered variable names aren't properly deleted by After Effects.<br>
You can test this by running `Object.keys(this)` in the JavaScript expression engine.

`Object.keys(this)` reads all current variable names, but not values.<br>
Therefore to store values, I put the value in the name itself.

`eval("var leak")` means you write a variable named `"leak"`.<br>
`eval("var leak_5")` means you write a variable named `"leak_5"`<br>
`eval("var leak_" + x)` means you can write anything you want to store.

For example, if x was 530, you get `"leak_530"`, then split it into `"leak"` and `"530"`.

I added `"leak_"` to the variable name so I can tell which variables aren't built-in.

Using this idea, you can store all kinds of data in the variable name itself.<br>
However, there are many limits to storing values in names, so you have to be creative.

### Exploit 2: The Debug Object $

Later [@stibinator](https://github.com/stibinator) informed me of his discovery: the debug object (`$`).

`$` allows any form of data to be stored, including objects and arrays.<br>
For example, `$.leak = 5` instead of `eval("var leak_5")`.

This is an extremely powerful and flexible method.

### Exploit 3: Environment Variables

Later I discovered the ExtendScript expression engine has the ability to [set environment variables](https://extendscript.docsforadobe.dev/extendscript-tools-features/dollar-object.html#setenv).<br>
```javascript
$.setenv(key, value)
```

However it only allows strings to be stored.

### Summary

There are 3 options for storing global variables:

|Exploit|Expression engine|Capable of storing|
|:---|:---|:---|:---|:---|
|Variable leaking|JavaScript|Strings, excluding special characters|
|The debug object|Both|All types of data|
|Environment variables|ExtendScript|Strings|

#### 1. Variable leaking

```javascript
// Set value
var str = "hello_this_is_global";
eval(`var ${str}`);
```

```javascript
// Get value
Object.keys(this).pop();
```

#### 2. The debug object

```javascript
// Set value
$.str = "hello_this_is_global";
```

```javascript
// Get value
$.str;
```

#### 3. Environment variables

```javascript
// Set value
$.setenv("str", "hello_this_is_global");
```

```javascript
// Get value
$.getenv("str");
```
