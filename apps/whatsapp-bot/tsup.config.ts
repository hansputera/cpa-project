import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  minifyWhitespace: true,
  minifyIdentifiers: true,
  platform: 'node',
  dts: false,
  tsconfig: './tsconfig.json',
  format: 'esm',
  external: ['ioredis', '@cpa/coin-stream'],
});