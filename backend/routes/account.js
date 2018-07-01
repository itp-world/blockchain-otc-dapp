'use strict'

var { Router } = require('express')
var User = require('../models/user')

var router = new Router()

router.route('/').get((req, res) => {
  User.responseData(req.user).then((data) => {
    req.successResponse({ data })
  })
})

router.route('/').put((req, res) => {
  var keys = ['password', 'wallet']

  keys.filter((key) => !!req.body[key])
    .forEach(key => { req.user[key] = req.body[key] })

  req.user.save().then(() => {
    req.successResponse({ message: 'AccountUpdateSuccess' })
  }).catch((error) => {
    req.errorResponse(error, { name: 'AccountUpdateError' })
  })
})

module.exports = router
