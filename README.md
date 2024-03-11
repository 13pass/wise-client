# Wise API Client

**Important Update**: *Due to recent changes announced by Wise regarding their API functionality, specifically in alignment with the Payment Services Directives (PSD2), certain features previously available through this client might no longer be supported. Specifically, the use of signing API requests for completing strong customer authentication on personal Wise accounts, retrieving account statements, and funding payments via the API have been disabled. While draft transfers can still be created through the API, they must now be funded directly from your multi-currency account using the Wise website or mobile applications. In light of these changes, this repository may not receive further updates.*

A simple client for Wise's API written in Node JS (ES7).

Official docs are found [here](https://api-docs.wise.com/);

## Installation

To install simply use npm or clone repo:

`npm install transferwise`

or clone repo and make link:

`$> git clone git@github.com:13pass/wise-client.git`

## Usage

This does not cover all Wise's API yet, but this repository will hopefully be updated to reflect the API.

To init just plug in your apiTokenKey like so:

```javascript
const Wise = require('transferwise');

const wiseClient = new Wise({
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
  const profiles = await wiseClient.getProfilesV2({});
  console.log(profiles);
  const profileId = profiles[0].id;
  const balances = await wiseClient.getBalancesV3({
    profileId,
  });
  for (const balance of balances) {
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
