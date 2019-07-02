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
const Transferwise = require('transferwise');

const TwClient = new Transferwise({
  apiKey: '01234567-890a-bcde-f012-3456789abcde'
});
```

## API

This client uses some of the API endpoints and provides it as a Promise-based client.

below an example of actions that can be achieved with this client:

### Example using a sandbox account

```javascript
const config = require('dotenv').config()
const Transferwise = require('transferwise');

const options = {
  apiKey: config.parsed.TW_API_KEY,
  sandbox: true
};

const TwClient = new Transferwise(options);

(async () => {
  let profiles = await TwClient.getProfiles();
  console.log(profiles);
  let accounts = await TwClient.getBorderlessAccounts(profiles[0].id);
  console.log(accounts[0]);
  for (const balance of accounts[0].balances) {
    console.log(balance);
  }
  let quote = await TwClient.createQuote({
    profile: profiles[0].id,
    source: 'EUR',
    target: 'GBP',
    sourceAmount: '19.84',
    rateType: 'FIXED',
    type: 'BALANCE_CONVERSION'
  });
  console.log(quote);
  if (quote.createdTime) {
    if (quote.rate > 0.85) {
      let conversionTransaction = await TwClient.convertCurrencies({
        borderlessAccountId: accounts[0].id,
        quoteId: quote.id
      });
      console.log(conversionTransaction);
    }
  }
})();
```
