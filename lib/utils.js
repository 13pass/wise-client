const crypto = require('crypto');

exports.makeHttpRequest = makeHttpRequest;
exports.signToken = signToken;
exports.getX2FAApproval = getX2FAApproval;
exports.getSCA = getSCA;

async function makeHttpRequest({body, httpMethod, url}) {
  let response;
  if (body) {
    response = await httpMethod(url, body);
  } else {
    response = await httpMethod(url);
  }
  return response.data;
}

async function getSCA({key, httpMethod, url, body}) {
  try {
    const options = {
      httpMethod: httpMethod,
      url
    }
    if(body)
      options.body = body;
    await makeHttpRequest(options);
  } catch (error) {
    if (error.response?.status === 403) {
      if (!key) {
        throw new Error(
          'SCA private key is needed to perform this operation'
        );
      }
      const token = getX2FAApproval(error);
      const signature = signToken({
        key,
        token
      });
      return [token, signature]
    }
    throw error;
  }
}

function signToken({key, token}) {
  const sign = crypto.createSign('SHA256');
  sign.write(token);
  sign.end();
  return sign.sign(key, 'base64');
}

function getX2FAApproval(responseObject) {
  if (responseObject && responseObject.response && responseObject.response.headers) {
    if ('x-2fa-approval' in responseObject.response.headers) {
      return responseObject.response.headers['x-2fa-approval'];
    }
  }
  return null;
}