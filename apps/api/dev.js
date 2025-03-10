// This file is used to start the development server
// bypassing nest's compiled output issues

// Register path aliases from tsconfig
require('tsconfig-paths/register');

// Require ts-node to enable TypeScript execution
require('ts-node/register');

// Run the main module
require('./src/main');
