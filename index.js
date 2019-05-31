const transferwise = function(config){
  const uuidv4 = require('uuid/v4');
	const request = require('./lib/request')(config);

  try {
    this.apiKey = config.apiKey;
    this.request = request;
    this.convertCurrencies = function({
      borderlessAccountId,
      quoteId,
      uuid
    }){
      if (!uuid) {
        uuid = uuidv4();
      }
      return request('POST', `/borderless-accounts/${borderlessAccountId}/conversions`, {
        quoteId 
      }, {
        'X-idempotence-uuid': uuid
      });
    };

    this.getBorderlessAccounts = function(profileId){
      return request('GET', `/borderless-accounts?profileId=${profileId}`);
    };
    this.getQuote = function(data){
      return request('POST', `/quotes`, data);
    };
    this.getProfiles = function(){
      return request('GET', `/profiles`);
    };
  } catch (err) {
    console.error(err);
  }
};

module.exports = transferwise;
