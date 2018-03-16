/** -------------------------------------------------------------------------------------------------------------------
 * make.js
 */

/**
 * make(path, rel)
 */
var makeFile = function (calc) {
  calc = this.eval("(function(){with(arguments[0])return eval(arguments[1])})");

  function makeFile(path, rel, includes, defines, variables, indent) {
    var code;
    path = incpath(path, rel);
    if (includes[path]) {
      code = '';
    }
    else {
      includes[path] = 1;    // 占位符，防止无限递归
      code = get(path);
      if (code)
        try {
          code = makeCode(code, path, includes, defines, variables, indent);
        }
        catch (e) {
          if (e instanceof MacroError)
            e = Error(e.message + ' at (' + path + ':' + rowcol(code, e.index) + ')');
          throw e;
        }
    }
    return code;
  }

  function makeCode(code, rel, includes, defines, variables, indent) {
    var lex = Lex(code), $ = Lex.$, token, codes = [], id, it;
    var skip = 0;
    while (token = lex()) {
      var s = token[0];
      if (!s) {
        if (token.index < code.length)
          throw new MacroError('Unknown token', token.index);
        break;
      }

      if (token[$.IF]) {
        if (skip) {
          skip++;
        }
        else {
          it = token[$.COND];
          try {
            if (!calc(variables, it))
              skip = 1;
          }
          catch (e) {
            skip = 1;
          }
        }
        continue;
      }
      if (token[$.END]) {
        if(skip>0)
          skip --;
        continue;
      }
      if (skip) continue;

      if (token[$.INCLUDE]) {
        var file = token[$.FILE];
        // if (file = makeFile(file, rel, includes, defines, variables, indentOf(code, token.index)))
        //   s = file;
        s = makeFile(file, rel, includes, defines, variables, indentOf(code, token.index));
      }
      else if (token[$.DEFINE]) {
        id = token[$.DID];
        if (it = token[$.VAL]) {
          it = it.trim();
        }
        else if (it = token[$.RES]) {
          it = repath(it, rel);
          try {
            s = get(it);
            if (s === undefined)
              throw Error("Read file error: " + it);
          }
          catch (e) {
            throw new MacroError(e.message, token.index);
          }
          it = JSON.stringify(s);
        }
        else if (it = token[$.EXP]) {
          it = calc(variables, it);
        }
        defines[id] = variables[id] = it;
        s = "//const " + id + " = " + String(it);
      }
      else if (token[$.VAR]) {
        id = token[$.VID];
        it = token[$.VEXP];
        it = calc(variables, it);
        variables[id] = it;
        s = "//var " + id + " = " + String(it);
      }
      else if (id = token[$.ID]) {
        if (id in defines) {
          s = "/*" + id + "*/" + String(defines[id]);
        }
      }
      else if (token[$.BLOCK_HEAD]) {
        includes = Object.create(includes);
        defines = Object.create(defines);
      }
      else if (token[$.BLOCK_TAIL]) {
        var proto = Object.getPrototypeOf(defines);
        if (proto) defines = proto;
        var proto = Object.getPrototypeOf(includes);
        if (proto) includes = proto;
      }
      codes[codes.length] = s;
    }
    code = codes.join('');
    code = code.replace(/^/gm, indent).slice(indent.length);
    return code;
  }

  function MacroError(message, index) {
    this.message = message;
    this.index = index;
  }

  function indentOf(text, index) {
    for (var i = index; ' \t'.indexOf(text[i - 1]) >= 0; i--);
    return text.slice(i, index);
  }

  /**
   * rowcol(text, i)
   *   计算文本 text 位置 i 的行列值。返回格式 "row:col"
   */
  function rowcol(text, index) {
    if (index < 0) return '<EOF>';
    var reLn = /[\n\u2028\u2029]|\r\n?/g;
    var row = 0, col = 0;
    while (reLn.exec(text) && index > reLn.lastIndex) {
      row++;
      col = reLn.lastIndex;
    }
    col = index - col;
    return (row + 1) + ':' + (col + 1);
  }

  return makeFile;
}();

