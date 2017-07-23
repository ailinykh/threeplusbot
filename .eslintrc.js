module.exports = {
    "extends": "airbnb",
    "plugins": [
        "import"
    ],
    "rules": {
      "semi": [2, "never"],
      "space-before-function-paren": [2, "always"],
      "jsx-a11y/href-no-hash": "off",
      "jsx-a11y/anchor-is-valid": ["warn", { "aspects": ["invalidHref"] }]
    },
    "env": {
      "jest": true,
    }
}
