// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import colors from 'vuetify/es5/util/colors'
import axios from 'axios'
import EventBus from '@/utils/EventBus'
import IndicatorMixin from '@/utils/IndicatorMixin'
import Authentication from '@/components/views/Authentication'
import Wallet from '@/components/views/Wallet'
import App from '@/App'
import router from '@/router'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

axios.defaults.baseURL = process.env.API_URL
axios.defaults.timeout = 60000

axios.interceptors.request.use((request) => {
  request.headers.Authorization = `Bearer ${Vue.auth.getToken()}`
  return request
}, Promise.reject)

axios.interceptors.response.use((response) => response, (error) => {
  if (!error.response) {
    error = { response: { data: { message: 'The backend is currently not available!' } } }
  }

  if (!error.response.data || !error.response.data.message) {
    error.response.data = { message: 'An unknown error occurred!' }
  }

  if (!error.response.status || [401, 403].indexOf(error.response.status) !== -1) {
    Vue.auth.resetAuthentication()
    router.replace({ name: 'Authentication' })
  }

  return Promise.reject(error)
})
Vue.prototype.$http = axios

Vue.use(EventBus)
Vue.use(Authentication)
Vue.use(Wallet)
Vue.mixin(IndicatorMixin)

Vue.use(Vuetify, {
  theme: {
    primary: colors.lightBlue.darken4,
    secondary: colors.lightBlue.darken1,
    accent: colors.lightBlue.accent4,
    error: colors.red.accent4,
    info: colors.lightBlue.darken4,
    success: colors.green.accent4,
    warning: colors.amber.accent4
  }
})

/* eslint-disable no-new */
new Vue({ el: '#app', router, components: { App }, template: '<App/>' })
