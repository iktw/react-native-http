var JWTConfig = require('./jwt-config');

var $httpHelper = {
    setDefaultHeaders(options) {
        options.headers = options.headers || {};
        if (!options.headers['Accept']) {
            options.headers['Accept'] = 'application/json';
        }

        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        return options;
    },

    setDefaultBody(options) {
        options.body = options.body || {};
        if (options.method && options.method.toLowerCase() != 'get') {
            if (options.headers['Content-Type'].toLowerCase() == 'application/json') {
                options.body = JSON.stringify(options.body);
            }
        }

        return options;
    },

    setAuthorizationHeader(options, token) {
        options.headers = options.headers || {};
        options.headers[JWTConfig.authHeader] = `${JWTConfig.authPrefix} ${token}`;
        return options;
    }
}

module.exports = $httpHelper;