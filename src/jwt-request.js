var JWTHelper = require('./jwt-helper');
var JWTConfig = require('./jwt-config');

var JWTRequest = {
    status(response) {
        if (response.status >= 200 && response.status < 300) {
            return response
        }
        throw Error(null) // Todo: Return response error here
    },

    json(response) {
        return response.json()
    },

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
        if (options.headers['Content-Type']) {
            options.body = JSON.stringify(options.body);
        }
        return options;
    },

    setAuthorizationHeader(options, token) {
        options.headers = options.headers || {};
        options.headers[JWTConfig.authHeader] = `${JWTConfig.authPrefix} ${token}`;
        return options;
    },

    handleUnAuthorizedFetch(url, options) {
        return new Promise((resolve, reject) => {
            fetch(url, options)
                .then(this.status)
                .then(this.json)
                .then((json) => {
                    resolve(json);
                }).catch((error) => {
                    reject(error);
                });
        });
    },

    handleAuthorizedFetch(url, options) {
        return new Promise((resolve, reject) => {
            JWTHelper.getToken().then((token) => {
                if (token && !JWTHelper.isTokenExpired(token)) {
                    options = this.setAuthorizationHeader(options, token);
                    fetch(url, options)
                        .then(this.status)
                        .then(this.json)
                        .then(function (json) {
                            resolve(json);
                        }).catch(function (error) {
                            reject(error);
                        });
                } else {
                    reject('Token is either not valid or has expired.');
                }
            })
        })
    },

    fetch(url, options) {
        options = options || {};
        options = this.setDefaultHeaders(options);
        options = this.setDefaultBody(options);

        if (options.skipAuthorization) {
            return this.handleUnAuthorizedFetch(url, options);
        } else {
            return this.handleAuthorizedFetch(url, options);
        }
    }
};

module.exports = JWTRequest;