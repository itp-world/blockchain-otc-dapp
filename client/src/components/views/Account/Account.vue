<template>
  <v-layout row wrap>
    <v-flex sm6>
      <account-card/>
    </v-flex>

    <v-flex sm6>
      <wallet-missing-card v-if="!availableWallet"/>
      <wallet-locked-card v-else-if="!unlockedWallet"/>
      <v-card v-else>
        <v-toolbar card>
          <v-toolbar-title>Wallet Data</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <div class="caption">Address</div>
          <v-chip label class="ma-0 d-block" slot="activator">
            <v-icon left>link</v-icon>{{ wallet.address }}
          </v-chip>
          <div class="caption mt-2">Seed</div>
          <v-tooltip top @click.native="showWalletSeed = !showWalletSeed">
            <v-chip label class="ma-0 d-block" slot="activator">
              <v-icon left>short_text</v-icon>
              <span>{{ showWalletSeed ? wallet.seed : hiddenSeed }}</span>
            </v-chip>
            <span v-if="showWalletSeed">Click to hide the wallet seed</span>
            <span v-else>Click to show the wallet seed</span>
          </v-tooltip>
        </v-card-text>
      </v-card>
    </v-flex>

    <v-flex sm6 v-if="availableWallet">
      <token-balances-card/>
    </v-flex>
  </v-layout>
</template>

<script>
import AccountCard from '@/components/views/Account/AccountCard'
import TokenBalancesCard from '@/components/views/Token/BalancesCard'
import WalletMissingCard from '@/components/views/Wallet/MissingCard'
import WalletLockedCard from '@/components/views/Wallet/LockedCard'
export default {

  components: {
    'account-card': AccountCard,
    'token-balances-card': TokenBalancesCard,
    'wallet-missing-card': WalletMissingCard,
    'wallet-locked-card': WalletLockedCard
  },

  data () {
    return {
      availableWallet: false,
      unlockedWallet: false,
      showWalletSeed: false,
      wallet: {}
    }
  },

  created () {
    this.walletStatusHandler()
    this.$bus.$on('app:wallet:status', this.walletStatusHandler)
  },

  beforeDestroy () {
    this.$bus.$off('app:wallet:status', this.walletStatusHandler)
  },

  computed: {
    hiddenSeed () {
      return this.wallet.seed.replace(/[^ ]/g, 'x')
    }
  },

  methods: {
    walletStatusHandler () {
      this.availableWallet = this.$wallet.availableWallet()
      this.unlockedWallet = this.$wallet.unlockedWallet()
      this.wallet = this.$wallet.wallet
    }
  }

}
</script>
