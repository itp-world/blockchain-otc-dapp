'use strict'

var { Router } = require('express')
var { verifyAdmin } = require('../middlewares/authorization')
var { contracts, token, utils, wallet } = require('../blockchain')

var router = new Router()

router.route('/contracts').get((req, res, next) => {
  req.successResponse({ data: contracts() })
})

router.route('/contracts/market').get((req, res, next) => {
  req.successResponse({ data: contracts().market })
})

router.route('/token/:token').get((req, res, next) => {
  token.balance(req.params.token, wallet().address).then((data) => {
    req.successResponse({ data })
  }).catch(req.errorResponse)
})

router.route('/balance/:address/:token').get((req, res, next) => {
  token.balance(req.params.token, req.params.address).then((data) => {
    req.successResponse({ data })
  }).catch(req.errorResponse)
})

router.route('/balance/:address').get((req, res, next) => {
  token.balances(req.params.address).then((balances) => {
    req.successResponse({ data: balances })
  }).catch(req.errorResponse)
})

router.route('/market/offers').get((req, res, next) => {
  token.offers().then((data) => {
    req.successResponse({ data })
  }).catch(req.errorResponse)
})

router.route('/market/trade').get((req, res, next) => {
  var ctrs = contracts()

  return Promise.all(Object.keys(ctrs.token).map((key) => {
    return token.decimals(key).then((decimals) => { ctrs.token[key].decimals = decimals })
  })).then(() => {
    return utils.getTransactionCount({ from: req.user.wallet }).then((tx) => {
      var data = { nonce: tx.nonce, contracts: ctrs }
      req.successResponse({ data })
    })
  }).catch(req.errorResponse)
})

router.route('/market/trade').post((req, res, next) => {
  var txs = ['approveReset', 'approveTrade', 'trade']
  var signedTXs = req.body.signedTXs

  return txs.reduce((promise, tx) => {
    return utils.sendSignedTransaction(signedTXs[tx])
  }, Promise.resolve()).then(() => {
    req.successResponse({ message: 'MarketTradeSuccess' })
  }).catch(req.errorResponse)
})

router.route('/market/revoke').post((req, res, next) => {
  var signedTX = req.body.signedTX
  utils.sendSignedTransaction(signedTX).then(() => {
    req.successResponse({ message: 'MarketRevokeOfferSuccess' })
  }).catch(req.errorResponse)
})

router.route('/market/release/:payToken/:buyToken', verifyAdmin).post((req, res, next) => {
  var payToken = req.params.payToken
  var payAmount = req.body[payToken]
  var buyToken = req.params.buyToken
  var buyAmount = req.body[buyToken]

  token.release(payToken, payAmount, buyToken, buyAmount).then((data) => {
    req.successResponse({ message: 'MarketTokenReleaseSuccess', data })
  }).catch(req.errorResponse)
})

module.exports = router
