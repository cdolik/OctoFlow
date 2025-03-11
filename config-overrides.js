const { override, adjustStyleLoaders } = require('customize-cra');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = override(
  // Optimize CSS
  adjustStyleLoaders(({ use: [, css, postcss, resolve, processor] }) => {
    css.options.sourceMap = process.env.NODE_ENV === 'development';
    if (postcss) {
      postcss.options.sourceMap = process.env.NODE_ENV === 'development';
    }
  }),
  
  // Custom webpack config
  (config) => {
    if (process.env.NODE_ENV === 'production') {
      // Optimize bundle size
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
              },
              output: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  }
); 