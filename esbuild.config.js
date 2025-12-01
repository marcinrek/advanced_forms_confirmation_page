import esbuild from 'esbuild';

const isProduction = process.argv[2] === 'production';

const config = {
  entryPoints: ['app.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'iife',
  target: ['es2015'],
  minify: isProduction,
  sourcemap: !isProduction,
};

async function build() {
  if (isProduction) {
    await esbuild.build(config);
    console.log('Build complete!');
  } else {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('Watching for changes...');
  }
}

build().catch(() => process.exit(1));

