const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: ["plugin:prettier/recommended"],
  rules: {
    'no-console': isProduction
      ? [
          'error',
          {
            allow: ['warn', 'error']
          }
        ]
      : 'off',
    'no-debugger': isProduction ? 'error' : 'off'
  }
}
