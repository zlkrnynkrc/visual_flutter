const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/main.js'],   // your entry file
    bundle: true,                   // bundle dependencies
    platform: 'node',               // VS Code extensions run in Node
    target: 'node18',               // match VS Code’s runtime (Node 18+)
    format: 'cjs',
    outfile: 'dist/extension.js',   // output file
    external: [
      'vscode'                      // keep VS Code API external
    ],
    mainFields: ['main'],
    conditions: ['node'],           // Ensure node-specific code is used
    packages: 'bundle',             // Force bundling of all packages
    sourcemap: true,                // helpful for debugging
    minify: false,                  // optional, usually off for extensions
    plugins: [
    ]
}).catch(() => process.exit(1));