import Vue from 'vue'
import Router from 'vue-router'

// Views
import Home from '@/components/views/Home'
import Market from '@/components/views/Market/Market'
import Authentication from '@/components/views/Authentication/Authentication'
import Account from '@/components/views/Account/Account'
import AdministrationUsers from '@/components/views/Administration/Users'
import AdministrationToken from '@/components/views/Administration/Token'

Vue.use(Router)

const router = new Router({
  routes: [{
    path: '/',
    name: 'Home',
    component: Home
  }, {
    path: '/market',
    name: 'Market',
    component: Market
  }, {
    path: '/sign_in',
    name: 'Authentication',
    component: Authentication
  }, {
    path: '/account',
    name: 'Account',
    component: Account
  }, {
    path: '/admin/users',
    name: 'AdministrationUsers',
    component: AdministrationUsers
  }, {
    path: '/admin/token',
    name: 'AdministrationToken',
    component: AdministrationToken
  }]
})

router.beforeEach((to, from, next) => {
  Vue.auth.checkAuthentication()

  var adminOnly = ['AdministrationUsers', 'AdministrationToken']

  if (to.name !== 'Authentication' && !Vue.auth.isAuthenticated()) {
    return router.replace({ name: 'Authentication' })
  } else if (adminOnly.indexOf(to.name) !== -1 && !Vue.auth.user.isAdmin) {
    return router.replace({ name: 'Home' })
  } else if (!to.matched.length) {
    return router.replace({ name: 'Home' })
  }

  next()
})

export default router
