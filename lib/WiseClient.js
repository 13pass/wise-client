const {v4: uuidv4} = require('uuid');

const {makeHttpRequest, makeScaHttpRequest} = require('./utils');

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

  createHttpClient({idempotenceUuid, scaHeaders}) {
    const axiosCreateOptions = {
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiTokenKey}`,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      timeout: 25000,
    };
    if (idempotenceUuid) {
      axiosCreateOptions.headers['X-Idempotence-Uuid'] = idempotenceUuid;
    }
    if (scaHeaders) {
      for (const entry of Object.entries(scaHeaders)) {
        axiosCreateOptions.headers[entry[0]] = entry[1];
      }
    }
    this.httpClient = this.deps.axios.create(axiosCreateOptions);
  }

  // Exchange Rates
  getExchangeRatesV1({baseCurrency, from, group, targetCurrency, time, to}) {
    const path = '/v1/rates';
    let urlParams = '?';
    if (baseCurrency) {
      urlParams += `source=${baseCurrency}&`;
    }
    if (from) {
      urlParams += `from=${from}&`;
    }
    if (group) {
      urlParams += `group=${group}&`;
    }
    if (targetCurrency) {
      urlParams += `target=${targetCurrency}&`;
    }
    if (time) {
      urlParams += `time=${time}&`;
    }
    if (to) {
      urlParams += `to=${to}&`;
    }
    urlParams = urlParams.substring(0, urlParams.length - 1);
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.get,
      url: `${path}${urlParams}`,
    });
  }

  // Multi-Currency Account
  convertCurrenciesV2({idempotenceUuid, profileId, quoteId}) {
    if (!idempotenceUuid) {
      idempotenceUuid = uuidv4();
    }
    this.createHttpClient({
      idempotenceUuid,
    });
    return makeHttpRequest({
      body: {
        quoteId,
      },
      httpRequestMethodFunc: this.httpClient.post,
      url: `/v2/profiles/${profileId}/balance-movements`,
    });
  }

  getBalancesV3({profileId, types = ['SAVINGS', 'STANDARD']}) {
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.get,
      url: `/v3/profiles/${profileId}/balances?types=${types.toString()}`,
    });
  }

  // Quotes
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
      httpRequestMethodFunc: this.httpClient.post,
      url: '/v2/quotes',
    });
  }

  createQuoteV3({
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
        sourceAmount,
        sourceCurrency,
        targetAmount,
        targetCurrency,
      },
      httpRequestMethodFunc: this.httpClient.post,
      url: `/v3/profiles/${profileId}/quotes`,
    });
  }

  // Recipient Accounts
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
      httpRequestMethodFunc: this.httpClient.post,
      url: '/v1/accounts',
    });
  }

  deleteRecipientAccountV1({accountId}) {
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.delete,
      url: `/v1/accounts/${accountId}`,
    });
  }

  getRecipientAccountsV1({currency, profileId}) {
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.get,
      url: `/v1/accounts?profile=${profileId}&currency=${currency}`,
    });
  }

  // Transfers
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
      httpRequestMethodFunc: this.httpClient.post,
      url: '/v1/transfers',
    });
  }

  cancelTransferV1({transferId}) {
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.put,
      url: `/v1/transfers/${transferId}/cancel`,
    });
  }

  fundTransferV3({profileId, transferId, type}) {
    const url = `/v3/profiles/${profileId}/transfers/${transferId}/payments`;
    const httpMethod = 'post';
    return makeScaHttpRequest({
      body: {type},
      httpMethod,
      key: this.scaPrivateKey,
      url,
      wiseClient: this,
    });
  }

  // User Profiles
  getProfilesV2() {
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.get,
      url: '/v2/profiles',
    });
  }

  // Balance Statements
  getBalanceStatementsV1({
    profileId,
    balanceId,
    currency,
    startDate,
    endDate,
    format,
    type,
  }) {
    const params = {
      profileId,
      balanceId,
      intervalStart: startDate,
      intervalEnd: endDate,
    };

    if (currency) {
      params.currency = currency;
    }

    params.type = type ? type.toUpperCase() : 'COMPACT';

    format = format ? format.toLowerCase() : 'json';

    const queryParams = new URLSearchParams(params).toString();

    const httpMethod = 'get';

    const url = `/v1/profiles/${profileId}/balance-statements/${balanceId}/statement.${format}?${queryParams}`;

    return makeScaHttpRequest({
      httpMethod,
      key: this.scaPrivateKey,
      url,
      wiseClient: this,
    });
  }

  // Bank Account Details
  getBankAccountDetailsV1({profileId}) {
    const url = `/v1/profiles/${profileId}/account-details`;
    return makeHttpRequest({
      httpRequestMethodFunc: this.httpClient.get,
      url,
    });
  }
}

module.exports = WiseClient;
