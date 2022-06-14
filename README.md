# Wise API Client

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
  let profiles = await wiseClient.getProfilesV2({});
  console.log(profiles);
  const profileId = profiles[0].id;
  let balances = await wiseClient.getBalancesV3({
    profileId,
  });

  res.send(balances);
})();
```
