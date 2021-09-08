module.exports = function override(config) {
    config.module.rules[1].oneOf[3].options.plugins = [
        "@babel/plugin-proposal-optional-chaining"
    ];

    return config;
}