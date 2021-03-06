module.exports = {
    env: {
        es2020: true,
        node: true,
        jest: true
    },
    extends: ['standard'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        indent: [2, 4],
        'linebreak-style': [2, 'unix']
    }
}
