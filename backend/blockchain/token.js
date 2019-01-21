'use strict'

var web3 = require('./web3')
var RPC = require('./rpc')
var utils = require('./utils')
var contracts = require('./contracts')()
var wallet = require('./wallet')()
var logger = require('../logger')

function tokenDataByName (tokenName) {
  if (contracts === undefined) {
    logger.error(`contract definitions not properly loaded`, { category: 'run' })
  }
  var contract = utils.getContract(contracts.token[tokenName])

  return contract.methods.name().call().then((name) => {
    return contract.methods.symbol().call().then((symbol) => {
      return tokenDecimals(tokenName).then((decimals) => {
        return { address: contracts.token[tokenName].address, name, symbol, decimals }
      })
    })
  })
}

function tokenData () {
  var data = {}
  return Promise.all(Object.keys(contracts.token).map((key) => {
    return tokenDataByName(key).then((token) => { data[token.address] = token })
  })).then(() => data)
}

function tokenDecimals (tokenName) {
  var contract = utils.getContract(contracts.token[tokenName])
  return contract.methods.decimals().call()
}

function tokenBalance (tokenName, address) {
  return tokenDataByName(tokenName).then((data) => {
    var contract = utils.getContract(contracts.token[tokenName])

    return contract.methods.balanceOf(address).call().then((balance) => {
      var decimals = 10 ** data.decimals
      return { balance: balance / decimals, token: data }
    })
  })
}

module.exports = {

  decimals: tokenDecimals,
  balance: tokenBalance,

  balances (address) {
    var data = {}
    return Promise.all(Object.keys(contracts.token).map((key) => {
      return tokenBalance(key, address).then((balance) => { data[key] = balance })
    })).then(() => data)
  },

  transfer (address, tokenName, amount) {
    return tokenDataByName(tokenName).then((data) => {
      var rpc = new RPC(wallet.keystore, wallet.password)
      var contract = contracts.token[tokenName]
      var decimals = 10 ** data.decimals
      var value = web3.utils.toBN(amount * decimals)

      return rpc.callContract(contract, 'transfer', [address, value])
    })
  },

  release (payTokenName, payAmount, buyTokenName, buyAmount) {
    return tokenDataByName(payTokenName).then((payData) => {
      return tokenDataByName(buyTokenName).then((buyData) => {
        var rpc = new RPC(wallet.keystore, wallet.password)
        var pay = web3.utils.toBN(payAmount * (10 ** payData.decimals))
        var buy = web3.utils.toBN(buyAmount * (10 ** buyData.decimals))

        var payTokenContract = contracts.token[payTokenName]
        var marketContract = contracts.market

        return rpc.callContract(payTokenContract, 'approve', [contracts.market.address, 0]).then(() => {
          return rpc.callContract(payTokenContract, 'approve', [contracts.market.address, pay]).then(() => {
            return rpc.callContract(marketContract, 'make', [payData.address, pay, buyData.address, buy])
          })
        })
      })
    })
  },

  offers () {
    var contract = utils.getContract(contracts.market)

    return contract.methods.getOfferIds().call().then((offerIds) => {
      var offers = []

      if (offerIds.length === 0) return { offers }

      return tokenData().then((token) => {
        return offerIds.reduce((promise, offerId) => {
          return contract.methods.getOffer(offerId).call().then((offer) => {
            var datetime = new Date(web3.utils.toBN(offer[0]) * 1000).toISOString()
            var owner = offer[1]
            var pay = Object.assign({ amount: offer[3] / (10 ** token[offer[2]].decimals) }, token[offer[2]])
            var buy = Object.assign({ amount: offer[5] / (10 ** token[offer[4]].decimals) }, token[offer[4]])
            offers.push({ id: offerId, datetime, owner, pay, buy })
          })
        }, Promise.resolve()).then(() => { return { offers } })
      })
    })
  },

  makeOffer (signedTx) {
    return utils.sendSignedTransaction(signedTx)
  }
}
