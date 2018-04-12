# macrojs
JavaScript 宏处理工具。
## 简介
**macrojs** 提供 JavaScript 宏处理机制，支持轻量级的单元化编程机制。与 JS 模块化编程类似，**macrojs** 可以将多个 **.js** 文件，按照代码组织逻辑合并成单一的文件。 

与 JS 模块化机制不同的是，**macrojs** 提供代码块作用域级别的单元文件合并。对码单元块内依赖元素的引用，在合并后都是直接的引用或替换。因此，最终生成的代码会更加轻量和高效。  

## 安装
本地安装  
```
npm install --save-dev macrojs
```
全局安装
```
npm install -g macrojs
```
## 使用
### 命令行
命令行工具 **mjc** 可以将 **macrojs** 源文件编译合并成单一文件输出：
```
mjc [-d predefines ] <input> [<output>]
```

### 编程接口
若要在 JS 代码中使用，只需引入 **macrojs** 包。例如：
```js
var macrojs = require("macrojs");
...
var complieCode = macrojs("src/main.js");
...
```

## 宏语句
宏语句是以特定格式的 JavaScript 注释来表示，以兼容 JavaScript 语法。
### 宏引用
格式：
```js
//#include ./unit-name.js
/*#include ./unit-name.js */
```
例如：  
#### *`src/main.js`*
```js
//#include ./say.js

function main() {
  say("hello macrojs");
}
```
#### *`src/say.js`*
```js
function say(text) {
  console.log(text);
}
```
用 **mjc** 命令行工具编译：
```
mjc src/main.js out/index.js
```
编译后的结果：
#### *`out/index.js`*
```js
function say(text) {
  console.log(text);
}

function main() {
  say("hello macrojs");
}
```

### 宏定义
格式：
```js
//#define MACRO_NAME macro_code
/*#define MACRO_NAME macro_code */
```
例如：
```js
//#define MIN_AGE 18
/*#define MIN_AGE 70 */

function checkAge(age) {
  if(age < MIN_AGE) {
    console.log("You're so yong!");
  }
  else if(age >= MAX_AGE) {
    console.log("You're too old!");
  }
  else {
    console.log("It's you!");
  }
}
```
编译后：
```js
function checkAge(age) {
  if(age < 18) {
    console.log("You're so yong!");
  }
  else if(age >= 70) {
    console.log("You're too old!");
  }
  else {
    console.log("It's you!");
  }
}
```
其中的 `MIN_AGE` 和 `MAX_AGE` 都被替换为对应的即时值 `18` 和 `70`。  

## 宏作用域
**macrojs** 的宏语句是有作用域的。宏作用域与 JavaScript 的块级作用域类似，按大括号 `{` 和 `}` 的层次来隔离父作用域和子作用域。一个开括号 `{` 开始一个宏作用域，然后以配对的闭括号 `}` 结束一个宏作用域。如果在该宏作用域中又遇到一个开阔和 `{`, 则开始一个子作用域，并以其配对的闭括号 `}` 结束子作用域。  
### 单元文件的宏作用域
**macrojs** 的编译是从唯一的主单元文件（例如 main.js）开始的，该主单元再使用 `#include` 语句引入其他单元文件，并间接引入进一步依赖的更多单元文件。

从 **macrojs** 组织和编译单元文件的整体看，所有**不处于**处于任何 `{ ... }` 块的宏语句，都属于顶层宏作用域（根作用域），而不管这些宏语句原来属于哪个单元文件。

从本引入的单元文件角度看，其宏语句处于什么作用域，是与其被其他单元文件引入时的 `#include` 语句所处的宏作用域相关。

### #include 作用域行为
使用 `#include <path>` 语句引入 **path** 指定的单元文件时，相同单元文件（绝对路径相同）在同一个宏作用域内只会被引入一次，只有第一次碰到的 `#include` 有效。

然而，如果引入相同单元文件的宏语句处于不同的宏作用域时，各宏作用域将各自具有该单元文件的副本，即，相同单元文件能被不同宏作用域多次引入。

同样，如果上层作用域已经引入了某单元文件，则其子作用域再引入该单元文件的 #include 语句将不会重复引入。

这种**基于宏作用域的单元引入机制**，允许一个单元只关心其在什么地方需要引入其他单元，而不用担心单元是否重复引入的问题。

