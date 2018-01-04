cd src
cat main.js > ../out/macro.js
cat lib.js lex.js make.js mjc.js > ../out/mjc.js
cd ..

node_modules/.bin/uglifyjs out/macro.js -m -o dist/macro.js
echo "#!/usr/bin/env node" > bin/mjc
# node_modules/.bin/uglifyjs out/mjc.js -m >> bin/mjc
cat out/mjc.js >> bin/mjc
