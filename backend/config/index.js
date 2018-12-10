'use strict'

var nconf = require('nconf')
var path = require('path')
var fs = require('fs')
var crypto = require('crypto')
var mkdirp = require('mkdirp')

var appRoot = path.join(__dirname, '..', '..')

// Create system specific secret directory if not exists
var secretDir = path.join(appRoot, '.secret')
mkdirp.sync(secretDir, { mode: 0o700 })

// Generate system specific session secret if not exists
var sessionSecretFile = path.join(secretDir, 'session')
if (!fs.existsSync(sessionSecretFile)) {
  fs.writeFileSync(sessionSecretFile, crypto.randomBytes(64).toString('hex'), {
    encoding: 'utf8', mode: 0o400 // readonly
  })
}

// Generate log file directory
var logDir = path.join(appRoot, 'tmp', 'logs')
mkdirp.sync(logDir)

// These default config values can be overwritten
var defaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'defaults.json')))

// These config values cannot be overwritten
var statics = JSON.parse(fs.readFileSync(path.join(__dirname, 'statics.json')))
var overrides = {
  env: (process.env.NODE_ENV || 'development').toLowerCase(),
  secretDirectory: secretDir,
  contractsFile: path.join(secretDir, 'contracts'),
  walletFile: path.join(secretDir, 'wallet'),
  session: { secret: fs.readFileSync(sessionSecretFile, 'utf8') },
  logging: { dir: logDir },
  basePath: `/api/v${statics.apiVersion}`,
  database: { url: (process.env.DATABASE_URL || defaults.database.url) }
}

// The order determines their priority in the hierarchy!
// #1 any overrides
nconf.overrides(Object.assign({}, statics, overrides))
// #2 custom config
nconf.file(path.join(appRoot, 'config.json'))
// #3 defaults
nconf.defaults(defaults)

module.exports = nconf
