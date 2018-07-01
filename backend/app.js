'use strict'

var express = require('express')
var middlewares = require('./middlewares')
var routes = require('./routes')

var app = express()
app.set('etag', 'strong')
app.disable('x-powered-by')

// access log middleware
app.use(middlewares.accessLogger)

// request body parser middleware
app.use(middlewares.bodyParser.urlencoded({ extended: true }))
app.use(middlewares.bodyParser.json())

// cross-origin resource sharing headers middleware
app.use(middlewares.cors())

// response helper middleware
app.use(middlewares.responseHelper)

// authorization middleware
app.use(middlewares.authorization.init())

// define routes
routes(app)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next({ name: 'NotFoundError', status: '404' })
})

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json(req.errorResponse(err))
})

module.exports = app
