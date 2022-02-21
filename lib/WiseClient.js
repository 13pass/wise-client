const {v4: uuidv4} = require('uuid');

const {makeHttpRequest, signToken} = require('./utils');

const WISE_PROD_HOST = 'https://api.transferwise.com';
const WISE_SANDBOX_HOST = 'https://api.sandbox.transferwise.tech';

class WiseClient {
  constructor(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('constuctor options must be an object');
    }
    if (!options.deps) {
      throw new Error('deps must be defined in options');
    }
    this.deps = options.deps || {};
    if (!this.deps.axios) {
      throw new Error('axios dependency must be injected via deps object');
    }
    if (!options.apiTokenKey && !options.sandboxApiTokenKey) {
      throw new Error(
        'apiTokenKey or sandboxApiTokenKey must be defined in options object'
      );
    }
    this.scaPrivateKey = options.scaPrivateKey;
    this.apiTokenKey = options.apiTokenKey;
    this.baseURL = WISE_PROD_HOST;
    this.isSandbox = false;
    if (options.sandboxApiTokenKey) {
      this.apiTokenKey = options.sandboxApiTokenKey;
      this.baseURL = WISE_SANDBOX_HOST;
      this.isSandbox = true;
    }
    this.createHttpClient({});
  }

  createHttpClient({scaHeaders}) {
    const axiosCreateOptions = {
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiTokenKey}`,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      timeout: 25000,
    };
    if (scaHeaders) {
      for (const entry of Object.entries(scaHeaders)) {
        axiosCreateOptions.headers[entry[0]] = entry[1];
      }
    }
    this.httpClient = this.deps.axios.create(axiosCreateOptions);
  }

  // Multi-Currency Account
  convertCurrenciesV2({profileId, quoteId}) {
    return makeHttpRequest({
      body: {
        quoteId,
      },
      httpMethod: this.httpClient.post,
      url: `/v2/profiles/${profileId}/balance-movements`,
    });
  }

  getBalancesV3({profileId, types = ['SAVINGS', 'STANDARD']}) {
    return makeHttpRequest({
      httpMethod: this.httpClient.get,
      url: `/v3/profiles/${profileId}/balances?types=${types.toString()}`,
    });
  }

  // quotes
  createQuoteV2({
    payOut,
    preferredPayIn,
    profileId,
    sourceAmount,
    sourceCurrency,
    targetAmount,
    targetCurrency,
  }) {
    return makeHttpRequest({
      body: {
        payOut,
        preferredPayIn,
        profile: profileId,
        sourceAmount,
        sourceCurrency,
        targetAmount,
        targetCurrency,
      },
      httpMethod: this.httpClient.post,
      url: '/v2/quotes',
    });
  }

  // recipient-accounts
  createRecipientAccountV1({
    accountHolderName,
    currency,
    details,
    ownedByCustomer,
    profileId,
    type,
  }) {
    return makeHttpRequest({
      body: {
        accountHolderName,
        currency,
        details,
        ownedByCustomer,
        profile: profileId,
        type,
      },
      httpMethod: this.httpClient.post,
      url: '/v1/accounts',
    });
  }

  deleteRecipientAccountV1({accountId}) {
    return makeHttpRequest({
      httpMethod: this.httpClient.delete,
      url: `/v1/accounts/${accountId}`,
    });
  }

  getRecipientAccountsV1({currency, profileId}) {
    return makeHttpRequest({
      httpMethod: this.httpClient.get,
      url: `/v1/accounts?profile=${profileId}&currency=${currency}`,
    });
  }

  // transfers
  createTransferV1({
    sourceAccountId,
    targetAccountId,
    quoteUuid,
    customerTransactionId,
    details,
  }) {
    if (!customerTransactionId) {
      customerTransactionId = uuidv4();
    }
    return makeHttpRequest({
      body: {
        sourceAccount: sourceAccountId,
        targetAccount: targetAccountId,
        quoteUuid,
        customerTransactionId,
        details,
      },
      httpMethod: this.httpClient.post,
      url: '/v1/transfers',
    });
  }

  cancelTransferV1({transferId}) {
    return makeHttpRequest({
      httpMethod: this.httpClient.put,
      url: `/v1/transfers/${transferId}/cancel`,
    });
  }

  async fundTransferV3({profileId, transferId, type}) {
    try {
      const response = await makeHttpRequest({
        body: {
          type,
        },
        httpMethod: this.httpClient.post,
        url: `/v3/profiles/${profileId}/transfers/${transferId}/payments`,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 403) {
        if (!this.scaPrivateKey) {
          throw new Error(
            'SCA private key is needed to perform this operation'
          );
        }
        const oneTimeToken = error.response.headers['x-2fa-approval'];
        const signature = signToken({
          key: this.scaPrivateKey,
          token: oneTimeToken,
        });
        this.createHttpClient({
          scaHeaders: {
            'x-2fa-approval': oneTimeToken,
            'X-Signature': signature,
          },
        });
        return makeHttpRequest({
          body: {
            type,
          },
          httpMethod: this.httpClient.post,
          url: `/v3/profiles/${profileId}/transfers/${transferId}/payments`,
        });
      }
      throw error;
    }
  }

  // user-profiles
  getProfilesV2() {
    return makeHttpRequest({
      httpMethod: this.httpClient.get,
      url: '/v2/profiles',
    });
  }
}

module.exports = WiseClient;
