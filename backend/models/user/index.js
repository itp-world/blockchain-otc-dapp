'use strict'

var database = require('../../database')
var schema = require('./schema')

// extend schema with static methods
require('./statics')

module.exports = database.model('User', schema)
