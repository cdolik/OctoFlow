module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['@typescript-eslint', 'react', 'testing-library', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // Project-specific rules can be defined here
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        'testing-library/no-unnecessary-act': 'off',
        'testing-library/no-node-access': 'off',
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/no-wait-for-multiple-assertions': 'off',
        'react/jsx-no-undef': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'jest/no-identical-title': 'off',
        'jest/no-conditional-expect': 'off'
      }
    },
    {
      files: ['scripts/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
