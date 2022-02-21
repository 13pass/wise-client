const config = require('dotenv').config();
const Wise = require('transferwise');

const options = {
  apiTokenKey: config.parsed.WISE_API_TOKEN_KEY,
};

const wiseClient = new Wise(options);

(async () => {
  const profiles = await wiseClient.getProfilesV2();
  console.log('profiles', profiles);
  const profileId = profiles[0].id;

  const recipientAccount = await wiseClient.createRecipientAccountV1({
    profile: profileId,
    accountHolderName: 'Recipient user name',
    currency: 'EUR',
    type: 'email',
    details: {
      email: 'recipient@mail.com',
    },
  });
  console.log(recipientAccount);
  const recipientAccounts = await wiseClient.getRecipientAccountsV1({
    profileId,
    currency: 'EUR',
  });
  console.log(recipientAccounts);
  if (recipientAccount.id) {
    await wiseClient.deleteRecipientAccountV1({
      accountId: recipientAccount.id,
    });
  }
})();
