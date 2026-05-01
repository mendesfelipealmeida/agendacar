const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@components': './components',
  '@assets': './assets',
  '@screens': './screens',
};

module.exports = config;
