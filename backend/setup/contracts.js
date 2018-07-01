'use strict'

var solc = require('solc')
var path = require('path')
var fs = require('fs')
var logger = require('../logger')
var config = require('../config')
var { RPC, wallet } = require('../blockchain')

var solFileExt = /\.sol$/
var contractsDir = path.join(__dirname, '..', 'contracts')
var contractsFile = config.get('contractsFile')
var ident = config.get('env') === 'development' ? 2 : 0

function readContract (file) {
  return fs.readFileSync(path.join(contractsDir, file), 'utf8')
}

function deploy () {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(contractsFile)) return resolve()

    var walletData = wallet()
    if (!walletData) reject('missing wallet')

    var rpc = new RPC(walletData.keystore, walletData.password)
    var sources = {}

    fs.readdirSync(contractsDir).forEach((file) => {
      if (solFileExt.test(file)) sources[file] = readContract(file)
    })

    var output = solc.compile({ sources: sources }, 1, (importFile) => {
      return { contents: readContract(importFile) }
    })
    if (output.errors) return reject(output.errors)

    var names = Object.keys(output.contracts)
    var contracts = {}
    names.forEach((name) => {
      contracts[name] = {
        abi: JSON.parse(output.contracts[name].interface),
        bin: output.contracts[name].bytecode
      }
    })

    return names.reduce((promise, name) => {
      return promise.then(() => {
        return rpc.sendContract(contracts[name].bin).then((receipt) => {
          logger.info(`deployed contract ${name}`, { category: 'setup' })
          contracts[name].address = receipt.contractAddress
        })
      })
    }, Promise.resolve()).then(() => {
      var contractsData = {
        token: {
          AssetToken: contracts['AssetToken.sol:AssetToken'],
          EuroToken: contracts['EuroToken.sol:EuroToken']
        },
        market: contracts['SimpleMarket.sol:SimpleMarket']
      }

      fs.writeFileSync(contractsFile, JSON.stringify(contractsData, null, ident), { mode: 0o640 })
      resolve()
    }).catch(reject)
  })
}

module.exports = { deploy }
