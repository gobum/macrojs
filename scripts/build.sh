echo "#!/usr/bin/env node\n" > mjc
cd src
cat lib.js lex.js make.js cli.js mjc.js >> ../mjc
cd ..
