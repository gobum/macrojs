/** -------------------------------------------------------------------------------------------------------------------
 * mjc.js
 *  命令行编译工具 mjc
 */

(function () {
  try {
    var home = process.cwd() + "/";
    var argv = process.argv.slice(2);
    if (argv.length < 2) {
      console.log('Macro JavaScript Complier (0.0.9)\n  Usage: mjc <input> <output>');
    }
    else {
      var code = make(argv[0], home);
      if (code === undefined) {
        console.error('Can not read from file: ' + argv[0]);
      }
      else {
        var fs = require('fs');
        fs.writeFileSync(argv[1], code);
      }
    }
    process.exit(0);
  }
  catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();

