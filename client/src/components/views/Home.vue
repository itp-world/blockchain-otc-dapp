<template>
  <v-layout row wrap>
    <v-flex sm6>
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>Welcome {{ $auth.user.username }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <p>
            This is the blockchain otc market showcase.
          </p>

          <p class="mb-1">
            Click on the top left <v-icon small>menu</v-icon> icon to access the menu:
          </p>
          <table>
            <tr v-for="item in menuItems" :key="item.label" v-if="item.admin ? $auth.user.isAdmin : true">
              <td>
                <v-chip label class="ma-0 d-block nowrap">
                  <v-icon left>{{ item.icon }}</v-icon>{{ item.label }}
                </v-chip>
              </td>
              <td class="pl-1">{{ item.text }}</td>
            </tr>
          </table>
        </v-card-text>
      </v-card>
    </v-flex>

    <v-flex sm6>
      <wallet-missing-card v-if="!availableWallet"/>
      <token-balances-card v-else/>
    </v-flex>
  </v-layout>
</template>

<script>
import TokenBalancesCard from '@/components/views/Token/BalancesCard'
import WalletMissingCard from '@/components/views/Wallet/MissingCard'
export default {

  components: {
    'token-balances-card': TokenBalancesCard,
    'wallet-missing-card': WalletMissingCard
  },

  data () {
    return {
      menuItems: [
        { icon: 'home', label: 'Home', text: 'will open this view' },
        { icon: 'account_balance', label: 'Market', text: 'trade with your available token' },
        { icon: 'account_box', label: 'Account', text: 'manage your account' },
        { icon: 'settings', label: 'Administration', text: 'administrate user acounts and token', admin: true },
        { icon: 'exit_to_app', label: 'Sign Out', text: 'quit your session' }
      ],
      availableWallet: false,
      unlockedWallet: false
    }
  },

  created () {
    this.walletStatusHandler()
    this.$bus.$on('app:wallet:status', this.walletStatusHandler)
  },

  beforeDestroy () {
    this.$bus.$off('app:wallet:status', this.walletStatusHandler)
  },

  methods: {
    walletStatusHandler () {
      this.availableWallet = this.$wallet.availableWallet()
    }
  }

}
</script>
