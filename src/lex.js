/** -------------------------------------------------------------------------------------------------------------------
 * lex.js
 */

var lex = function () {
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
    { INCLUDE: [/\/\/#include\s+/, { FILE: /\S+/ }, /.*/] },
    { DEFINE: [/\/\/#define\s+/, { DID: /[a-zA-Z_$][\w$]*/ }, /\s*/, $([/@\s*/, { RES: /\S+/ }, /.*/], [/=\s*/, { EXP: /.+/ }], { VAL: /.+/ })] },
    { VAR: [/\/\/#var\s+/, { VID: /[a-zA-Z_$][\w$]*/ }, /\s*=\s*/, { VEXP: /.+/ }] },
    { BLOCK_HEAD: /\{/ },
    { BLOCK_TAIL: /\}/ },
    { ARG_HEAD: /\(/ },
    { ARG_TAIL: /\)/ },
    { ID: /[a-zA-Z_$][\w$]*/ },
    { STRING: /'(?:[^'\n\\]|\\[^])*(?:['\n]|$)|"(?:[^"\n\\]|\\[^])*(?:["\n]|$)|`(?:[^`\\]|\\[^])*(?:`|$)/ },
    { REGEXP: /\/(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\*\n\r])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\n\r])*?\/[gimy]*/ },
    { COMMENT: /\/\/.*|\/\*[^*]*\*+(?:[^/][^*]*\*+)*\// },
    { OTHER: /(?:[^{}()a-zA-Z_$'"`/]|\/(?![/*]))+/ },
    { SPECIAL: /\// }
  ), keys);

  lex = RegExp(lex + '|', 'g');
  lex.$ = keys;

  return lex;
}();

