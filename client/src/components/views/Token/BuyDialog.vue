<template>
  <v-dialog v-model="show" persistent>
    <v-form v-model="valid" ref="buyTokenForm" class="token-form" @submit="submit">
      <v-card>
        <v-card-title>
          <div class="headline">Buy {{ offer.payTokenName }}</div>
        </v-card-title>
        <v-card-text>
          <v-text-field :label="'Amount of ' + offer.payTokenName + ' to buy'"
                        v-model="offer.payTokenAmount"
                        :rules="[ validateTokenAmount ]"
                        :error-messages="errors.tokenAmount"
                        @keypress="isNumber">
          </v-text-field>
          <v-text-field :label="offer.buyTokenName + ' to pay per ' + offer.payTokenName"
                        :value="formatTokenAmount(offer.buyTokenAmount)"
                        disabled>
          </v-text-field>
          <v-text-field label="Total Price"
                        :value="formatTokenAmount(totalPrice, offer.buyTokenSymbol)"
                        :error-messages="errors.totalPrice"
                        disabled>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="d-block text-xs-center">
          <v-btn @click="cancel" :disabled="dialogLoading" depressed>Cancel</v-btn>
          <v-btn type="submit" class="primary" :disabled="!valid" :loading="dialogLoading" depressed>Buy</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import Formatter from '@/utils/Formatter'
import Validators from '@/utils/Validators'
export default {

  props: [ 'visible', 'offer' ],

  data () {
    return {
      valid: false,
      dialogLoading: false,
      errors: { tokenAmount: [], totalPrice: [] }
    }
  },

  computed: {
    show: {
      get () { return this.visible },
      set (value) { if (!value) this.$emit('close') }
    },

    totalPrice () {
      return this.offer.buyTokenAmount * this.offer.payTokenAmount
    }
  },

  methods: {
    isNumber: Validators.handleNumberKeyEvent,
    formatTokenAmount: Formatter.tokenAmount,

    validateTokenAmount (value) {
      return Validators.maxTokenAmount(value, this.offer.maxAmount)
    },

    getUserBalance () {
      return this.$http.get('blockchain/balance/' + this.$auth.user.wallet).then(({ data: { data } }) => {
        return data[this.offer.buyTokenName].balance
      })
    },

    cancel () {
      this.errors = { tokenAmount: [], totalPrice: [] }
      this.dialogLoading = false
      this.show = false
    },

    submit () {
      this.dialogLoading = true
      this.$http.get('blockchain/balance/' + this.$auth.user.wallet).then(({ data: { data } }) => {
        var userBalance = data[this.offer.buyTokenName].balance
        if (userBalance < this.totalPrice) {
          return Promise.reject({ response: { data: {
            errors: { totalPrice: 'The maximum price you can pay is ' + Formatter.tokenAmount(userBalance, this.offer.buyTokenSymbol) }
          } } })
        }

        return this.$wallet.buyToken(this.$http, this.offer).then((signedTXs) => {
          return this.$http.post('blockchain/market/trade', { signedTXs }).then(({ data }) => {
            this.cancel()
            this.successIndicator(data)
            this.$bus.emit('app:token:balances:update')
            this.$emit('success')
          })
        })
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { dialogLoading: false })
      })
    }
  }

}
</script>
