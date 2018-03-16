/** -------------------------------------------------------------------------------------------------------------------
 * mjc.js
 *  mjc 主程序
 */

(function () {
  try {
    var opts = process.cli
      .flag("version/v")
      .flag("help/h")
      .array("define/d")
      .opts;
    var files = opts[""];

    if (opts.version || opts.help || !files.length) {
      help();
    }
    else {
      var home = process.cwd() + "/";
      var input = files[0];

      if (/^[^./]/.test(input)) {
        input = "./" + input;
      }

      var includes = Object.create(null);
      var defines = Object.create(null);
      var variables = Object.create(null);
  
      var predefs = opts.define;
      for(var i=0; i<predefs.length; i++) {
        var predef = predefs[i].split("=");
        defines[predef[0]] = predef[1] || 1;
      }

      var code = makeFile(input, home, includes, defines, variables, "");

      if (output = files[1]) {
        var fs = require("fs");
        fs.writeFileSync(output, code, "utf8");
      }
      else {
        new Promise(function (resolve, reject) {
          process.stdout
            .on("error", reject)
            .write(code, "utf8", resolve);
        })
          .catch(function (error) {
            console.error(error.message);
            process.exit(-1);
          });
      }
    }
  }
  catch (error) {
    console.log(error.message);
    process.exit(-1);
  }


  function help() {
    console.log("Macro Javascript Compiler (0.2.0)\n\n  Usage:\n\n    mjc <input> [<output>]\n");
  }

})();
