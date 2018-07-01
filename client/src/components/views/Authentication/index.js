import router from '@/router'

const STORAGE_KEYS = {
  token: 'botcm:auth:token',
  user: 'botcm:auth:user'
}

function Authentication (Vue) {
  Vue.auth = {
    user: { authenticated: false, wallet: '0x0' },

    login (data) {
      localStorage.setItem(STORAGE_KEYS.token, data.token)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user))
      this.user = data.user
      this.user.authenticated = true
      router.replace({ name: 'Home' })
    },

    registWallet (context, address) {
      return context.$http.put('account', { wallet: address }).then(({ data: { data } }) => {
        this.user.wallet = address
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(this.user))
        return data
      }).catch(({ response: { data } }) => {
        context.errorIndicator(data)
      })
    },

    signUp (context, credentials) {
      context.loading = true
      context.$http.post('auth/sign_up', credentials).then(({ data: { data } }) => {
        this.login(data)
      }).catch(({ response: { data } }) => {
        context.errorIndicator(data, { loading: false })
      })
    },

    signIn (context, credentials) {
      context.loading = true
      context.$http.post('auth/sign_in', credentials).then(({ data: { data } }) => {
        this.login(data)
      }).catch(({ response: { data } }) => {
        context.errorIndicator(data, { loading: false })
      })
    },

    signOut (context) {
      this.resetAuthentication()
      context.resetIndicator()
      router.replace({ name: 'Authentication' })
    },

    resetAuthentication () {
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
      this.user = { authenticated: false, wallet: 0x0 }
      Vue.wallet.unloadWallet()
    },

    checkAuthentication () {
      this.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}')
      this.user.authenticated = !!this.user.username && !!this.getToken()
    },

    isAuthenticated () {
      return this.user.authenticated
    },

    getToken () {
      return localStorage.getItem(STORAGE_KEYS.token)
    }
  }

  Object.defineProperty(Vue.prototype, '$auth', {
    get () { return Vue.auth }
  })
}

export default Authentication
