'use strict'

var logger = require('../logger')
var User = require('../models/user')

function deploy () {
  return User.count({ isAdmin: true }).then((count) => {
    if (count > 0) return Promise.resolve()

    var user = new User({
      username: 'admin',
      password: 'insecure!password',
      activated: true,
      isAdmin: true
    })

    return user.save().then(() => {
      logger.info('created initial admin user', { category: 'setup' })
      return Promise.resolve(user)
    })
  })
}

module.exports = { deploy }
