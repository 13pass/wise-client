const axios = require('axios');

const WiseClient = require('./WiseClient');

function Wise(config) {
  const wiseClient = new WiseClient({deps: {axios}, ...config});
  return wiseClient;
}

module.exports = Wise;
