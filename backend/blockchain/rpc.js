'use strict'

var lightwallet = require('eth-lightwallet')
var logger = require('../logger')
var utils = require('./utils')

class RPC {
  constructor (keystore, password) {
    this.keystore = keystore
    this.password = password
    this.address = keystore.getAddresses()[0]
  }

  keyFromPassword () {
    var self = this
    return new Promise((resolve, reject) => {
      self.keystore.keyFromPassword(self.password, (error, key) => {
        error ? reject(error) : resolve(key)
      })
    })
  }

  sendContract (bin) {
    var tx = { from: this.address, data: utils.add0x(bin) }

    var self = this
    return utils.prepareTx(tx).then((tx) => {
      return self.keyFromPassword().then((key) => {
        var contractTx = lightwallet.txutils.createContractTx(self.address, tx)
        var signedTx = lightwallet.signing.signTx(self.keystore, key, contractTx.tx, self.address)

        return utils.sendSignedTransaction(signedTx)
      })
    }).catch((error) => {
      logger.error(error, { category: 'blockchain' })
      return Promise.reject(error)
    })
  }

  callContract (contract, method, args = []) {
    var tx = { from: this.address, to: contract.address, gasLimit: 1000000 }

    try {
      tx.data = utils.getContract(contract).methods[method](...args).encodeABI()
    } catch (error) {
      logger.error(error, { category: 'blockchain' })
      return Promise.reject(error)
    }

    var self = this
    return utils.prepareTx(tx).then((tx) => {
      return self.keyFromPassword().then((key) => {
        var functionTx = lightwallet.txutils.functionTx(contract.abi, method, args, tx)
        var signedTx = lightwallet.signing.signTx(self.keystore, key, functionTx, self.address)

        return utils.sendSignedTransaction(signedTx)
      })
    }).catch((error) => {
      logger.error(error, { category: 'blockchain' })
      return Promise.reject(error)
    })
  }
}

module.exports = RPC
