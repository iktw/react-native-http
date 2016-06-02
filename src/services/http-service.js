var HTTPHelper = require('../helpers/http-helper');
var JWTService = require('./jwt-service');


class HTTPService {
    /**
     * Constructor arguments
     * @param  {string} baseURL            The base url to the API
     * @param  {string} authHeader         The auth header, default is Authorization
     * @param  {string} authPrefix         The auth prefix, default is Bearer
     * @param  {string} storageTokenPrefix The storage token prefix, default is react_native_http_jwt_token
     */
    constructor(baseURL, authHeader, authPrefix, storageTokenPrefix) {
        this.baseURL = baseURL;
        this.httpHelper = new HTTPHelper(authHeader, authPrefix);
        this.jwtService = new JWTService(storageTokenPrefix);
    }

    /**
     * Converts path to full url if baseURL is set
     * @param  {string} path Path to ex. endpoint
     * @return {string}      UrlString containing either path or the full url.
     */
    _getUrlStringWithPath(path) {
        if (this.baseURL) {
            var baseURL = this.baseURL.replace(/\/?$/, '/');
            path = path.replace(/^\//, '');
            return `${baseURL}${path}`;
        }
        return path;
    }

    /**
     * Check the status and throw if status is not OK
     * @param  {object} response window.fetch polyfill response object
     * @return {object}          window.fetch polyfill response object or throw error
     */
    checkStatus(response) {
        if (response.ok) return response;
        throw response;
    }

    /**
     * Parse JSON Data from response
     * @param  {object} response window.fetch polyfill response object
     * @return {object}          Parsed json
     */
    parseJSON(response) {
        return response.json()
            .then((data) => data)
            .catch((e) => e);
    }

    /**
     * Gets called when the fetch has requested to skip authoriziation
     * @param  {string} path    Target Url/Path
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {object}         Returned JSON data
     */
    async handleUnAuthorizedFetch(url, options) {
        var response = await fetch(url, options);
        var status = await this.checkStatus(response);
        var jsonData = await this.parseJSON(response);
        return jsonData;
    }

    /**
     * Gets called when the fetch is authorized
     * @param  {string} path    Target Url/Path
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {object}         Returned JSON data
     */
    async handleAuthorizedFetch(url, options) {
        var token = await this.jwtService.getToken();

        if (token && !this.jwtService.isTokenExpired(token)) {
            var options = await this.httpHelper.setAuthorizationHeader(options, token);
            var response = await fetch(url, options);
            var status = await this.checkStatus(response);
            var jsonData = await this.parseJSON(response);
            return jsonData;
        } else {
            throw 'Token is either invalid or has expired.';
        }
    }

    /**
     * This method is base method for all requests
     * @param  {string} path    Target Url/Path
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {promise}         Returned promise
     */
    fetch(path, options) {
        const url = this._getUrlStringWithPath(path);
        options = options ? options : {};
        options = this.httpHelper.setDefaultHeaders(options);
        options = this.httpHelper.setDefaultBody(options);

        if (options.skipAuthorization) {
            return this.handleUnAuthorizedFetch(url, options);
        } else {
            return this.handleAuthorizedFetch(url, options);
        }
    }

    /**
     * Request HTTP GET.
     * @param  {string} path    Target Url/Path
     * @param  {object} params    Dictionary containing key-value items. The dictionary will get paramified.
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {promise}         Returned promise
     */
    get(path, params, options) {
        options = options ? options : {};
        options.method = 'GET';

        if (params) {
            var getParams = this.httpHelper.paramify(params);
            path += `?${getParams}`;
        }

        return this.fetch(path, options);
    }

    /**
     * Request HTTP POST.
     * @param  {string} path    Target Url/Path
     * @param  {object/array} data    Data to pass with request
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {promise}         Returned promise
     */
    post(path, data, options) {
        options = options ? options : {};
        options.method = 'POST';
        options.body = data;
        return this.fetch(path, options);
    }

    /**
     * Request HTTP PUT.
     * @param  {string} path    Target Url/Path
     * @param  {object/array} data    Data to pass with request
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {promise}         Returned promise
     */
    put(path, data, options) {
        options = options ? options : {};
        options.method = 'PUT';
        options.body = data;
        return this.fetch(path, options);
    }

    /**
     * Request HTTP DELETE.
     * @param  {string} path    Target Url/Path
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {promise}         Returned promise
     */
    delete(path, options) {
        options = options ? options : {};
        options.method = 'DELETE';
        return this.fetch(path, options);
    }

    /**
     * Request HTTP PATCH.
     * @param  {string} path    Target Url/Path
     * @param  {object/array} data    Data to pass with request
     * @param  {object} options Options to pass with request, ex: {headers: {myheader: 12345}}. See window.fetch polyfill for more detailed information
     * @return {promise}         Returned promise
     */
    patch(path, data, options) {
        options = options ? options : {};
        options.method = 'PATCH';
        options.body = data;
        return this.fetch(path, options);
    }
}

module.exports = HTTPService;
