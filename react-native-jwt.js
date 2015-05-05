var React = require('react-native');
var Buffer = require('buffer').Buffer; // npm install buffer

var {
    AsyncStorage
    } = React;

var JWTConfig = {
    authHeader: 'Authorization',
    authPrefix: 'Bearer'
};

var JWTHelper = {
    urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0: { break; }
            case 2: { output += '=='; break; }
            case 3: { output += '='; break; }
            default: { throw 'Illegal base64url string!'; }
        }
        return new Buffer(output, 'base64').toString('ascii')
    },

    decodeToken(token) {
        var parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('JWT must have 3 parts');
        }

        var decoded = this.urlBase64Decode(parts[1]);

        if (!decoded) {
            throw new Error('Cannot decode the token');
        }

        return JSON.parse(decoded);
    },

    getTokenExpirationDate(token) {
        var decoded;
        decoded = this.decodeToken(token);

        if (!decoded.exp) {
            return null;
        }

        var d = new Date(0);
        d.setUTCSeconds(decoded.exp);

        return d;
    },

    isTokenExpired (token) {
        var d = this.getTokenExpirationDate(token);

        if (!d) {
            return false;
        }

        // Token expired?
        return !(d.valueOf() > new Date().valueOf());
    },

    setToken(token) {
        AsyncStorage.setItem('async_jwt_token', token);
    },

    getToken() {
        return AsyncStorage.getItem('async_jwt_token');
    }
};


var JWTRequest = {
    handleUnAuthorizedFetch(url, options) {
        return fetch(url, options).then((response) => response.json());
    },

    setAuthorizationHeader(options, token) {
        if (!options.headers) options.headers = {};
        options.headers[JWTConfig.authHeader] = `${JWTConfig.authPrefix} ${token}`;

        return options;
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

module.exports = {
    JWTHelper: JWTHelper,
    JWTRequest: JWTRequest
};