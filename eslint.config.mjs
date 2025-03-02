import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'next',
      'turbo',
      'prettier',
    ],
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      'import/no-anonymous-default-export': 'error',
      'jsx-a11y/alt-text': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
    },

    ignorePatterns: [
      '**/dist',
      '**/out',
      // the entries below were added when migrating from v8 to v9
      // but we need a better way to do it.
      // Possibly find a way to better share the config
      // - another package
      //   - https://eslint.org/docs/latest/extend/shareable-configs
      //   - https://turbo.build/repo/docs/guides/tools/eslint
      // - experimental file resolution
      //   - https://eslint.org/docs/latest/use/configure/configuration-files#experimental-configuration-file-resolution
      //   - https://github.com/eslint/eslint/discussions/18574
      '**/*.md',
      '**/*.json',
      '**/*.webp',
      '**/*.jpg',
      '**/*.txt',
      '**/*.mdoc',
    ],

    // Overrides for specific file patterns
    overrides: [
      {
        files: ['packages/**'],
        rules: {
          '@next/next/no-html-link-for-pages': 'off',
        },
      },
    ],
  }),
];

export default eslintConfig;
