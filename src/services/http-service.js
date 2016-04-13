var HTTPHelper = require('../helpers/http-helper');
var JWTService = require('./jwt-service');


class HTTPService {
  constructor(baseURL, authHeader, authPrefix, storageTokenPrefix) {
    this.baseURL = baseURL
    this.httpHelper = new HTTPHelper(authHeader, authPrefix);
    this.jwtService = new JWTService(storageTokenPrefix);
  }

  _getUrlStringWithPath(path) {
    if (this.baseURL) {
      var baseURL = this.baseURL.replace(/\/?$/, '/');
      var path = path.replace(/^\//, '');
      return `${baseURL}${path}`;
    }
    return path;
  }

  checkStatus(response) {
      if (response.status >= 200 && response.status < 300) {
          return response;
      }
      throw response;
  }

  parseJSON(response) {
    return response.status != 204 ? response.json() : {};
  }

  async handleUnAuthorizedFetch(url, options) {
    var response = await fetch(url, options);
    var status = await this.checkStatus(response);
    var jsonData = await this.parseJSON(response);
    return jsonData;
  }

  async handleAuthorizedFetch(url, options) {
    var token = await this.jwtService.getToken()

    if (token && !this.jwtService.isTokenExpired(token)) {
      var options = await this.httpHelper.setAuthorizationHeader(options, token);
      var response = await fetch(url, options);
      var status = await this.checkStatus(response);
      var jsonData = await this.parseJSON(response);
      return jsonData;
    } else {
      deferred.reject('Token is either not valid or has expired.');
    }

    return deferred.promise;
  }

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

  get(path, params, options) {
      options = options ? options : {};
      options.method = 'GET';

      if (params) {
          var getParams = this.httpHelper.paramify(params);
          path += `?${getParams}`;
      }

      return this.fetch(path, options);
  }

  post(path, data, options) {
      options = options ? options : {};
      options.method = 'POST';
      options.body = data;
      return this.fetch(path, options);
  }

  put(path, data, options) {
      options = options ? options : {};
      options.method = 'PUT';
      options.body = data;
      return this.fetch(path, options);
  }

  delete(path, options) {
      options = options ? options : {};
      options.method = 'DELETE';
      return this.fetch(path, options);
  }

  patch(path, data, options) {
      options = options ? options : {};
      options.method = 'PATCH';
      options.body = data;
      return this.fetch(path, options);
  }
}

module.exports = HTTPService;
