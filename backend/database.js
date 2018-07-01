'use strict'

var mongoose = require('mongoose')
var beautifyUnique = require('mongoose-beautiful-unique-validation')
var config = require('./config')
var logger = require('./logger')

var { url, debug, autoIndex } = config.get('database')
var category = 'database'

if (config.get('env') === 'test') url = `${url}_test`

mongoose.Promise = global.Promise
mongoose.set('debug', debug)
mongoose.plugin(beautifyUnique)

var options = {
  reconnectTries: 30,
  reconnectInterval: 1000,
  autoIndex: autoIndex || false
}

var connection = mongoose.createConnection(url, options)

connection.once('open', () => {
  logger.info(`established connection to ${url}`, { category })

  mongoose.connection.on('reconnected', () => {
    logger.info(`reconnected to ${url}`, { category })
  })
  mongoose.connection.on('disconnected', () => {
    logger.info(`disconnected from ${url}`, { category })
  })
  mongoose.connection.on('error', (error) => {
    logger.error(`error while creating connection to ${url}`, { category, error })
  })
}).catch((error) => {
  logger.error(`error while creating connection to ${url}`, { category, error })
})

module.exports = connection
