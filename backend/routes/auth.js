'use strict'

var jwt = require('jsonwebtoken')
var { Router } = require('express')
var config = require('../config')
var User = require('../models/user')

var router = new Router()
var secret = config.get('session:secret')

function rejectInvalidValueError (field) {
  var error = { name: 'UnauthorizedError', errors: {} }
  error.errors[field] = { kind: 'invalid' }
  return Promise.reject(error)
}

function responseData (user) {
  var data = { token: jwt.sign({ userId: user._id }, secret), user: {} }
  var keys = ['username', 'wallet', 'lastLoginAt', 'isAdmin']
  keys.forEach(key => { data.user[key] = user[key] })
  data.user.wallet = data.user.wallet || '0x0'
  return { data }
}

router.route('/sign_up').post((req, res, next) => {
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    activated: true,
    currentLoginAt: new Date()
  })

  user.save()
    .then((user) => { req.successResponse(responseData(user)) })
    .catch((error) => { req.errorResponse(error, { name: 'AccountCreationError' }) })
})

router.route('/sign_in').post((req, res, next) => {
  var username = req.body.username

  User.findOne({ username }).then((user) => {
    if (!user) return rejectInvalidValueError('username')
    if (!user.activated) return Promise.reject({ name: 'AccountNotActivatedError', status: 401 })

    return user.comparePassword(req.body.password).then((match) => {
      if (!match) return rejectInvalidValueError('password')

      user.lastLoginAt = user.currentLoginAt
      user.currentLoginAt = new Date()
      return user.save().then(() => { req.successResponse(responseData(user)) })
    })
  }).catch((error) => { next(error) })
})

module.exports = router
