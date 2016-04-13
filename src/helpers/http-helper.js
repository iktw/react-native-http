class HTTPHelper {
  constructor(authHeader, authPrefix) {
    this.authHeader = authHeader || 'Authorization';
    this.authPrefix = authPrefix || 'Bearer';
  }

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
  }

  setDefaultBody(options) {
      if (options.method && options.method.toLowerCase() != 'get') {
          options.body = options.body ? options.body : {};
          if (options.headers['Content-Type'].toLowerCase() == 'application/json') {
              options.body = JSON.stringify(options.body);
          }
      }

      return options;
  }

  setAuthorizationHeader(options, token) {
      if (!this.authHeader || !this.authPrefix) console.error('setAuthorizationHeader() requires authHeader and authPrefix to be set.')
      options.headers = options.headers ? options.headers : {};
      options.headers[this.authHeader] = `${this.authPrefix} ${token}`;
      return options;
  }

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
}

module.exports = HTTPHelper;
