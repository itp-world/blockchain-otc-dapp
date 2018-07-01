'use strict'

var fs = require('fs')
var config = require('../config')
var logger = require('../logger')

var contractsFile = config.get('contractsFile')
var contracts = null

module.exports = () => {
  if (contracts || !fs.existsSync(contractsFile)) return contracts

  try {
    contracts = JSON.parse(fs.readFileSync(contractsFile, 'utf8'))
  } catch (error) {
    logger.error(`error while reading contracts from file ${contractsFile}`, { category: 'setup', error })
    contracts = null
  }

  return contracts
}
