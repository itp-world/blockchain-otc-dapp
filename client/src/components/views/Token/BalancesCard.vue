<template>
  <v-card>
    <v-toolbar card>
      <v-toolbar-title>Token Balances</v-toolbar-title>
      <v-spacer/>
      <v-tooltip left>
        <v-btn @click.native="loadTokenBalances" :loading="loading" icon slot="activator">
          <v-icon>refresh</v-icon>
        </v-btn>
        <span>Update token balances</span>
      </v-tooltip>
      <v-btn v-if="shownAsDialog" @click.native="shownAsDialog = false" icon>
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <div class="caption">{{ token.EuroToken.token.name }}</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>euro_symbol</v-icon>{{ token.EuroToken.balance }}
      </v-chip>
      <div class="caption mt-2">{{ token.AssetToken.token.name }}</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>assessment</v-icon>{{ token.AssetToken.balance }}
      </v-chip>
      <small class="mt-3 d-block">Last update: {{ updatedAt }}</small>
    </v-card-text>
  </v-card>
</template>

<script>
import Formatter from '@/utils/Formatter'
export default {

  props: {
    dialog: { type: Boolean, default: false }
  },

  data () {
    return {
      token: { EuroToken: { token: {} }, AssetToken: { token: {} } },
      updatedAt: '',
      loading: false
    }
  },

  computed: {
    shownAsDialog: {
      get () { return this.dialog },
      set (value) { if (!value) this.$emit('close') }
    }
  },

  created () {
    this.loadTokenBalances()
    this.$bus.on('app:token:balances:update', this.loadTokenBalances)
  },

  beforeDestroy () {
    this.$bus.off('app:token:balances:update', this.loadTokenBalances)
  },

  methods: {
    loadTokenBalances () {
      this.loading = true
      this.$http.get('blockchain/balance/' + this.$auth.user.wallet).then(({ data: { data } }) => {
        Object.keys(data).forEach((key) => {
          data[key].balance = Formatter.tokenAmount(data[key].balance, data[key].token.symbol)
        })
        this.token = data
        this.loading = false
        this.updatedAt = Formatter.datetime(new Date())
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { loading: false })
      })
    }
  }

}
</script>
