import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  target: 'es2020',
  treeshake: false,
  splitting: false,
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/hooks/index.ts',

    // Remark plugins
    'src/remark/index.ts',
  ],
  format: ['esm'],
  dts: true,
  minify: false,
  clean: true,
  shims: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'next', 'chokidar', 'webpack'],
  ...options,
}));
