const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const copyPlugin = {
  name: 'copy-assets',
  setup(build) {
    build.onEnd(() => {
      const src = path.resolve('media');
      const dest = path.resolve('dist/media');
      fs.cpSync(src, dest, { recursive: true });
      console.log('Assets copied!');
    });
  }
};

esbuild.build({
  entryPoints: ['src/main.js'],   // your entry file
  bundle: true,                   // bundle dependencies
  platform: 'node',               // VS Code extensions run in Node
  target: 'node18',               // match VS Code’s runtime (Node 18+)
  outfile: 'dist/extension.js',   // output file
  external: [                     // keep VS Code API external
    'vscode'
  ],
  sourcemap: true,                // helpful for debugging
  minify: false                   // optional, usually off for extensions
}).catch(() => process.exit(1));