import lightwallet from 'eth-lightwallet'
import Web3 from 'web3'

const STORAGE_KEY = 'botcm:wallet'
const hdPathString = 'm/44\'/60\'/0\'/0' // BIP44
var web3 = new Web3()

const ERRORS = {
  WalletMissing: { message: 'Missing wallet!' },
  WalletLoading: { message: 'Wallet loading failed!' },
  WalletCreation: { message: 'Wallet creation failed!' },
  WalletPassword: { errors: { password: 'The wallet password did not match' } },
  WalletSeed: { errors: { seed: 'The wallet seed is invalid' } }
}

function Wallet (Vue) {
  Vue.wallet = {
    wallet: { address: 0x0 },

    storageKey () {
      return `${STORAGE_KEY}:${Vue.auth.user.username}`
    },

    keyFromPassword () {
      return new Promise((resolve, reject) => {
        this.wallet.keystore.keyFromPassword(this.wallet.password, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      })
    },

    generateSeed () {
      return lightwallet.keystore.generateRandomSeed()
    },

    verifySeed (seed) {
      return lightwallet.keystore.isSeedValid(seed)
    },

    createWallet (context, password, seedPhrase) {
      return new Promise((resolve, reject) => {
        if (!this.verifySeed(seedPhrase)) return reject(ERRORS.WalletSeed)

        lightwallet.keystore.createVault({ password, seedPhrase, hdPathString }, (error, ks) => {
          if (error) return reject(ERRORS.WalletCreation)

          this.wallet.keystore = ks
          this.wallet.password = password
          this.wallet.seed = seedPhrase

          this.keyFromPassword().then((key) => {
            this.wallet.keystore.generateNewAddress(key, 1)
            this.wallet.passwordKey = key
            this.wallet.address = this.wallet.keystore.getAddresses()[0]
            localStorage.setItem(this.storageKey(), this.wallet.keystore.serialize())

            return context.$auth.registWallet(context, this.wallet.address).then(resolve)
          }).catch((error) => {
            this.unloadWallet()
            reject(error.response ? error.response.data : ERRORS.WalletCreation)
          })
        })
      })
    },

    unlockWallet (context, password) {
      return new Promise((resolve, reject) => {
        var ks = localStorage.getItem(this.storageKey())
        if (!ks) return reject(ERRORS.WalletMissing)

        this.wallet.keystore = lightwallet.keystore.deserialize(ks)
        this.wallet.password = password

        this.keyFromPassword().then((key) => {
          if (!this.wallet.keystore.isDerivedKeyCorrect(key)) {
            this.unloadWallet()
            reject(ERRORS.WalletPassword)
          }

          this.wallet.seed = this.wallet.keystore.getSeed(key)
          this.wallet.passwordKey = key
          this.wallet.address = this.wallet.keystore.getAddresses()[0]

          return context.$auth.registWallet(context, this.wallet.address).then(resolve)
        }).catch((error) => {
          this.unloadWallet()
          reject(error.response ? error.response.data : ERRORS.WalletLoading)
        })
      })
    },

    unloadWallet () {
      this.wallet = {}
    },

    availableWallet () {
      return !!localStorage.getItem(this.storageKey())
    },

    unlockedWallet () {
      return !!this.wallet.address
    },

    prepareTx (to, nonce) {
      return Promise.resolve({ from: this.wallet.address, to, nonce, gasPrice: 0, gasLimit: 1000000 })
    },

    signTx (nonce, contract, method, args = []) {
      var self = this

      return new Promise((resolve, reject) => {
        return self.prepareTx(contract.address, nonce).then((tx) => {
          tx.data = new web3.eth.Contract(contract.abi, contract.address).methods[method](...args).encodeABI()

          return self.keyFromPassword().then((key) => {
            var functionTx = lightwallet.txutils.functionTx(contract.abi, method, args || [], tx)
            var signedTx = lightwallet.signing.signTx(self.wallet.keystore, key, functionTx, self.wallet.address)
            resolve(signedTx)
          })
        }).catch(reject)
      })
    },

    prepareTokenTrade (http, offer, contractTokenName) {
      var self = this

      return http.get('blockchain/market/trade').then(({ data: { data } }) => {
        var nonce = data.nonce
        var buyTokenContract = data.contracts.token[offer.buyTokenName]
        var contract = data.contracts.token[contractTokenName]
        var marketAddress = data.contracts.market.address
        var value = web3.utils.toBN(offer.buyTokenAmount * offer.payTokenAmount * (10 ** buyTokenContract.decimals))

        var result = { signedTXs: {}, contracts: data.contracts }
        return self.signTx(nonce, contract, 'approve', [marketAddress, 0]).then((signedTx) => {
          result.signedTXs.approveReset = signedTx
          return self.signTx(++nonce, contract, 'approve', [marketAddress, value]).then((signedTx) => {
            result.signedTXs.approveTrade = signedTx
            result.nonce = nonce
            return result
          })
        })
      })
    },

    buyToken (http, offer) {
      var self = this

      return this.prepareTokenTrade(http, offer, offer.buyTokenName).then((data) => {
        var payTokenContract = data.contracts.token[offer.payTokenName]

        var args = [
          offer.id,
          web3.utils.toBN(offer.payTokenAmount * (10 ** payTokenContract.decimals))
        ]

        return self.signTx(++data.nonce, data.contracts.market, 'take', args).then((signedTx) => {
          data.signedTXs.trade = signedTx
          return data.signedTXs
        })
      })
    },

    sellToken (http, offer) {
      var self = this

      return this.prepareTokenTrade(http, offer, offer.payTokenName).then((data) => {
        var payTokenContract = data.contracts.token[offer.payTokenName]
        var buyTokenContract = data.contracts.token[offer.buyTokenName]

        var args = [
          payTokenContract.address,
          web3.utils.toBN(offer.payTokenAmount * (10 ** payTokenContract.decimals)),
          buyTokenContract.address,
          web3.utils.toBN(offer.buyTokenAmount * offer.payTokenAmount * (10 ** buyTokenContract.decimals))
        ]

        return self.signTx(++data.nonce, data.contracts.market, 'make', args).then((signedTx) => {
          data.signedTXs.trade = signedTx
          return data.signedTXs
        })
      })
    },

    revokeOfferToken (http, offer) {
      var self = this

      return http.get('blockchain/market/trade').then(({ data: { data } }) => {
        return self.signTx(data.nonce, data.contracts.market, 'kill', [offer.id])
      })
    }
  }

  Object.defineProperty(Vue.prototype, '$wallet', {
    get () { return Vue.wallet }
  })
}

export default Wallet
