module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:nextpublic/recommended', // Usa la configuración recomendada del plugin
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'nextpublic', // Agrega el plugin
  ],
  rules: {
    // Puedes personalizar la regla si lo deseas
    'nextpublic/require-justification': 'error',
  },
};