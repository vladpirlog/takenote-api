import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores (replaces .eslintignore)
  {
    ignores: ['dist', 'node_modules', 'coverage', 'build'],
  },

  // Base configuration
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn', 
        { argsIgnorePattern: '^_' } // Ignore variables starting with underscore
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of erroring on 'any'
      '@typescript-eslint/explicit-function-return-type': 'off', // Let TS infer return types where possible

      // General Node/API best practices
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Discourage console.log in production
      'no-process-exit': 'off', // Allow process.exit() for scripts or shutdown
      'prefer-const': 'error',
    },
  }
);