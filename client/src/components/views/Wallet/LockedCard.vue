<template>
  <v-card>
    <v-toolbar card>
      <v-toolbar-title>Locked Wallet</v-toolbar-title>
      <v-spacer/>
      <v-tooltip left>
        <v-btn @click.native="showDialog = true" icon slot="activator">
          <v-icon>lock</v-icon>
        </v-btn>
        <span>Unlock wallet</span>
      </v-tooltip>
    </v-toolbar>

    <v-card-text>
      <p v-for="(t, idx) in text || defaultText" :key="idx">{{ t }}</p>
    </v-card-text>

    <wallet-unlock-dialog :visible="showDialog" @close="showDialog = false" />
  </v-card>
</template>

<script>
import WalletUnlockDialog from '@/components/views/Wallet/UnlockDialog'
export default {

  components: {
    'wallet-unlock-dialog': WalletUnlockDialog
  },

  props: [ 'text' ],

  data () {
    return {
      showDialog: false,
      defaultText: [
        'Your wallet needs to be unlocked for trading tokens and signing your transactions.'
      ]
    }
  }

}
</script>
