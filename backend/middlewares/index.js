'use strict'

module.exports = {
  bodyParser: require('body-parser'),
  cors: require('cors'),

  accessLogger: require('./access-logger'),
  authorization: require('./authorization'),
  responseHelper: require('./response-helper')
}
