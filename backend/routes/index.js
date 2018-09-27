'use strict'

var { verifyUser, verifyAdmin } = require('../middlewares/authorization')
var config = require('../config')

var basePath = config.get('basePath')

module.exports = (app) => {
  app.use(`${basePath}/auth`, require('./auth'))
  app.use(`${basePath}/account`, verifyUser, require('./account'))
  app.use(`${basePath}/blockchain`, verifyUser, require('./blockchain'))
  app.use(`${basePath}/users`, verifyUser, verifyAdmin, require('./users'))
  app.get('/health', function (req, res) {
    res.json({status: 'UP'});
  })
}