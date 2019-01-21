'use strict'

var fs = require('fs')
var config = require('../config')
var logger = require('../logger')

var contractsFile = config.get('contractsFile')
var contracts = null

module.exports = () => {
  if (contracts) {
    logger.warn(`contracts ${JSON.stringify(contracts)} already loaded`, { category: 'setup' })
    return contracts
  }

  if (!fs.existsSync(contractsFile)) {
    logger.error(`contracts file ${contractsFile} cannot be read`, { category: 'setup' })
    return contracts
  }

  try {
    contracts = JSON.parse(fs.readFileSync(contractsFile, 'utf8'))
  } catch (error) {
    logger.error(`error while reading contracts from file ${contractsFile}`, { category: 'setup', error })
    contracts = null
  }

  logger.info(`contract definitions loaded: ${JSON.stringify(contracts)}`, { category: 'setup' })
  return contracts
}
