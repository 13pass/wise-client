const transferwise = function (config) {
  const uuidv4 = require('uuid/v4');
  const request = require('./lib/request')(config);

  try {
    this.apiKey = config.apiKey;
    this.request = request;

    this.cancelTransfer = function (transferId) {
      return request('PUT', `/transfers/${transferId}/cancel`);
    };
    this.convertCurrencies = function ({borderlessAccountId, quoteId, uuid}) {
      if (!uuid) {
        uuid = uuidv4();
      }
      return request(
        'POST',
        `/borderless-accounts/${borderlessAccountId}/conversions`,
        {
          quoteId,
        },
        {
          'X-idempotence-uuid': uuid,
        }
      );
    };
    this.createQuote = function (data) {
      return request('POST', `/quotes`, data);
    };
    this.createRecipientAccount = function ({
      currency = 'GBP',
      type = 'sort_code',
      profile,
      ownedByCustomer = false,
      accountHolderName,
      details,
    }) {
      return request('POST', `/accounts`, {
        currency,
        type,
        profile,
        ownedByCustomer,
        accountHolderName,
        details,
      });
    };
    this.createTransfer = function ({
      targetAccount,
      quote,
      customerTransactionId,
      details,
    }) {
      if (!customerTransactionId) {
        customerTransactionId = uuidv4();
      }
      return request('POST', `/transfers`, {
        targetAccount,
        quote,
        customerTransactionId,
        details,
      });
    };
    this.deleteRecipientAccount = function (accountId) {
      return request('DELETE', `/accounts/${accountId}`);
    };
    this.fundTransfer = function ({transferId, type = 'BALANCE'}) {
      return request('POST', `/transfers/${transferId}/payments`, {
        type,
      });
    };
    this.getBorderlessAccounts = function (profileId) {
      return request('GET', `/borderless-accounts?profileId=${profileId}`);
    };
    this.getQuote = function (quoteId) {
      return request('GET', `/quotes/${quoteId}`);
    };
    this.getProfiles = function () {
      return request('GET', `/profiles`);
    };
    this.getRecipientAccounts = function ({profile, currency}) {
      return request(
        'GET',
        `/accounts?profile=${profile}&currency=${currency}`
      );
    };
  } catch (err) {
    console.error(err);
  }
};

module.exports = transferwise;
