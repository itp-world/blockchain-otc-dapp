'use strict'

var logger = require('../logger')
var messages = require('../config/messages')

var validationErrorMap = {
  format: 'FormatValidationError',
  required: 'RequiredValidationError',
  unique: 'UniqueValidationError',
  invalid: 'InvalidValidationError'
}

module.exports = (req, res, next) => {
  req.successResponse = (options = {}) => {
    var response = { success: true }
    if (options.message) response.message = messages.success[options.message] || options.message
    if (options.data) response.data = options.data

    res.json(response)
  }

  req.errorResponse = (error, options = {}) => {
    var response = { error: true }

    if (typeof error === 'string') {
      error = { name: error }
    } else if (error.errors) {
      response.errors = {}
      options.status = 422
      Object.keys(error.errors).forEach((k) => {
        var kind = validationErrorMap[error.errors[k].kind]
        var message = (messages.error[kind] || {})[k]
        response.errors[k] = message || error.errors[k].message
      })
    }

    error.name = options.name || error.name

    if (!messages.error[error.name]) {
      logger.error(error, { category: options.category || 'unknown' })
      error.name = 'InternalServerError'
    }

    response.message = messages.error[error.name]
    response.code = error.name

    res.status(options.status || error.status || 500)
    res.json(response)
  }

  next()
}
