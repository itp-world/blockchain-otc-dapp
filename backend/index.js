'use strict'

var http = require('http')
var config = require('./config')
var logger = require('./logger')
var app = require('./app')

var category = 'server'
var { address, port } = config.get('server')

var server = http.createServer(app)

server.on('error', (error) => {
  if (error.syscall !== 'listen') { throw error }

  switch (error.code) {
    case 'EACCES':
      logger.error(`port ${port} requires elevated privileges`, { category, error })
      process.exit(1)
    case 'EADDRINUSE':
      logger.error(`port ${port} is already in use`, { category, error })
      process.exit(1)
    default:
      throw error
  }
})

server.on('listening', () => {
  var addr = server.address()
  logger.info(`listening on ${addr.address}:${addr.port}`, { category })
})

server.listen(parseInt(port, 10), address)
