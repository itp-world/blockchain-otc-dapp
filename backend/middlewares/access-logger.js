'use strict'

var winston = require('winston')
var expressWinston = require('express-winston')
var path = require('path')
var config = require('../config')

var env = config.get('env')
var dir = config.get('logging:dir')

var transports = [
  new (winston.transports.File)({ filename: path.join(dir, `${env}.access.log`) })
]

// log to console if we're not in production mode
if (env !== 'production') {
  transports.push(
    new (winston.transports.Console)({ humanReadableUnhandledException: true, colorize: true })
  )
}

// only log these properties
var requestWhitelist = ['url', 'method', 'query']

module.exports = expressWinston.logger({ transports, requestWhitelist })
