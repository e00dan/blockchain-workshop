# Ethereum workshop

Learn Ethereum development by creating application where you can bet what choice has the other party committed to the blockchain and win cryptocurrency in the process.

## Stages

| Stage | Status | Description |
| --- | --- | --- |
| [master](https://github.com/Kuzirashi/blockchain-workshop/tree/master) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=master) | Starting point |
| [stage-1](https://github.com/Kuzirashi/blockchain-workshop/tree/stage-1) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=stage-1) | Create a function that saves user one address and accepts deposit |
| [stage-2](https://github.com/Kuzirashi/blockchain-workshop/tree/stage-2) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=stage-2) | Allow two users to deposit 1 ETH and save their address |
| [stage-3](https://github.com/Kuzirashi/blockchain-workshop/tree/stage-3) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=stage-3) | Add ability to save boolean along with the address |
| [stage-3.1](https://github.com/Kuzirashi/blockchain-workshop/tree/stage-3.1) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=stage-3.1) | Move user one deposit function to constructor |
| [stage-4](https://github.com/Kuzirashi/blockchain-workshop/tree/stage-4) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=stage-4) | Add prize distribution function, sends ETH after a correct guess |
| [stage-5](https://github.com/Kuzirashi/blockchain-workshop/tree/stage-5) | ![](https://api.travis-ci.com/Kuzirashi/blockchain-workshop.svg?branch=stage-5) | Encrypt user one choice with secret |

## Requirements

1. Node.js version `>= 16`

## Install and run

Install:
```
yarn
```

Build:

```
yarn build

// Contracts only
yarn compile

// TypeScript only
yarn build:ts
```

Start local Ethereum blockchain:
```
yarn start:ethereum
```

Run demo (`src/HeadTail.ts`):
```
yarn start
```

Test:
```
yarn test
```