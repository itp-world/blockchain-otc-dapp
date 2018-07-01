'use strict'

var web3 = require('./web3')

function add0x (hex) {
  return '0x' + hex.replace(/^0x/, '')
}

function getContract (contract) {
  return new web3.eth.Contract(contract.abi, contract.address)
}

function getTransactionCount (tx) {
  if (typeof tx.nonce === 'number') return Promise.resolve(tx)

  return web3.eth.getTransactionCount(tx.from, 'latest').then((result) => {
    tx.nonce = result
    return tx
  })
}

function getGasPrice (tx) {
  if (tx.gasPrice) return Promise.resolve(tx)

  return web3.eth.getGasPrice().then((result) => {
    tx.gasPrice = web3.utils.toHex(result)
    return tx
  })
}

function estimateGas (tx) {
  if (tx.gasLimit) return Promise.resolve(tx)

  return web3.eth.estimateGas(tx).then((result) => {
    tx.gasLimit = web3.utils.toHex(result)
    return tx
  })
}

function prepareTx (tx) {
  return getTransactionCount(tx).then(getGasPrice).then(estimateGas)
}

function sendSignedTransaction (signedTx) {
  return new Promise((resolve, reject) => {
    web3.eth.sendSignedTransaction(this.add0x(signedTx))
      .on('receipt', resolve)
      .on('error', reject)
  })
}

module.exports = {
  add0x,
  getContract,
  getTransactionCount,
  getGasPrice,
  estimateGas,
  prepareTx,
  sendSignedTransaction
}
