<template>
  <v-card>
    <v-toolbar card>
      <v-toolbar-title>Missing Wallet</v-toolbar-title>
      <v-spacer/>
      <v-tooltip left>
        <v-btn @click.native="showDialog = true" icon slot="activator">
          <v-icon>account_balance_wallet</v-icon>
        </v-btn>
        <span>Create / regenerate wallet</span>
      </v-tooltip>
    </v-toolbar>

    <v-card-text>
      <p v-for="(t, idx) in text || defaultText" :key="idx">{{ t }}</p>
    </v-card-text>

    <wallet-create-dialog :visible="showDialog" @close="showDialog = false" />
  </v-card>
</template>

<script>
import WalletCreateDialog from '@/components/views/Wallet/CreateDialog'
export default {
  components: {
    'wallet-create-dialog': WalletCreateDialog
  },

  props: [ 'text' ],

  data () {
    return {
      showDialog: false,
      defaultText: [
        'You need a wallet to trade tokens and sign your transactions.',
        'Please create a new one or regenerate an existing one from its seed.'
      ]
    }
  }

}
</script>
