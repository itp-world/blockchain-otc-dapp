'use strict'

var database = require('../database')
var logger = require('../logger')

var tasks = ['user', 'wallet', 'contracts']
tasks = tasks.map((task) => require(`./${task}`))

function quit () {
  database.close()
  process.exit()
}

tasks.reduce(
  (promise, task) => promise.then(task.deploy),
  Promise.resolve()
).then(quit).catch((error) => {
  logger.error(error, { category: 'setup' })
  quit()
})
