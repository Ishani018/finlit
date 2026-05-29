const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { assetExts } = config.resolver;
config.resolver.assetExts = [...assetExts, 'mp3'];

// Ensure Metro watches the project root so assets are resolved correctly
// when building inside a monorepo / git subdirectory (e.g. EAS).
config.watchFolders = [__dirname, path.resolve(__dirname, '..')];

module.exports = config;
