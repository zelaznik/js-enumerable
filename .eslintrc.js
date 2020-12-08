'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['babel', 'promise', 'ember', 'prettier', 'chirp', 'ember-suave'],
  rules: {
    'chirp/ember-test-helpers-wait': 'warn',
    'chirp/async-contains-then-or-catch': 'warn',
    'chirp/multiple-awaited-new-promises': 'error',
    'chirp/prohibit-this-dot-dollar': 'error',
    'chirp/prohibit-dot-only': 'error',
    'prettier/prettier': 'error',
    camelcase: ['error', { properties: 'never' }],
    strict: 0,
    'no-fallthrough': 0,
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
    'promise/no-nesting': 'warn',
    'promise/no-promise-in-callback': 'warn',
    'promise/no-callback-in-promise': 'warn',
    'promise/avoid-new': 'off',
    'ember-suave/no-const-outside-module-scope': 'off',
    'ember-suave/lines-between-object-properties': 0,
    'prefer-const': 'error',
    quotes: 'off',
    'ember/no-jquery': 'off',
    'lines-between-class-members': 'off',
    'padding-line-between-statements': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'error',
  },
  overrides: [
    // ember unit tests
    {
      files: ['tests/unit/**/*.js'],
      rules: {
        'chirp/ember-test-helpers-wait': 'off',
      },
    },
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      },
    },
  ],
};
