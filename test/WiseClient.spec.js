const fs = require('fs');
const config = require('dotenv').config();

const testif = (condition) => (condition ? test : test.skip);
const WiseClient = require('../lib/WiseClient');

describe('WiseClient Class', () => {
  describe('config object', () => {
    it('should not accept an empty config', () => {
      const configUndefined = () => {
        // eslint-disable-next-line no-new
        new WiseClient();
      };
      expect(configUndefined).toThrow(/options must be an object/);
    });
    it('should only accept an object', () => {
      const configAsString = () => {
        // eslint-disable-next-line no-new
        new WiseClient('options');
      };
      expect(configAsString).toThrow(/options must be an object/);
    });

    it('should not accept that axios is not passed', () => {
      const configAsString = () => {
        // eslint-disable-next-line no-new
        new WiseClient({});
      };
      expect(configAsString).toThrow(/deps must be defined in options/);
    });

    it('should not accept that axios is not passed', () => {
      const configAsString = () => {
        // eslint-disable-next-line no-unused-vars
        const wiseClient = new WiseClient({deps: {}});
      };
      expect(configAsString).toThrow(
        /axios dependency must be injected via deps object/
      );
    });

    it('should not accept that apiTokenKey and sandboxApiTokenKey are both empty', () => {
      const configAsString = () => {
        // eslint-disable-next-line no-unused-vars
        const wiseClient = new WiseClient({deps: {axios: {}}});
      };
      expect(configAsString).toThrow(
        /apiTokenKey or sandboxApiTokenKey must be defined in options object/
      );
    });

    it('should set isSandbox to true when sandboxApiTokenKey is set', () => {
      const axiosStub = {
        create: () => {
          return {};
        },
      };
      const spyCreate = jest.spyOn(axiosStub, 'create');
      const wiseClient = new WiseClient({
        deps: {axios: axiosStub},
        sandboxApiTokenKey: 'sandboxApiTokenKey',
      });
      expect(spyCreate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer sandboxApiTokenKey',
          }),
        })
      );
      expect(wiseClient.isSandbox).toBe(true);
      expect(wiseClient.apiTokenKey).toBe('sandboxApiTokenKey');
    });

    it('should set isSandbox to false when apiTokenKey is set', () => {
      const axiosStub = {
        create: () => {
          return {};
        },
      };
      const spyCreate = jest.spyOn(axiosStub, 'create');
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyCreate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer apiTokenKey',
          }),
        })
      );
      expect(wiseClient.isSandbox).toBe(false);
      expect(wiseClient.apiTokenKey).toBe('apiTokenKey');
    });
  });

  describe('Quotes', () => {
    test('createQuoteV2 should make a POST request with the right parameters', async () => {
      const createStub = {
        post: (url, data) => {
          return {};
        },
      };
      const spyPost = jest.spyOn(createStub, 'post');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyPost).toHaveBeenCalledTimes(0);
      await wiseClient.createQuoteV2({
        sourceCurrency: 'EUR',
        targetCurrency: 'USD',
        sourceAmount: 100,
        targetAmount: null,
        profileId: 123456,
        payOut: null,
        preferredPayIn: null,
      });
      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenLastCalledWith('/v2/quotes', {
        sourceCurrency: 'EUR',
        targetCurrency: 'USD',
        sourceAmount: 100,
        targetAmount: null,
        profile: 123456,
        payOut: null,
        preferredPayIn: null,
      });
    });
  });

  describe('Recipient accounts', () => {
    test('createRecipientAccountV1 should make a POST request with the right parameters', async () => {
      const createStub = {
        post: (url, data) => {
          return {};
        },
      };
      const spyPost = jest.spyOn(createStub, 'post');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyPost).toHaveBeenCalledTimes(0);
      await wiseClient.createRecipientAccountV1({
        currency: 'EUR',
        type: 'email',
      });
      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenLastCalledWith('/v1/accounts', {
        currency: 'EUR',
        type: 'email',
      });
    });

    test('deleteRecipientAccountV1 should make a DELETE request with the right parameters', async () => {
      const createStub = {
        delete: (url, data) => {
          return {};
        },
      };
      const spyDelete = jest.spyOn(createStub, 'delete');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyDelete).toHaveBeenCalledTimes(0);
      await wiseClient.deleteRecipientAccountV1({accountId: '987654'});
      expect(spyDelete).toHaveBeenCalledTimes(1);
      expect(spyDelete).toHaveBeenLastCalledWith('/v1/accounts/987654');
    });

    test('getRecipientAccountsV1 should make a GET request with the right parameters', async () => {
      const createStub = {
        get: (url) => {
          return {};
        },
      };
      const spyGet = jest.spyOn(createStub, 'get');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyGet).toHaveBeenCalledTimes(0);
      await wiseClient.getRecipientAccountsV1({
        currency: 'EUR',
        profileId: 1234567,
      });
      expect(spyGet).toHaveBeenCalledTimes(1);
      expect(spyGet).toHaveBeenLastCalledWith(
        '/v1/accounts?profile=1234567&currency=EUR'
      );
    });
  });

  describe('Transfers', () => {
    test('createTransferV1 should make a POST request with the right parameters', async () => {
      const createStub = {
        post: (url, data) => {
          return {};
        },
      };
      const spyPost = jest.spyOn(createStub, 'post');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyPost).toHaveBeenCalledTimes(0);
      await wiseClient.createTransferV1({
        sourceAccountId: 11111111,
        targetAccountId: 22222222,
        quoteUuid: '11144c35-9fe8-4c32-b7fd-d05c2a7734bf',
        customerTransactionId:
          'unique-identifier-generated-for-the-transfer-attempt',
        details: {
          reference: 'to my friend',
        },
      });
      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenLastCalledWith('/v1/transfers', {
        sourceAccount: 11111111,
        targetAccount: 22222222,
        quoteUuid: '11144c35-9fe8-4c32-b7fd-d05c2a7734bf',
        customerTransactionId:
          'unique-identifier-generated-for-the-transfer-attempt',
        details: {
          reference: 'to my friend',
        },
      });
    });

    test('cancelTransferV1 should make a PUT request with the right parameters', async () => {
      const createStub = {
        put: (url, data) => {
          return {};
        },
      };
      const spyPut = jest.spyOn(createStub, 'put');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyPut).toHaveBeenCalledTimes(0);
      await wiseClient.cancelTransferV1({transferId: '987654'});
      expect(spyPut).toHaveBeenCalledTimes(1);
      expect(spyPut).toHaveBeenLastCalledWith('/v1/transfers/987654/cancel');
    });

    test('fundTransferV3 should make a POST request with the right parameters', async () => {
      const createStub = {
        post: (url, data) => {
          return {};
        },
      };
      const spyPost = jest.spyOn(createStub, 'post');
      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });

      await wiseClient.fundTransferV3({
        profileId: 1234567,
        transferId: 7657656,
        type: 'BALANCE',
      });
      expect(spyPost).toHaveBeenLastCalledWith(
        '/v3/profiles/1234567/transfers/7657656/payments',
        {
          type: 'BALANCE',
        }
      );
    });

    testif(config.parsed.WISE_API_SCA_PRIVATE_KEY_FILEPATH)(
      'fundTransferV3 should sign strong customer authentication token when response status is 403',
      async () => {
        const createStub = {
          post: (url, data) => {
            if (typeof this.counter == 'undefined') {
              this.counter = 0;
            }
            this.counter += 1;
            if (this.counter === 1) {
              // at first call throw a 403 error with filled headers
              const errorObject = {
                response: {
                  status: 403,
                  headers: {
                    'x-2fa-approval-result': 'REJECTED',
                    'x-2fa-approval': 'be2f6579-9426-480b-9cb7-d8f1116cc8b9',
                  },
                },
              };
              throw errorObject;
            }
            // at second call just return
            return {};
          },
        };
        const spyPost = jest.spyOn(createStub, 'post');
        const axiosStub = {
          // eslint-disable-next-line require-await
          create: () => {
            return createStub;
          },
        };
        const spyCreate = jest.spyOn(axiosStub, 'create');
        const wiseOptions = {
          apiTokenKey: 'apiTokenKey',
          deps: {axios: axiosStub},
        };
        wiseOptions.scaPrivateKey = fs.readFileSync(
          config.parsed.WISE_API_SCA_PRIVATE_KEY_FILEPATH,
          'utf8'
        );
        const wiseClient = new WiseClient(wiseOptions);
        expect(spyCreate).toHaveBeenCalledTimes(1);

        await wiseClient.fundTransferV3({
          profileId: 1234567,
          transferId: 7657656,
          type: 'BALANCE',
        });

        expect(spyPost).toHaveBeenLastCalledWith(
          '/v3/profiles/1234567/transfers/7657656/payments',
          {
            type: 'BALANCE',
          }
        );
        expect(spyCreate).toHaveBeenCalledTimes(2);
        expect(spyCreate).toHaveBeenLastCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-2fa-approval': 'be2f6579-9426-480b-9cb7-d8f1116cc8b9',
            }),
          })
        );
      }
    );
  });

  describe('User profiles', () => {
    it('getProfilesV2 should make a GET request with the right parameters', () => {
      const createStub = {
        get: (url) => {
          return {};
        },
      };
      const spyGet = jest.spyOn(createStub, 'get');

      const axiosStub = {
        // eslint-disable-next-line require-await
        create: () => {
          return createStub;
        },
      };
      const wiseClient = new WiseClient({
        apiTokenKey: 'apiTokenKey',
        deps: {axios: axiosStub},
      });
      expect(spyGet).toHaveBeenCalledTimes(0);
      wiseClient.getProfilesV2();
      expect(spyGet).toHaveBeenCalledTimes(1);
      expect(spyGet).toHaveBeenLastCalledWith('/v2/profiles');
    });
  });
});
