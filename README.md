# Blockchain workshop

## Description

This project is a demo application for playing a head or tail to win funds deposited by two parties.

It will deploy a smart-contract where two players can play against
each other and win staked asset. The first player needs to deploy a contract and
pick Head or Tail. Alongside with the choice, the first player also deposits a
specified amount of tokens. The second player will have to deposit exactly the same
amount of tokens when he tries to guess the choice. Whoever wins, gets all deposited
tokens.

Settling the bet function submits the original unencrypted choice to the smart-contract and the
winner is selected based on the correctness of the second user guess. First user needs
to submit his choice alongside the secret random string (security reasons).

The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
transaction you might need to wait up to 120 seconds for the status to be reflected.

## Install & build

```
yarn
```

Build:

```
yarn build

// Contracts only
yarn compile

// TypeScript only
yarn build:types && yarn build:ts
```

## Start

Run CLI version of the bet `src/HeadTail.ts` (uses web3.js):

```
yarn start
```

Run CLI version but with ethers.js library:

```
yarn start:ethers
```

Test:

```
yarn test
```

Make sure to start local blockchain first:

```
yarn start:ganache
```

## Preview

https://youtu.be/85Ku7tXbKX0

## Overview

![Diagram](diagram.png?raw=true 'Architecture')