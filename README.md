# ALT Safe

ALT Safe is an alternative UI for interacting with Safe Smart Contracts. ALT Safe works without any backend.

## Features

- Create new Safe Smart Account (v1.3.0, v1.4.1 or v1.5.0)
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

ALT Safe talks to the chain only through an RPC URL you provide, one per network. On first load, and whenever you
switch to a network without one, the app asks for a URL and checks that it answers `eth_chainId` with the selected
chain before saving it. You can also explicitly fall back to the network's public RPC, or change the URL at any time
from the network menu; new URLs take effect without reloading.

URLs are stored only in this browser's local storage. Public RPCs are rate-limited, so a private endpoint or your own
node is recommended.

## Safe versions and contract addresses

Canonical addresses for Safe v1.3.0, v1.4.1 and v1.5.0 live in
[`src/safe-contracts/addresses/addresses.ts`](./src/safe-contracts/addresses/addresses.ts), taken from the official
[safe-deployments](https://github.com/safe-global/safe-deployments) and
[safe-modules-deployments](https://github.com/safe-global/safe-modules-deployments) registries. When creating a Safe,
each version is offered only if its contracts have code on the connected network.

Contract addresses come only from this file: there is no setting for custom deployments, and no contract address is
read from environment variables.

## Differences from Safe{Wallet}

- Easily runs locally
- No analytics
- No backend services needed

## Setup 

### Install dependencies

```bash
npm i
```

### Start local dev server

```bash
npm run dev
```

## Test

```bash
npm test
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
