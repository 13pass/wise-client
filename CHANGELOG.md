# CHANGELOG

## 2.1.0 - 2025-04-17

- update method `getExchangeRatesV1` to reflect changes on [Wise API](https://docs.wise.com/api-docs/api-reference/rate) by merging work done by [Ryan Sadler](https://github.com/rrx)
- upgrade a bunch of dependencies

## 2.0.7 - 2022-10-08

- Add method `createQuoteV3` to create a quote for a profile

## 2.0.6 - 2022-06-17

- Add .idea to gitignore
- Replace `getBorderlessAccounts` by `getBalancesV3` to fix README.md file
- Capitalize name of each API section
- add method `getExchangeRatesV1` to class WiseClient

## 2.0.5 - 2022-05-2`

- Fix method `convertCurrenciesV2` by adding header `X-Idempotence-Uuid` to request

## 2.0.4 - 2019-03-12

- Upgrade dependency minimist package from v1.2.5 to v1.2.6

## 2.0.3 - 2022-02-22

- Rename github repository from `transferwise-client` to `wise-client`
- Rename `TransferWise` to `Wise` in README.md file
- Rename `TransferWise` to `Wise` in package.json file

## 2.0.2 - 2022-02-21

- Correct README.md Usage part.

## 2.0.1 - 2022-02-21

- Change the name of the package back to `transferwise` since `wise` is not available.

## 2.0.0 - 2022-02-21

- Total rework of the transferwise client
  - Add CHANGELOG.md file.
  - Add tests using jest.
  - Change the name of the package in consequence of the name of the service from `transferwise` to `wise`.
  - Add support for [strong-customer-authentication](https://api-docs.transferwise.com/#strong-customer-authentication) using option `scaPrivateKey`.
  - Upgrade API endpoints calls to use its newer versions.
  - Upgrade to node LTS version 16.
