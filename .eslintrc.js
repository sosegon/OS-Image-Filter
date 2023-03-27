module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: [
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
    'babel',
    'array-func',
    'promise',
    'prettier',
  ],
  extends: ['airbnb', 'airbnb/hooks', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      'babel-module': {
        extensions: ['.js', '.jsx'],
      },
    },
  },
  rules: {
    // ***
    // NOTE: less important eslint rules (formatting and code style mostly)
    'no-param-reassign': 'off',
    'arrow-body-style': 'off',
    'react/function-component-definition': 'off',
    'react/destructuring-assignment': 'off',
    'prefer-regex-literals': 'off',
    'import/no-anonymous-default-export': [
      'off',
      {
        allowArray: true,
        allowArrowFunction: true,
        allowAnonymousClass: true,
        allowAnonymousFunction: true,
        allowCallExpression: true,
        allowLiteral: true,
        allowObject: true,
      },
    ],
    // ***
    // NOTE: more important eslint rules (potentially buggy, performance lack or redundant code)
    'no-restricted-exports': 'warn',
    'default-param-last': 'warn',
    'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-bind': 'warn',
    'react/jsx-key': 'off',
    'react/no-unstable-nested-components': 'warn',
    'react/jsx-no-constructed-context-values': 'warn',
    'react/display-name': 'warn',
    'no-unsafe-optional-chaining': 'warn',
    // ***

    'no-underscore-dangle': [
      'error',
      {
        allow: [
          '__PRELOADED__', // window property name where data loaded by the server is
          '_router', // express app property
        ],
      },
    ],
    'react/forbid-prop-types': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        mjs: 'never',
      },
    ],
  },
};
