import { fileURLToPath } from 'url';
import { configDefaults, defineProject } from 'vitest/config';

export default defineProject({
  test: {
    globals: true,
    watch: false,
    exclude: [...configDefaults.exclude],
    alias: {
      '~/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
});
