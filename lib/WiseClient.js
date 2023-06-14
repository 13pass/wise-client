const {v4: uuidv4} = require('uuid');

const {makeHttpRequest, getSCA, signToken, getX2FAApproval} = require('./utils');

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
      urlParams += `baseCurrency=${baseCurrency}&`;
    }
    if (from) {
      urlParams += `from=${from}&`;
    }
    if (group) {
      urlParams += `group=${group}&`;
    }
    if (targetCurrency) {
      urlParams += `targetCurrency=${targetCurrency}&`;
    }
    if (time) {
      urlParams += `time=${time}&`;
    }
    if (to) {
      urlParams += `to=${to}&`;
    }
    urlParams = urlParams.substring(0, urlParams.length - 1);
    return makeHttpRequest({
      httpMethod: this.httpClient.get,
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
      httpMethod: this.httpClient.post,
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
      httpMethod: this.httpClient.post,
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
    const [token, signature] = await getSCA({
      url, 
      httpMethod: this.httpClient.get, 
      key: this.scaPrivateKey, 
      body: {type}
    })
    this.createHttpClient({
      scaHeaders: {
        'x-2fa-approval': token,
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

  // User Profiles
  getProfilesV2() {
    return makeHttpRequest({
      httpMethod: this.httpClient.get,
      url: '/v2/profiles',
    });
  }

  async getBalancesStatements({profileId, balanceId, currency, startDate, endDate, format, type}) {
    const params = {
      profileId, 
      balanceId, 
      startDate, 
      endDate
    }

    if(currency)
      params.currency = currency  
    
    params.type = type? type.toUpperCase(): 'COMPACT'

    const queryParams = new URLSearchParams(params).toString();

    format = format? format.toLowerCase(): 'json'

    const url = `/v1/profiles/${profileId}/balance-statements/${balanceId}/statement.${format}?${queryParams}`;    
    
    const [token, signature] = await getSCA({url, httpMethod: this.httpClient.get, key: this.scaPrivateKey})

    this.createHttpClient({
      scaHeaders: {
        'x-2fa-approval': token,
        'X-Signature': signature,
      },
    });

    return makeHttpRequest({
      httpMethod: this.httpClient.get,
      url
    });
  }

  getBankDetails({profileId}) {
    const url = `/v1/profiles/${profileId}/account-details`
    return makeHttpRequest({
      httpMethod: this.httpClient.get,
      url,
    });
  }
}

module.exports = WiseClient;
