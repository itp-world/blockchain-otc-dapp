'use strict'

var passport = require('passport')
var { ExtractJwt, Strategy } = require('passport-jwt')
var config = require('../config')
var User = require('../models/user')

var params = {
  secretOrKey: config.get('session:secret'),
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

passport.use(new Strategy(params, (payload, done) => {
  User.findById(payload.userId).then((user) => {
    if (!user) return Promise.reject({ name: 'AccountNotFoundError' })
    if (!user.activated) return Promise.reject({ name: 'AccountNotActivatedError' })
    return done(null, user)
  }).catch(done)
}))

module.exports = {
  init: () => passport.initialize(),

  verifyUser: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
      if (!user) error = error || info
      if (error) error.status = error.status || 401
      req.user = user
      return next(error)
    })(req, res, next)
  },

  verifyAdmin: (req, res, next) => {
    if (!req.user.isAdmin) return next({ name: 'UnauthorizedError', status: 401 })
    next()
  }
}
