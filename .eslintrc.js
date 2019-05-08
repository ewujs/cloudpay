module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jest/globals": true
  },
  "plugins": [
    "jest"
  ],
  "extends": "eslint:recommended",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "linebreak-style": "off",
    "no-param-reassign": [2, { props: false }],
    "no-console": ["error", { allow: ["warn", "error"] }]
  }
};