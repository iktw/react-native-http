class HTTPHelper {
    /**
     * HTTPHelper constructor arguments
     * @param  {string} authHeader The auth header, default is 'Authorization'
     * @param  {string} authPrefix The authPrefix, default is 'Bearer'
     */
    constructor(authHeader, authPrefix) {
        this.authHeader = authHeader || 'Authorization';
        this.authPrefix = authPrefix || 'Bearer';
    }

    /**
     * Append the default headers to HTTP options
     * @param {object} options HTTP options
     * @return {string}     Returns the modified options
     */
    setDefaultHeaders(options) {
        if (options.method && options.method.toLowerCase() != 'get') {
            options.headers = options.headers ? options.header : {};

            if (!options.headers.Accept) {
                options.headers.Accept = 'application/json';
            }

            if (!options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/json';
            }
        }
        return options;
    }

    /**
     * Append the default body to HTTP options
     * @param {object} options HTTP options
     * @return {string}     Returns the modified options
     */
    setDefaultBody(options) {
        if (options.method && options.method.toLowerCase() != 'get') {
            options.body = options.body ? options.body : {};
            if (options.headers['Content-Type'].toLowerCase() == 'application/json') {
                options.body = JSON.stringify(options.body);
            }
        }

        return options;
    }

    /**
     * Method to set the authoriziation header
     * @param {object} options HTTP options
     * @param {string} token   The authentication token
     * @return {string}     Returns the modified options
     */
    setAuthorizationHeader(options, token) {
        if (!this.authHeader || !this.authPrefix) console.error('setAuthorizationHeader() requires authHeader and authPrefix to be set.');
        options.headers = options.headers ? options.headers : {};
        options.headers[this.authHeader] = `${this.authPrefix} ${token}`;
        return options;
    }

    /**
     * Paramifies a dictionary
     * @param  {object} obj Key-Value object to paramify
     * @return {string}     Returns a paramified string
     */
    paramify(obj) {
        var str = '';
        for (var key in obj) {
            if (str !== '') {
                str += '&';
            }
            str += key + '=' + obj[key];
        }
        return str;
    }
}

module.exports = HTTPHelper;
