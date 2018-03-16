/** -------------------------------------------------------------------------------------------------------------------
 * cli.js
 *  CLI 参数选项
 */
(function () {
  var reOption = /^--([a-zA-Z][a-zA-Z-]*)/;
  var reTags = /^-([a-zA-Z]*)/;
  var reTagedKey = /^([a-zA-Z][a-zA-Z-]*)(?:\/([a-zA-Z]))?/;

  var converts = {
    boolean: boolean,
    number: number
  }

  class CLI {
    constructor() {
      this.types = {},
        this.model = { "": [] },
        this.def = {},
        this.arg = { "": [] },
        this.tags = {}
    }

    tag(key) {
      var tag = reTagedKey.exec(key);
      if (tag) {
        key = tag[1];
        if (tag = tag[2]) {
          this.tags[tag] = key;
        }
      }
      return key;
    }

    flag(key) {
      key = this.tag(key);
      this.types[key] = "flag";
      return this;
    }

    boolean(key, value) {
      key = this.tag(key);
      this.types[key] = "boolean";
      this.model[key] = boolean(value);
      return this;
    }

    number(key, value) {
      key = this.tag(key);
      this.types[key] = "number";
      this.model[key] = number(value);
      return this;
    }

    string(key, value) {
      key = this.tag(key);
      this.model[key] = String(value);
      return this;
    }

    array(key, type) {
      key = this.tag(key);
      this.types[key] = "array";
      this.model[key] = [];
      this.model[key].type = type;
      return this;
    }

    get opts() {
      return this.parse(process.argv.slice(2));
    }

    parse(args) {
      var model = this.model, types = this.types, tags = this.tags;
      var key, value, type;
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        var ms, name;
        if (arg[0] === "-") {
          if (ms = arg.match(/^--(\w*)/)) {
            key = ms[1];
            if (types[key] === "flag") {
              model[key] = 1;
              key = "";
            }
          }
          else if (ms = arg.match(/^-(\w+)/)) {
            name = ms[1];
          }
          else {
            key = "";
          }
        }
        else if (key) {
          type = types[key];
          if (type === "array") {
            var array = model[key];
            type = converts[array.type] || String;
            array.push(type(arg));
          }
          else {
            type = converts[type] || String;
            model[key] = type(arg);
            key = "";
          }
        }
        else {
          model[""].push(arg);
        }
      }
      return model;
    }
  }

  Object.defineProperty(process, "cli", { get: function () { return new CLI; } });

  var reTrue = /^(?:true|yes|1)$/;
  function boolean(value) {
    return reTrue.test(value);
  }

  function number(value) {
    return Number(value) || 0;
  }
})();
