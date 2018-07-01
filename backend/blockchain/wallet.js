'use strict'

var fs = require('fs')
var lightwallet = require('eth-lightwallet')
var config = require('../config')
var logger = require('../logger')

var walletFile = config.get('walletFile')
var wallet = {}

module.exports = () => {
  if (wallet.address || !fs.existsSync(walletFile)) return wallet

  try {
    wallet = JSON.parse(fs.readFileSync(walletFile, 'utf8'))
    wallet.keystore = lightwallet.keystore.deserialize(wallet.keystore)
    wallet.address = wallet.keystore.getAddresses()[0]
  } catch (error) {
    logger.error(`error while reading wallet from file ${walletFile}`, { category: 'setup', error })
    wallet = {}
  }

  return wallet
}
