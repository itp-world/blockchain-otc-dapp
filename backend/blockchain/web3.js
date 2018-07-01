'use strict'

var Web3 = require('web3')
var config = require('../config')
var logger = require('../logger')

var url = config.get('parity:url')
var category = 'blockchain'
var instance = null

try {
  instance = new Web3(url)

  if (url.startsWith('ws')) { // websocket
    instance.currentProvider.on('connect', () => {
      logger.info(`established connection to ${url}`, { category })
    })
    instance.currentProvider.on('error', () => {
      logger.error(`error while creating connection to ${url}`, { category })
    })
    // FIXME no reconnect after failure
    // https://github.com/ethereum/web3.js/issues/1085
  } else {
    logger.info(`defined connection to ${url}`, { category })
  }
} catch (error) {
  logger.error(error, { category })
}

module.exports = instance
