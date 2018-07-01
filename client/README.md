# Blockchain OTC Market - Client

## Setup

### Requirements

* [Node.js](https://nodejs.org) >= 8.*
* [Blockchain OTC Market - backend](../README.md)

The following node packages or their dependencies uses native libraries:
* [node-sass](https://github.com/sass/node-sass)
* [eth-lightwallet](https://github.com/ConsenSys/eth-lightwallet)
* [web3.js](https://github.com/ethereum/web3.js)

Please take care for the dependencies of the build tool [node-gyp](https://github.com/nodejs/node-gyp).


## Development

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:8080
$ API_URL=http://localhost:3000/api/v1/ npm run dev
```

## Production

``` bash
# build for production with minification
API_URL=http://localhost:3000/api/v1/ npm run build

# build for production and view the bundle analyzer report
API_URL=http://localhost:3000/api/v1/ npm run build --report
```
