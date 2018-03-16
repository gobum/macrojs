
if [ ! -d bin ]; then
  mkdir bin
fi

echo "#!/usr/bin/env node\n" > bin/mjc
cd src
cat lib.js lex.js make.js cli.js mjc.js >> ../bin/mjc
cd ..
