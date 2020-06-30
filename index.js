const transferwise = function (config) {
  const uuidv4 = require('uuid/v4');
  const request = require('./lib/request')(config);

  try {
    this.apiKey = config.apiKey;
    this.request = request;

    this.cancelTransfer = function ({transferId}) {
      return request({method: 'PUT', path: `/transfers/${transferId}/cancel`});
    };
    this.convertCurrencies = function ({borderlessAccountId, quoteId, uuid}) {
      if (!uuid) {
        uuid = uuidv4();
      }
      return request({
        data: {
          quoteId,
        },
        headers: {
          'X-idempotence-uuid': uuid,
        },
        method: 'POST',
        path: `/borderless-accounts/${borderlessAccountId}/conversions`,
      });
    };
    this.createQuote = function ({data}) {
      return request({data, method: 'POST', path: `/quotes`});
    };
    this.createRecipientAccount = function ({
      currency = 'GBP',
      type = 'sort_code',
      profile,
      ownedByCustomer = false,
      accountHolderName,
      details,
    }) {
      return request({
        data: {
          currency,
          type,
          profile,
          ownedByCustomer,
          accountHolderName,
          details,
        },
        method: 'POST',
        path: `/accounts`,
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
      return request({
        data: {
          targetAccount,
          quote,
          customerTransactionId,
          details,
        },
        method: 'POST',
        path: `/transfers`,
      });
    };
    this.deleteRecipientAccount = function ({accountId}) {
      return request({method: 'DELETE', path: `/accounts/${accountId}`});
    };
    this.fundTransfer = function ({transferId, type = 'BALANCE'}) {
      return request({
        data: {
          type,
        },
        method: 'POST',
        path: `/transfers/${transferId}/payments`,
      });
    };
    this.getBorderlessAccounts = function ({profileId, versionPrefix = 'v2'}) {
      return request({
        method: 'GET',
        path: `/borderless-accounts?profileId=${profileId}`,
        versionPrefix,
      });
    };
    this.getQuote = function ({quoteId}) {
      return request({method: 'GET', path: `/quotes/${quoteId}`});
    };
    this.getProfiles = function ({versionPrefix = 'v2'} = {}) {
      return request({method: 'GET', path: `/profiles`, versionPrefix});
    };
    this.getProfileActivities = function ({
      limit = 50,
      profileId,
      versionPrefix = 'v1',
    } = {}) {
      return request({
        method: 'GET',
        path: `/profiles/${profileId}/activities/?size=${limit}`,
        versionPrefix,
      });
    };
    this.getProfilePermissions = function ({
      profileId,
      versionPrefix = 'v1',
    } = {}) {
      return request({
        method: 'GET',
        path: `/permissions/${profileId}`,
        versionPrefix,
      });
    };
    this.getRecipientAccounts = function ({
      currency,
      profile,
      versionPrefix = 'v2',
    }) {
      let path = `/accounts?profile=${profile}`;
      if (currency) {
        path = `${path}&currency=${currency}`;
      }
      return request({
        method: 'GET',
        path,
        versionPrefix,
      });
    };
  } catch (err) {
    console.error(err);
  }
};

module.exports = transferwise;
