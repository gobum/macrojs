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
  var reRel = /^(https?:\/\/[\w-.]+(?::\d+)?|)(\/(?:[\w@.-]+\/)*)/;

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

var libpath = this.window || function(){
  var fs = require("fs");
  var reLibName = /^(?:@[a-z0-9-][a-z0-9-._]*\/)?[a-z0-9-][a-z0-9-._]*(\/[^]*)?/;

  function libpath(name, rel) {
    var ms = name.match(reLibName);
    if (!ms)
      throw Error("Error libaray name: '" + name + "'");
    if(!ms[1]) {
      name += "/all.js";
    }
    else if(!name.endsWith(".js")) {
      name += ".js";
    }
  
    var rel = dirname(rel);
    while (rel) {
      var tryname = rel + "node_modules/" + name;
      if (fs.existsSync(tryname))
        return tryname;
      rel = dirname(rel.slice(0, -1));
    }

    rel = process.env.NODE_PATH;
    if (rel) {
      rel = rel.split(":");
      for (var i = 0; i < rel.length; i++) {
        var dir = rel[i];
        if (dir) {
          tryname = dir + "/" + name;
          if (fs.existsSync(tryname))
            return tryname;
        }
      }
    }
    throw Error("Can't find libaray :'"+name+"'");
  }
  
  function dirname(path) {
    return path.slice(0, path.lastIndexOf("/") + 1);
  }
  return libpath;  
}();

function isLibName(name) {
  return /^[^./]/.test(name);
}

function incpath(path, rel) {
  if(isLibName(path))
    return libpath(path, rel);
  return repath(path, rel);
}