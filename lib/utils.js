const crypto = require('crypto');

exports.makeHttpRequest = makeHttpRequest;
exports.signToken = signToken;

async function makeHttpRequest({body, httpMethod, url}) {
  let response;
  if (body) {
    response = await httpMethod(url, body);
  } else {
    response = await httpMethod(url);
  }
  return response.data;
}

function signToken({key, token}) {
  const sign = crypto.createSign('SHA256');
  sign.write(token);
  sign.end();
  return sign.sign(key, 'base64');
}
