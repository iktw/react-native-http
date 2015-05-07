#! /usr/bin/env node

var argv = require('yargs').argv,
    fileSave = require('file-save');

/* Essential variables */
var authHeader,
    authPrefix,
    tokenPrefix;

/* Config paths */
var paths = [
    './src/config/auth-header.js',
    './src/config/auth-prefix.js',
    './src/config/storage-token-prefix.js'
];

/* Method to generate new module exports */
var generateNewModuleExports = function (path, value, kind) {
    var line = "module.exports = '" + value + "';";
    fileSave(path).write(line, 'utf8', function () {
        console.log('*', kind.toUpperCase(), 'CHANGED');
    });
};

/* Get options */
if (argv.setAuthHeader && argv.setAuthHeader !== true) authHeader = argv.setAuthHeader;
if (argv.setAuthPrefix && argv.setAuthPrefix !== true) authPrefix = argv.setAuthPrefix;
if (argv.setTokenPrefix && argv.setTokenPrefix !== true) tokenPrefix = argv.setTokenPrefix;

/* If options generate new module export */
if (authHeader) generateNewModuleExports(paths[0], authHeader, 'auth header');
if (authPrefix) generateNewModuleExports(paths[1], authPrefix, 'auth prefix');
if (tokenPrefix) generateNewModuleExports(paths[2], tokenPrefix, 'token prefix');

/* Set default settings if setDefault is requested */
if (argv.setDefault) {
    generateNewModuleExports(paths[0], 'Authorization', 'auth header');
    generateNewModuleExports(paths[1], 'Bearer', 'auth prefix');
    generateNewModuleExports(paths[2], 'jwt_token', 'token prefix');
}