const path = require('path');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    buffer: require.resolve('buffer'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    assert: require.resolve('assert'),
    os: require.resolve('os-browserify'),
  };
  
  return config;
};
