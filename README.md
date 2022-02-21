# Transferwise API Client

A simple client for Transferwise's API written in Node JS (ES7)
Official docs are found [here](https://api-docs.transferwise.com);

## Installation

To install simply use npm or clone repo:

`npm install transferwise`

or clone repo and make link:

`$> git clone git@github.com:13pass/transferwise-client.git`

## Usage

This does not cover all Transferwise's API yet, but this repository will hopefully be updated to reflect the API.

To init juste plug in your apiKey like so:

```javascript
const Wise = require('transferwise');

const wiseClient = new Transferwise({
  apiTokenKey: '01234567-890a-bcde-f012-3456789abcde',
});
```

## API

This client uses some of the API endpoints and provides it as a Promise-based client.

below an example of actions that can be achieved with this client:

### Example using a sandbox account

```javascript
const config = require('dotenv').config();
const Wise = require('transferwise');

const options = {
  apiKey: config.parsed.TW_API_KEY,
  sandbox: true,
};

const wiseClient = new Wise(options);

(async () => {
  let profiles = await wiseClient.getProfilesV2({});
  console.log(profiles);
  const profileId = profiles[0].id;
  let accounts = await wiseClient.getBorderlessAccounts({
    profileId,
  });
  let borderlessAccountId = accounts[0].id;
  for (const balance of accounts[0].balances) {
    console.log(balance);
  }
  let quote = await wiseClient.createQuoteV2({
    profileId,
    sourceCurrency: 'EUR',
    targetCurrency: 'GBP',
    targetAmount: 19.84,
    payOut: 'BALANCE',
  });
  console.log(quote);
  if (quote.createdTime) {
    if (quote.rate > 0.85) {
      let conversionTransaction = await wiseClient.convertCurrenciesV2({
        profileId,
        quoteId: quote.id,
      });
      console.log(conversionTransaction);
    }
  }
})();
```
