const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { assetExts } = config.resolver;

config.resolver.assetExts = [...assetExts, 'mp3'];

module.exports = config;
