import { build } from 'esbuild';

await build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    treeShaking: true,
    sourcemap: 'linked',
    format: 'cjs',
    target: 'esnext',
    platform: 'node',
    logLevel: 'error'
});
