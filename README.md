# React Native HTTP
**README in progress**

## HTTPService constructor parameters
| Name        | Type | Default |
| ------------- |-------------|-------------|
| baseURL | String | None |
| authHeader | String | Authorization |
| authPrefix     | String | Bearer |
| storageTokenPrefix | String | react_native_http_jwt_token |

### Example: Basic usage
```
var HTTPService = require('react-native-http').HTTPService;

class BasicAPI extends HTTPService {
  getBasicList() {
    var path = `basic-list/`;
    return this.get(path);
  }
  getBasicListWithoutAuthorization() {
    var path = `basic-list/`;
    return this.get(path, null, {skipAuthorization: true});
  }
  getBasicItemWithId(id) {
    var path = `basic-list/${id}/`;
    return this.get(path);
  }
  postBasicItem(basicItem) {
    var path = `basic-list/`;
    return this.post(path, basicItem);
  }
  updateBasicItem(basicItem) {
    var path = `basic-list/${basicItem.id}/`;
    return this.put(path, basicItem);
  }
  deleteBasicItem(id) {
    var path = `basic-list/${id}/`;
    return this.delete(path);
  }
}

module.exports = new BasicAPI("http://mysite.com/api/v1/");
```
### Example: AuthenticationAPI with JWT token handler
```
var HTTPService = require('react-native-http').HTTPService;

class AuthenticationAPI extends HTTPService {
  _postWithPathAndCredentials(path, credentials) {
    return new Promise((resolve, reject) => {
        this.post(path, credentials, {skipAuthorization: true})
            .then((response) => {
                this.jwtService.setToken(response.token);
                resolve(response);
            }, (error) => {
                reject(error);
            });
    });
  }

  signInWithCredentials(credentials) {
    var path = 'token-auth/';
    return this._postWithPathAndCredentials(path, credentials);
  }

  signUpWithCredentials(credentials) {
      var path = 'user-registration/';
      return this._postWithPathAndCredentials(path, credentials);
  }
}

module.exports = new AuthenticationAPI("http://mysite.com/api/v1/");
```
