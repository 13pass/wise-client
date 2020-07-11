const transferwise = function (config) {
  const uuidv4 = require('uuid/v4');
  const request = require('./lib/request')(config);

  try {
    this.apiKey = config.apiKey;
    this.request = request;

    this.cancelTransfer = function ({transferId, versionPrefix = 'v1'}) {
      return request({
        method: 'PUT',
        path: `/transfers/${transferId}/cancel`,
        versionPrefix,
      });
    };
    this.convertCurrencies = function ({
      borderlessAccountId,
      quoteId,
      uuid,
      versionPrefix = 'v1',
    }) {
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
        versionPrefix,
      });
    };
    this.createQuote = function ({data, versionPrefix = 'v1'}) {
      return request({
        data,
        method: 'POST',
        path: `/quotes`,
        versionPrefix,
      });
    };
    this.createRecipientAccount = function ({
      accountHolderName,
      currency = 'GBP',
      details,
      ownedByCustomer = false,
      profile,
      type = 'sort_code',
      versionPrefix = 'v1',
    }) {
      return request({
        data: {
          accountHolderName,
          currency,
          details,
          ownedByCustomer,
          profile,
          type,
          versionPrefix,
        },
        method: 'POST',
        path: `/accounts`,
      });
    };
    this.createTransfer = function ({
      customerTransactionId,
      details,
      quote,
      targetAccount,
      versionPrefix = 'v1',
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
        versionPrefix,
      });
    };
    this.deleteRecipientAccount = function ({accountId, versionPrefix = 'v1'}) {
      return request({
        method: 'DELETE',
        path: `/accounts/${accountId}`,
        versionPrefix,
      });
    };
    this.fundTransfer = function ({
      transferId,
      type = 'BALANCE',
      versionPrefix = 'v1',
    }) {
      return request({
        data: {
          type,
        },
        method: 'POST',
        path: `/transfers/${transferId}/payments`,
        versionPrefix,
      });
    };
    this.getBorderlessAccounts = function ({profileId, versionPrefix = 'v2'}) {
      return request({
        method: 'GET',
        path: `/borderless-accounts?profileId=${profileId}`,
        versionPrefix,
      });
    };
    this.getQuote = function ({quoteId, versionPrefix = 'v1'}) {
      return request({
        method: 'GET',
        path: `/quotes/${quoteId}`,
        versionPrefix,
      });
    };
    this.getProfiles = function ({versionPrefix = 'v2'} = {}) {
      return request({method: 'GET', path: `/profiles`, versionPrefix});
    };
    this.getProfileActivities = function ({
      limit = 50,
      profileId,
      since,
      status,
      until,
      versionPrefix = 'v1',
    } = {}) {
      let path = `/profiles/${profileId}/activities/?size=${limit}`;
      if (status) {
        path = `${path}&status=${status}`;
      }
      if (since) {
        if (since.length === 10) {
          since = `${since}T00:00:00Z`;
        }
        path = `${path}&since=${since}`;
      }
      if (until) {
        if (until.length === 10) {
          until = `${until}T00:00:00Z`;
        }
        path = `${path}&until=${until}`;
      }
      return request({
        method: 'GET',
        path,
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
