'use strict'

var schema = require('./schema')
var { token } = require('../../blockchain')

schema.statics = {
  responseData (user) {
    var data = {}
    if (!user) return Promise.resolve(data)

    var keys = [
      'username',
      'wallet',
      'createdAt',
      'updatedAt',
      'currentLoginAt',
      'lastLoginAt',
      'activated',
      'isAdmin'
    ]
    keys.forEach(key => { data[key] = user[key] })

    return token.balances(user.wallet || '0x0').then((balances) => {
      data.token = balances
      return data
    })
  }
}
