const crypto = require('crypto');

exports.makeHttpRequest = makeHttpRequest;
exports.makeScaHttpRequest = makeScaHttpRequest;

async function makeHttpRequest({body, httpRequestMethodFunc, url}) {
  let response;
  if (body) {
    response = await httpRequestMethodFunc(url, body);
  } else {
    response = await httpRequestMethodFunc(url);
  }
  return response.data;
}

async function makeScaHttpRequest({body, httpMethod, key, url, wiseClient}) {
  const options = {
    httpRequestMethodFunc: wiseClient.httpClient[httpMethod],
    url,
  };
  if (body) {
    options.body = body;
  }
  try {
    await makeHttpRequest(options);
  } catch (error) {
    if (error.response?.status === 403) {
      if (!key) {
        throw new Error('SCA private key is needed to perform this operation');
      }
      const token = _getX2FAApproval(error);
      const signature = _signToken({
        key,
        token,
      });
      // Retry the request with the SCA token and signature
      wiseClient.createHttpClient({
        scaHeaders: {
          'x-2fa-approval': token,
          'X-Signature': signature,
        },
      });
      // after creating the new client, we need to update the option httpRequestMethodFunc
      options.httpRequestMethodFunc = wiseClient.httpClient[httpMethod];
      return makeHttpRequest(options);
    }
    throw error;
  }
}

function _getX2FAApproval(responseObject) {
  if (
    responseObject &&
    responseObject.response &&
    responseObject.response.headers
  ) {
    if ('x-2fa-approval' in responseObject.response.headers) {
      return responseObject.response.headers['x-2fa-approval'];
    }
  }
  return null;
}

function _signToken({key, token}) {
  const sign = crypto.createSign('SHA256');
  sign.write(token);
  sign.end();
  return sign.sign(key, 'base64');
}
