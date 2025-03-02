const { override, addBabelPlugin } = require('customize-cra');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = override(
  (config, env) => {
    if (env === 'development') {
      config.plugins.push(new ReactRefreshWebpackPlugin());
    }
    return config;
  },
  addBabelPlugin('styled-jsx/babel')
);
