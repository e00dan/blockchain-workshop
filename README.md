# Blockchain workshop

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

Start `src/HeadTail.ts`:
```
yarn start
```

Test:
```
yarn test
```

Make sure to start local blockchain first:

```
yarn start:ganache
```

## Overview

![Diagram](diagram.png?raw=true "Architecture")

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

## Slides

- Polish version: https://drive.google.com/open?id=1nGIvaI70fv-zqX3EsXHxZfhqX9QGQdylCdpFZsvwPnM

## Credits

Authored by [Daniel Kmak](https://www.linkedin.com/in/kmakdaniel/).