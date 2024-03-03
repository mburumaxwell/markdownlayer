import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
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
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'next', 'chokidar', 'webpack'],
  ...options,
}));
