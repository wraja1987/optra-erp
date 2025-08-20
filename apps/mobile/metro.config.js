const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..'); // monorepo root

const config = getDefaultConfig(projectRoot);

// Keep Metro inside the repo (pnpm-friendly) and stop walking up to ~/node_modules
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];

// Safety alias: if anything asks for metro-runtime's empty-module, return a no-op
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    'metro-runtime/src/modules/empty-module.js': path.join(__dirname, 'shims/empty-module.js'),
  },
};

config.watchFolders = [workspaceRoot];

module.exports = config;
