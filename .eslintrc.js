module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "airbnb-base",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "BigInt": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/interface-name-prefix": ["error", {
            "prefixWithI": "always"
        }],
        "@typescript-eslint/no-unused-vars": "error",
        "no-await-in-loop": "off",
        "no-plusplus": "off",
        "no-console": "off",
        "no-continue": "off",
        "import/prefer-default-export": "off",
        "no-restricted-syntax": "off",
        "no-constant-condition": "off",
        "class-methods-use-this": "off",
        "no-underscore-dangle": "off",
        "no-bitwise": "off",
        "no-restricted-properties": "off",
        "import/extensions": [
            "error",
            "ignorePackages",
            {
              "js": "never",
              "jsx": "never",
              "ts": "never",
              "tsx": "never"
            }
         ],
         "import/no-extraneous-dependencies": "off",
        "no-useless-constructor": "off",
        "react/prop-types": "off",
        "react/jsx-no-target-blank": "off",
        'max-classes-per-file': 'off',
        '@typescript-eslint/interface-name-prefix': 'off'
    },
    "settings": {
        "import/resolver": {
          "node": {
            "extensions": [".js", ".jsx", ".ts", ".tsx", ".d.ts"]
          }
        },
        "react": {
            "pragma": "React",
            "version": "detect"
        }
    }
};