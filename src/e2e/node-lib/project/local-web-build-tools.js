throw new Error(`Using non-local web-build-tools. Make sure you process the file: ${__filename}`);

// The argument of require should be rewritten to use files in /build
module.exports = require("demurgos-web-build-tools");
