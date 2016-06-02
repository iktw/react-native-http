var React = require('react-native');
var Buffer = require('buffer/').Buffer; // note: the trailing slash is important!

import {
    AsyncStorage
} from 'react-native';

class JWTService {
    /**
     * JWT Service arguments
     * @param  {string} storageTokenPrefix The prefix to be used when using AsyncStorage, default is 'react_native_http_jwt_token'
     */
    constructor(storageTokenPrefix) {
        this.storageTokenPrefix = storageTokenPrefix || 'react_native_http_jwt_token';
    }

    urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0: { break; }
            case 2: { output += '=='; break; }
            case 3: { output += '='; break; }
            default: { throw 'Illegal base64url string!'; }
        }
        return new Buffer(output, 'base64').toString('ascii');
    }
    
    /**
     * Decodes the given token
     * @param  {string} token The authentication token
     * @return {object}       Returns the decoded token.
     */
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
    }

    /**
     * Fet the token expiration date
     * @param  {string} token The authentication token
     * @return {date}       Returns the token expiration date
     */
    getTokenExpirationDate(token) {
        var decoded;
        decoded = this.decodeToken(token);

        if (!decoded.exp) {
            return null;
        }

        var d = new Date(0);
        d.setUTCSeconds(decoded.exp);

        return d;
    }

    /**
     * Validate the token expiration
     * @param  {string}  token The authentication token
     * @return {Boolean}       True/False depending on the token validity.
     */
    isTokenExpired(token) {
        var d = this.getTokenExpirationDate(token);

        if (!d) {
            return false;
        }

        return d.valueOf() < new Date().valueOf();
    }

    /**
     * Clear the token from AsyncStorage
     * @return {AsyncStorage instance}
     */
    clearToken() {
        return AsyncStorage.removeItem(this.storageTokenPrefix);
    }

    /**
     * Set the auth token
     * @param {AsyncStorage instance} token The authentication token
     */
    setToken(token) {
        return AsyncStorage.setItem(this.storageTokenPrefix, token);
    }

    /**
     * Get the current authentication token
     * @return {AsyncStorage Instance} Authentication token
     */
    getToken() {
        return AsyncStorage.getItem(this.storageTokenPrefix);
    }

    /**
     * Checks if the token is still valid
     * @return {Boolean} Returns a promise containing the authentication status
     */
    isAuthenticated() {
        return new Promise((resolve, reject) => {
            this.getToken()
                .then((token) => {
                    if (token && !this.isTokenExpired(token)) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
        });
    }
}

module.exports = JWTService;
