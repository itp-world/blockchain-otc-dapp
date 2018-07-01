'use strict'

var { Router } = require('express')
var User = require('../models/user')
var { token } = require('../blockchain')

var router = new Router()

function transferToken (address, tokenName, amount) {
  if (!amount || amount <= 0) return Promise.resolve()

  return token.transfer(address, tokenName, parseFloat(amount || 0))
}

router.route('/').get((req, res, next) => {
  var query = {}

  // searching
  if (req.query.search) query.username = new RegExp(req.query.search, 'i')

  // pagination
  var page = parseInt(req.query.page, 10) || 1
  var limit = parseInt(req.query.rowsPerPage, 10) || 10
  var skipFrom = (page * limit) - limit

  // sorting
  var sort = {}
  sort[req.query.sortBy || 'username'] = req.query.descending === 'false' ? 'asc' : 'desc'

  User.count(query).then((total) => {
    return User.find(query)
      .skip(skipFrom)
      .limit(limit)
      .sort(sort)
      .then((users) => {
        return Promise.all(users.map(User.responseData)).then((users) => {
          req.successResponse({ data: { users, total } })
        })
      })
  }).catch((error) => { next(error) })
})

router.route('/:username').get((req, res, next) => {
  User.findOne({ username: req.params.username }).then((user) => {
    if (!user) return next({ name: 'NotFoundError', status: 404 })

    var data = { user: User.responseData(user) }
    req.successResponse({ data })
  }).catch((error) => { next(error) })
})

router.route('/:username').put((req, res, next) => {
  User.findOne({ username: req.params.username }).then((user) => {
    if (!user) return next({ name: 'NotFoundError', status: 404 })

    var transfer = req.body.transfer || {}
    return transferToken(user.wallet, transfer.token, transfer.amount).then(() => {
      if (!user._id.equals(req.user._id)) {
        var keys = ['activated', 'isAdmin']
        keys.forEach((key) => {
          if (typeof req.body[key] === 'boolean') user[key] = req.body[key]
        })
      }

      return user.save().then(() => {
        return User.responseData(user).then((user) => {
          req.successResponse({ message: 'AccountUpdateSuccess', data: { user } })
        })
      })
    })
  }).catch((error) => {
    req.errorResponse(error, { name: 'AccountUpdateError' })
  })
})

module.exports = router
