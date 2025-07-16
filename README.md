# ALT Safe

ALT Safe is an alternative UI for interacting with Safe Smart Contracts. ALT Safe works without any backend.

## Features

- Create new Safe Smart Account
- Add support for smart contract calls using **template specificaiton**.
- Import existing Safe Smart Account
- UI Components to
    -   Transfer native tokens
    -   Transfer ERC20 tokens
    -   Build smart contract calls (only `call`)
    -   Import transactions for signing
- Batch transactions
- Aggregate signatures from multiple signers
- View Safe storage slots like Owners, Modules, Nonce, Singleton, etc.
- Option to set custom Safe Proxy Factory, Fallback Handler, etc addresses.

### Unique Feature

A unique feature of this project is its support for smart contract integrations using specifications. This specification is a JSON file that contains:

The function to call on the smart contract.
User inputs required to build the function call.
Context values, which can be used to compute dynamic values.
Validations to ensure user inputs are correct and provide meaningful error messages to users.
This allows developers and users to seamlessly interact with different smart contracts in a structured and reliable manner.

- [Template specification](./docs/template-specification.md)
- [Default templates](./src/templates)

This is a [Vite](https://vitejs.dev) project bootstrapped with [`create-wagmi`](https://github.com/wevm/wagmi/tree/main/packages/create-wagmi).

## RPC

ALT Safe relies on the user provided RPC URL or the default RPC URL provided by `wagmi`. It is very important to provide a stable and performant RPC node. Typically, public RPC URLs are not sufficient, and it is recommended to run against a private RPC URL or your own node directly.

## Differences from Safe{Wallet}

- Easily runs locally
- No analytics
- No backend services needed

## Setup 

### Install dependencies

```bash
npm i
```

### Set env parametes

1. Create `.env` file
2. Set property values

### Start local dev server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Frameworks

This app is built using the following frameworks:

- Viem
- Wagmi
- React
- MUI
