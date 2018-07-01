'use strict'

var winston = require('winston')
var path = require('path')
var config = require('./config')

var env = config.get('env')
var { dir, level } = config.get('logging')

var logger = new winston.Logger({
  level,
  handleExceptions: true,
  exitOnError: false,
  json: true,
  transports: [
    new (winston.transports.File)({ filename: path.join(dir, `${env}.log`) })
  ]
})

// log to console if we're not in production mode
if (env !== 'production') {
  logger.add(winston.transports.Console, {
    humanReadableUnhandledException: true,
    colorize: true
  })
}

// disable console logging if we're in test mode
if (env === 'test') logger.transports.console.level = '____'

module.exports = logger
