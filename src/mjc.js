/** -------------------------------------------------------------------------------------------------------------------
 * mjc.js
 *  mjc 主程序
 */

(function () {
  var fs = require("fs");

  var opts = process.cli
    .flag("version/v")
    .array("files/f")
    .string("ver", "0.0.1")
    .parse(process.argv.slice(2));
  // .parse(["try/a.js"]);

  function main() {
    if (opts.version) {
      console.log("Macro Javascript Compiler ( Ver 0.2.0 )");
    }
    else {
      Promise.resolve(read())
        .then(compile)
        .then(write)
        .catch(function (err) {
          console.error("Catched Promise Error:", err.message);
        });
    }
  }

  /**
   * 
   */
  function read() {
    var files = opts[""];
    return files.length
      ? readFiles(files)
      : readStdin();
  }

  function readFiles(files) {
    var i = 0;
    return Promise.resolve(goon(""));

    function goon(code) {
      return i < files.length
        ? readFile(files[i++])
          .then(function (data) {
            return code + data;
          })
          .then(goon)
        : code;
    }
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      fs.readFile(file, "utf8", function (err, code) {
        err ? reject(err) : resolve(code);
      });
    });
  }

  function writeFile(file, code) {
    return new Promise(function (resolve, reject) {
      fs.writeFile(file, code, "utf8", function (err) {
        err ? reject(err) : resolve();
      });
    });
  }

  function readStdin() {
    return new Promise(function (resolve) {
      var codes = "";
      process.stdin
        .setEncoding("utf8")
        .on("data", function (code) {
          codes += code;
        })
        .on("end", function () {
          resolve(codes);
        });
    });
  }

  function writeStdout(code) {
    return new Promise(function (resolve, reject) {
      process.stdout
        .on("error", reject)
        .write(code, "utf8", resolve);
    });
  }

  function write(code) {
    var file = opts.output;
    return file
      ? writeFile(file, code)
      : writeStdout(code);
  }

  function compile(code) {
    return code;
  }

  main();
})();
