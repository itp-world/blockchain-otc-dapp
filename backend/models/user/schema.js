'use strict'

var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  wallet: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { wallet: { $type: 'string' } }
    } // needed for null values
  },

  activated: {
    type: Boolean,
    required: true,
    default: false
  },

  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },

  currentLoginAt: {
    type: Date
  },

  lastLoginAt: {
    type: Date
  }
})

schema.set('timestamps', true)

schema.pre('save', function (next) {
  var user = this

  // encrypt password
  if (this.isModified('password') || this.isNew) {
    if (user.password.length < 8) {
      return next({ name: 'ValidationError', errors: { password: { kind: 'format' } } })
    }

    bcrypt.genSalt(10, (error, salt) => {
      if (error) return next(error)

      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) return next(error)

        user.password = hash
        next()
      })
    })
  } else return next()
})

schema.methods.comparePassword = function (password) {
  var user = this

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (error, match) => {
      if (error) return reject(error)
      resolve(match)
    })
  })
}

module.exports = schema
