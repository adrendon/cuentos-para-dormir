const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add asset extensions for book files
config.resolver.assetExts.push('csv', 'mp3', 'webp');

module.exports = config;
