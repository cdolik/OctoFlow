const { override, addWebpackAlias, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = override(
  // Add proper resolution for react-refresh
  addWebpackAlias({
    'react-refresh/runtime': require.resolve('react-refresh/runtime')
  }),
  
  // Add React Refresh plugin for development
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      config.plugins = [
        ...config.plugins,
        new ReactRefreshWebpackPlugin()
      ];
    }
    return config;
  }
);
