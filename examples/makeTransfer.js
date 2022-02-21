const fs = require('fs');
const config = require('dotenv').config();
const Wise = require('transferwise');

const options = {
  apiTokenKey: config.parsed.WISE_API_TOKEN_KEY,
};

if (config.parsed.WISE_API_SCA_PRIVATE_KEY_FILEPATH) {
  // eslint-disable-next-line no-sync
  const scaPrivateKey = fs.readFileSync(
    config.parsed.WISE_API_SCA_PRIVATE_KEY_FILEPATH,
    'utf-8'
  );
  options.scaPrivateKey = scaPrivateKey;
}

const wiseClient = new Wise(options);

(async () => {
  const profiles = await wiseClient.getProfilesV2();
  const profileId = profiles[0].id;

  const quote = await wiseClient.createQuoteV2({
    profileId,
    sourceCurrency: 'EUR',
    targetCurrency: 'EUR',
    targetAmount: 42,
    payOut: 'BALANCE',
  });
  // console.log(quote);
  const recipientAccounts = await wiseClient.getRecipientAccountsV1({
    profileId,
    currency: 'EUR',
  });
  // console.log('recipientAccounts', recipientAccounts);
  const targetAccount = recipientAccounts.find(
    (a) => a.accountHolderName === 'Recipient Name'
  );
  // console.log('targetAccount', targetAccount);
  if (quote && targetAccount) {
    const transfer = await wiseClient.createTransferV1({
      targetAccountId: targetAccount.id,
      quoteUuid: quote.id,
      details: {
        reference: 'transfer reference',
      },
    });
    console.log('transfer', JSON.stringify(transfer, null, 2));
    if (transfer) {
      const result = await wiseClient.cancelTransferV1({
        transferId: transfer.id,
      });
      // const result = await wiseClient.fundTransferV3({
      //   profileId,
      //   transferId: transfer.id,
      //   type: 'BALANCE',
      // });
      console.log(result);
    }
  }
})();
