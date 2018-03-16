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
