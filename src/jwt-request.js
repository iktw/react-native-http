var JWTHelper = require('./jwt-helper');
var JWTConfig = require('./jwt-config');

var JWTRequest = {
    setAuthorizationHeader(options, token) {
        if (!options.headers) options.headers = {};
        options.headers[JWTConfig.authHeader] = `${JWTConfig.authPrefix} ${token}`;

        return options;
    },

    handleUnAuthorizedFetch(url, options) {
        return fetch(url, options).then((response) => response.json());
    },

    handleAuthorizedFetch(url, options) {
        return new Promise((resolve, reject) => {
            JWTHelper.getToken().then((token) => {
                if (token && !JWTHelper.isTokenExpired(token)) {
                    options = this.setAuthorizationHeader(options, token);
                    fetch(url, options).then((response) => {
                        resolve(response.json())
                    });
                } else {
                    reject('Token is either not valid or has expired.');
                }
            })
        })
    },

    fetch(url, options, skipAuthorization) {
        options = options || {};

        if (skipAuthorization) {
            return this.handleUnAuthorizedFetch(url, options);
        } else {
            return this.handleAuthorizedFetch(url, options);
        }
    }
};

module.exports = JWTRequest;