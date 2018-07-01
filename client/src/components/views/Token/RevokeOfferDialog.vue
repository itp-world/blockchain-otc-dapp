<template>
  <v-dialog v-model="show" persistent>
    <v-form v-model="valid" ref="revokeOfferTokenForm" class="token-form" @submit="submit">
      <v-card>
        <v-card-title>
          <div class="headline">Revoke Offer</div>
        </v-card-title>
        <v-card-text>
          <v-text-field label="Date"
                        v-model="offer.datetime"
                        disabled>
          </v-text-field>
          <v-text-field :label="'Amount of ' + offer.payTokenName + ' to sell'"
                        v-model="offer.payTokenAmount"
                        disabled>
          </v-text-field>
          <v-text-field :label="offer.buyTokenName + ' to pay per ' + offer.payTokenName"
                        :value="formatTokenAmount(offer.buyTokenAmount)"
                        disabled>
          </v-text-field>
          <v-text-field label="Total Price"
                        :value="formatTokenAmount(totalPrice, offer.buyTokenSymbol)"
                        disabled>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="d-block text-xs-center">
          <v-btn @click="cancel" :disabled="dialogLoading" depressed>Cancel</v-btn>
          <v-btn type="submit" class="primary" :disabled="!valid" :loading="dialogLoading" depressed>Revoke</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import Formatter from '@/utils/Formatter'
export default {

  props: [ 'visible', 'offer' ],

  data () {
    return {
      showDialog: false,
      dialogLoading: false,
      valid: false
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
    formatTokenAmount: Formatter.tokenAmount,

    cancel () {
      this.show = false
    },

    submit () {
      this.dialogLoading = true

      this.$wallet.revokeOfferToken(this.$http, this.offer).then((signedTX) => {
        return this.$http.post('blockchain/market/revoke', { signedTX }).then(({ data }) => {
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
