const config = require('dotenv').config();
const Transferwise = require('transferwise');

const options = {
  apiKey: config.parsed.TW_API_KEY,
  //sandbox: true,
};

const TwClient = new Transferwise(options);

(async () => {
  let profiles = await TwClient.getProfiles({});
  console.log(profiles);
  let profileId = profiles[0].id;
  let recipientAccount = await TwClient.createRecipientAccount({
    profile: profileId,
    accountHolderName: 'Recipient user name',
    currency: 'EUR',
    type: 'email',
    details: {
      email: 'recipient@mail.com',
    },
  });
  console.log(recipientAccount);
  let recipientAccounts = await TwClient.getRecipientAccounts({
    profile: profileId,
    currency: 'EUR',
  });
  console.log(recipientAccounts);
})();
