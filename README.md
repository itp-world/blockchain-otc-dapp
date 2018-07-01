# Blockchain OTC Market - Backend and web client

## Setup Backend

### Requirements

* [Node.js](https://nodejs.org) >= 8.*
* [MongoDB](https://www.mongodb.com) >= 3.4
* [Parity](https://github.com/paritytech/parity/releases/tag/v1.9.6) 1.9.6-stable

The following node packages or their dependencies uses native libraries:
* [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
* [eth-lightwallet](https://github.com/ConsenSys/eth-lightwallet)
* [web3.js](https://github.com/ethereum/web3.js)

Please take care for the dependencies of the build tool [node-gyp](https://github.com/nodejs/node-gyp).


### Configuration

#### Parity

See [Configuring Parity](https://wiki.parity.io/Configuring-Parity) for the complete documentation.

#### Backend

See [`./backend/config/defaults.json`](./backend/config/defaults.json) for the default configuration and define your custom configuration in `./config.json`.

#### Additional resources

* [Parity example setup](./doc/parity.md)

## Development Mode

``` bash
# install dependencies
$ npm install

# run setup for initial user, wallet and contracts (will skip for already existing ones)
$ npm run setup

# start server with hot reload at localhost:3000 (default configuration)
$ npm run dev
```

## Production Mode

``` bash
# install dependencies
$ NODE_ENV=production npm install

# run setup for initial user, wallet and contracts (will skip for already existing ones)
$ NODE_ENV=production npm run setup

# start server for production at localhost:3000 (default configuration)
$ NODE_ENV=production npm run start
```

## Setup Client

See [Blockchain OTC Market - Client](./client/README.md)

### Initial Login

Credentials for the admin user created during setup:
```
Username: admin
Password: insecure!password
```
The password should be changed after login.

### Process to setup a trading scenario

Initial user `admin` (above) has to:
* distribute **Euro** token to existing other users who have to sign up themselves (via client user interface).
* release **Asset** token for trading (via client user interface).

Users with Euro token can then buy Asset token, users with Asset token can sell them for Euro token.
