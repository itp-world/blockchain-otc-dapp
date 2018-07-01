<template>
  <v-dialog v-model="show" persistent>
    <v-form v-model="valid" ref="sellTokenForm" class="token-form" @submit="submit">
      <v-card>
        <v-card-title>
          <div class="headline">Sell {{ offer.payTokenName }}</div>
        </v-card-title>
        <v-card-text>
          <v-text-field :label="'Amount of ' + offer.payTokenName + ' to sell'"
                        v-model="offer.payTokenAmount"
                        :rules="[ validateMinPayTokenAmount, validateMaxPayTokenAmount ]"
                        :error-messages="errors.payAmount"
                        @keypress="isNumber">
          </v-text-field>
          <v-text-field :label="offer.buyTokenName + ' to pay per ' + offer.payTokenName"
                        v-model="offer.buyTokenAmount"
                        :error-messages="errors.buyAmount"
                        @keypress="isNumber">
          </v-text-field>
          <v-text-field label="Total Price"
                        :value="formatTokenAmount(totalPrice, offer.buyTokenSymbol)"
                        disabled>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="d-block text-xs-center">
          <v-btn @click="cancel" :disabled="dialogLoading" depressed>Cancel</v-btn>
          <v-btn type="submit" class="primary" :disabled="!valid" :loading="dialogLoading" depressed>Sell</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import Formatter from '@/utils/Formatter'
import Validators from '@/utils/Validators'
export default {

  props: [ 'visible' ],

  data () {
    return {
      showDialog: false,
      dialogLoading: false,
      valid: false,
      token: { AssetToken: {}, EuroToken: {} },
      offer: {},
      errors: { payAmount: [], buyAmount: [] }
    }
  },

  computed: {
    show: {
      get () { return this.visible },
      set (value) { if (!value) this.$emit('close') }
    },

    totalPrice () {
      return this.offer.payTokenAmount * this.offer.buyTokenAmount
    }
  },

  created () {
    this.loadBalances()
    this.$bus.on('app:token:balances:update', this.loadBalances)
  },

  beforeDestroy () {
    this.$bus.off('app:token:balances:update', this.loadBalances)
  },

  methods: {
    isNumber: Validators.handleNumberKeyEvent,
    formatTokenAmount: Formatter.tokenAmount,

    loadBalances () {
      this.loading = true
      this.$http.get('blockchain/balance/' + this.$auth.user.wallet).then(({ data: { data } }) => {
        this.token = data
        this.offer = {
          payTokenName: data.AssetToken.token.name,
          payTokenAmount: Formatter.tokenAmount(data.AssetToken.balance),
          payTokenSymbol: data.AssetToken.token.symbol,
          payTokenAddress: data.AssetToken.token.address,
          buyTokenName: data.EuroToken.token.name,
          buyTokenAmount: Formatter.tokenAmount(1),
          buyTokenSymbol: data.EuroToken.token.symbol,
          buyTokenAddress: data.EuroToken.token.address
        }
        this.loading = false
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { loading: false })
      })
    },

    validateMinPayTokenAmount (value) {
      return Validators.minTokenAmount(value, 0)
    },

    validateMaxPayTokenAmount (value) {
      return Validators.maxTokenAmount(value, this.token.AssetToken.balance)
    },

    cancel () {
      this.errors = { payAmount: [], buyAmount: [] }
      this.dialogLoading = false
      this.show = false
    },

    submit () {
      this.dialogLoading = true

      this.$wallet.sellToken(this.$http, this.offer).then((signedTXs) => {
        return this.$http.post('blockchain/market/trade', { signedTXs }).then(({ data }) => {
          this.cancel()
          this.successIndicator(data)
          this.$bus.emit('app:token:balances:update')
          this.$emit('success')
        })
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { dialogLoading: false })
      })
    }
  }

}
</script>
