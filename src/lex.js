/** -------------------------------------------------------------------------------------------------------------------
 * lex.js
 */

const Lex = function () {
  function $() { return arguments };

  function regular(any, keys) {
    if (any instanceof Object) {
      if (any instanceof RegExp) {
        any = any.source;
      }
      else if (any.length) {
        var arg = [];
        for (var i = 0; i < any.length; i++)
          arg[i] = regular(any[i], keys);
        // any = arg.join(any.join ? '' : '|');
        if (any.join) {
          any = arg.join('');
        }
        else {
          any = arg.join('|');
          if (arg.length > 1)
            any = '(?:' + any + ')';
        }
      }
      else {
        arg = String(Object.keys(any));
        keys[arg] = keys.$ = (keys.$ | 0) + 1;
        any = '(' + regular(any[arg], keys) + ')';
      }
    }
    else {
      any = String(any);
    }
    return any;
  }

  var keys = Object.create(null);
  var lex = regular($(
    { IF: [/\/\/#if\s*\(/, { COND: /[^)]+/ }, /\)\s*{.*\n?/] },
    { END: /\/\/#}.*\n?/ },
    { INCLUDE: [/\/\/#include\s+/, { FILE: /\S+/ }, /.*/] },
    { DEFINE: [/\/\/#define\s+/, { DID: /[a-zA-Z_$][\w$]*/ }, /\s*/, $([/@\s*/, { RES: /\S+/ }, /.*/], [/=\s*/, { EXP: /.+/ }], { VAL: /.+/ })] },
    { VAR: [/\/\/#var\s+/, { VID: /[a-zA-Z_$][\w$]*/ }, /\s*=\s*/, { VEXP: /.+/ }] },
    { TEMP_HEAD: [/`(?:[^`$\\]+|\$(?!{)|\\[^])*/, $(/`|$/, { TEMP_OPEN: /\${/ })] },  //模板头（容错）
    { TEMP_TAIL: [/}(?:[^`$\\]+|\$(?!{)|\\[^])*/, $(/\${/, { TEMP_CLOSE: /`|$/ })] },  //模板尾（容错）
    { BLOCK_HEAD: /\{/ },
    { BLOCK_TAIL: /\}/ },
    { FUNC: /(?:async\s+)?function\b[^(]*\([^)]*\)/ },
    { ARROW: /(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/ },
    { ID: /[a-zA-Z_$][\w$]*/ },
    { SQ: /'(?:[^'\n\\]+|\\[^])*(?:['\n]|$)/ },  // 单引号字符串（容错）
    { DQ: /"(?:[^"\n\\]+|\\[^])*(?:["\n]|$)/ },  // 双引号字符串（容错）
    { REGEXP: /\/(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\*\n\r])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\n\r])*?\/[gimy]*/ },
    { COMMENT: /\/\/.*|\/\*[^*]*\*+(?:[^/][^*]*\*+)*\// },
    { OTHER: /(?:[^{}a-zA-Z_$'"`/]|\/(?![/*]))+/ },
    { SPECIAL: /\// }
  ), keys);

  lex = RegExp(lex + '|', 'g');
  Lex.$ = keys;

  function Lex(code) {
    var $ = keys, re = new RegExp(lex), stack = [], state = 0;
    return function () {
      var ms;
      if (ms = re.exec(code)) {
        if (ms[$.BLOCK_HEAD]) {
          stack.push(state);
          state = $.BLOCK_HEAD;
        }
        else if (ms[$.TEMP_HEAD]) {
          stack.push(state);
          state = $.TEMP_HEAD;
        }
        else if (ms[$.TEMP_TAIL]) {
          if (state === $.BLOCK_HEAD) {
            ms[0] = ms[$.BLOCK_TAIL] = "}";
            ms[$.TEMP_TAIL] = ms[$.TEMP_CLOSE] = undefined;
            re.lastIndex = ms.index + 1;
            state = stack.pop();
          }
          else if (ms[$.TEMP_CLOSE] && state === $.TEMP_HEAD) {
            state = stack.pop();
          }
        }
        else if (ms[$.BLOCK_TAIL]) {
          if (state = $.BLOCK_HEAD) {
            state = stack.pop();
          }
        }
      }
      return ms;
    }
  }

  return Lex;
}();

