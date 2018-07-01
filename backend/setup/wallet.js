'use strict'

var fs = require('fs')
var crypto = require('crypto')
var lightwallet = require('eth-lightwallet')
var logger = require('../logger')
var config = require('../config')

var walletDataFile = config.get('walletFile')
var ident = config.get('env') === 'development' ? 2 : 0
var hdPathString = 'm/44\'/60\'/0\'/0' // BIP44

function deploy () {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(walletDataFile)) return resolve()

    var password = crypto.randomBytes(128).toString('hex')
    var seedPhrase = lightwallet.keystore.generateRandomSeed()

    lightwallet.keystore.createVault({ password, seedPhrase, hdPathString }, (error, keystore) => {
      if (error) return reject(error)

      keystore.keyFromPassword(password, (error, key) => {
        if (error) return reject(error)

        keystore.generateNewAddress(key, 1)
        var walletData = { keystore: keystore.serialize(), seedPhrase, password }
        fs.writeFileSync(walletDataFile, JSON.stringify(walletData, null, ident), { mode: 0o640 })

        logger.info('created initial wallet', { category: 'setup' })
        resolve(walletData)
      })
    })
  })
}

module.exports = { deploy }
