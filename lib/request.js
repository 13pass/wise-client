const request = require('request-promise-native');

let Config = {
  baseUrlSandbox: 'https://api.sandbox.transferwise.tech',
  baseUrlLive: 'https://api.transferwise.com',
	pathPrefix: '/v1'
}

let query = function(config) {
	for (let k in config) {
		Config[k] = config[k];
	}
  Config.rootUrl = Config.sandbox ? Config.baseUrlSandbox : Config.baseUrlLive;

	if(!Config.apiKey){
		throw new Error('apiKey is required in config');
	}

	return async function(method, path, data, headers){
    try {
      if (!path) {
        throw new Error('path is required to perform a request');
      }
      path = `${Config.pathPrefix}${path}`;
      const url = `${Config.rootUrl}${path}`;
      const options = { 
        method: method || 'GET',
        url,
        headers: { 
          'Authorization': `Bearer ${Config.apiKey}`,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache' 
        },
        json: true
      };
      for (let k in headers) {
        options.headers[k] = headers[k];
      }
      if (data) {
        options.body = data;
      }
      let res = await request(options);
      return res;
    } catch (error) {
      return error; 
    }
	}
};

module.exports = query;
