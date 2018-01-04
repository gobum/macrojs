/** -------------------------------------------------------------------------------------------------------------------
 * lib.js
 */

/**
 * get(path)
 *  获取指定路径的文本数据
 */
var get = function(fs){
  if(this.window) {
    fs = new XMLHttpRequest;
    return function(path){
      fs.open('GET', path, false);
      fs.send();
      if(!(fs.status / 100 ^ 2))
        return fs.responseText;
    }
  }
  else {
    fs = require('fs');
    return function(path) {
      return fs.readFileSync(path).toString();
    }
  }
}();

/**
 * repath(path, rel)
 *  计算相对路径
 */
var repath = function(path, rel){
  var rePath = /^(https?:\/\/[\w-.]+(?::\d+)?|)([\w\/.-]+)(.*|)/;
  var reRel = /^(https?:\/\/[\w-.]+(?::\d+)?|)(\/(?:[\w.-]+\/)*)/;

  function repath(path, rel) {
    var ms = path.match(rePath);
    if (ms && !ms[1] && rel && (rel = rel.match(reRel))) {
      path = ms[2];
      if (path[0] !== '/') {
        path = rel[2] + path;
      }
      path = rel[1] + normalize(path) + ms[3];
    }
    return path;
  }

  /** normalize(path) 路径规格化 */
  var reSlash = /\/+/;

  function normalize(src) {
    var des = [];
    src = src.split(reSlash);
    for (var i = 0, l = src.length; i < l; i++) {
      var sym = src[i];
      if (des.length) {
        if (sym !== '.') {
          var end = des[des.length - 1];
          if (sym !== '..') {
            if (end === '.' && sym) des.length--;
            des.push(sym);
          }
          else if (end === '..') {
            des.push(sym);
          }
          else if (end) {
            des.length--;
          }
        }
      }
      else {
        des.push(sym);
      }
    }
    return des.join('/');
  }

  return repath;

}();

