var $jwtConfig = require('./jwt-config');

var $httpHelper = {
    setDefaultHeaders(options) {
        if (options.method && options.method.toLowerCase() != 'get') {
            options.headers = options.headers ? options.header : {};

            if (!options.headers['Accept']) {
                options.headers['Accept'] = 'application/json';
            }

            if (!options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/json';
            }
        }
        return options;
    },

    setDefaultBody(options) {
        if (options.method && options.method.toLowerCase() != 'get') {
            options.body = options.body ? options.body : {};
            if (options.headers['Content-Type'].toLowerCase() == 'application/json') {
                options.body = JSON.stringify(options.body);
            }
        }

        return options;
    },

    setAuthorizationHeader(options, token) {
        options.headers = options.headers ? options.headers : {};
        options.headers[$jwtConfig.authHeader] = `${$jwtConfig.authPrefix} ${token}`;
        return options;
    },

    paramify(obj) {
        var str = '';
        for (var key in obj) {
            if (str != '') {
                str += '&';
            }
            str += key + '=' + obj[key];
        }
        return str;
    }
};

module.exports = $httpHelper;