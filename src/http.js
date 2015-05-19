var $httpHelper = require('./http-helper');
var $jwtHelper = require('./jwt-helper');

var $http = {
    status(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        throw response;
    },

    json(response) {
        return response.json()
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
                    options = $httpHelper.setAuthorizationHeader(options, token);
                    fetch(url, options)
                        .then(this.status)
                        .then(this.json)
                        .then((json) => {
                            resolve(json);
                        }).catch((error) => {
                            reject(error);
                        });
                } else {
                    reject('Token is either not valid or has expired.');
                }
            })
        })
    },

    fetch(url, options) {
        options = options ? options : {};
        options = $httpHelper.setDefaultHeaders(options);
        options = $httpHelper.setDefaultBody(options);

        if (options.skipAuthorization) {
            return this.handleUnAuthorizedFetch(url, options);
        } else {
            return this.handleAuthorizedFetch(url, options);
        }
    },

    get(url, params, options) {
        options = options ? options : {};
        options.method = 'GET';

        if (params) {
            var getParams = $httpHelper.paramify(params);
            url += `?${getParams}`;
        }

        return this.fetch(url, options);
    },

    post(url, data, options) {
        options = options ? options : {};
        options.method = 'POST';
        options.body = data;
        return this.fetch(url, options);
    },

    put(url, data, options) {
        options = options ? options : {};
        options.method = 'PUT';
        options.body = data;
        return this.fetch(url, options);
    },

    delete(url, options) {
        options = options ? options : {};
        options.method = 'DELETE';
        return this.fetch(url, options);
    },

    patch(url, data, options) {
        options = options ? options : {};
        options.method = 'PATCH';
        options.body = data;
        return this.fetch(url, options);
    }
};

module.exports = $http;