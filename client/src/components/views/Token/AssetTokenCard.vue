<template>
  <v-card>
    <v-toolbar card>
      <v-toolbar-title>AssetToken</v-toolbar-title>
      <v-spacer/>
      <v-tooltip left>
        <v-btn @click.native="openDialog" icon slot="activator">
          <v-icon>file_upload</v-icon>
        </v-btn>
        <span>Release token for trading</span>
      </v-tooltip>
      <v-tooltip left>
        <v-btn @click.native="loadAssetToken" :loading="assetTokenLoading" icon slot="activator">
          <v-icon>refresh</v-icon>
        </v-btn>
        <span>Update token data</span>
      </v-tooltip>
    </v-toolbar>
    <v-card-text>
      <div class="caption">Address</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>link</v-icon>{{ token.token.address }}
      </v-chip>
      <div class="caption mt-2">Unreleased AssetToken for trading</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>assessment</v-icon>{{ token.balance }} {{ token.token.symbol }}
      </v-chip>
      <small class="mt-3 d-block">Last update: {{ updatedAt }}</small>
    </v-card-text>

    <v-dialog v-model="showDialog" persistent>
      <v-form v-model="valid" ref="releaseAssetTokenForm" class="token-form" @submit="submit">
        <v-card>
          <v-card-title>
            <div class="headline">Release AssetToken for Trading</div>
          </v-card-title>
          <v-card-text>
            <v-text-field label="Amount of AssetToken"
                          v-model="release.asset"
                          :rules="[ validateAssetTokenOffer ]"
                          :error-messages="errors.assetToken"
                          @keypress="isNumber">
            </v-text-field>
            <v-text-field label="EuroToken to pay per AssetToken"
                          v-model="release.euro"
                          :error-messages="errors.euroToken"
                          @keypress="isNumber">
            </v-text-field>
            <v-text-field label="Total Price"
                          :value="totalPrice"
                          disabled>
            </v-text-field>
          </v-card-text>
          <v-card-actions class="d-block text-xs-center">
            <v-btn @click="cancel" :disabled="dialogLoading" depressed>Cancel</v-btn>
            <v-btn type="submit" class="primary" :disabled="!valid" :loading="dialogLoading" depressed>Release</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-card>
</template>

<script>
import Formatter from '@/utils/Formatter'
import Validators from '@/utils/Validators'
export default {

  data () {
    return {
      token: { token: {} },
      updatedAt: '',
      assetTokenLoading: false,
      showDialog: false,
      dialogLoading: false,
      valid: false,
      release: {},
      errors: { assetToken: [], euroToken: [] }
    }
  },

  computed: {
    totalPrice () {
      var total = this.release.asset * this.release.euro
      return Formatter.tokenAmount(total, 'EUR')
    }
  },

  created () {
    this.loadAssetToken()
  },

  methods: {
    loadAssetToken () {
      return this.$http.get('blockchain/token/AssetToken').then(({ data: { data } }) => {
        data.balance = Formatter.tokenAmount(data.balance)
        this.token = data
        this.assetTokenLoading = false
        this.updatedAt = Formatter.datetime(new Date())
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { assetTokenLoading: false })
      })
    },

    openDialog () {
      this.loadAssetToken().then(() => {
        this.release = { asset: this.token.balance, euro: Formatter.tokenAmount(1) }
        this.errors = { assetToken: [], euroToken: [] }
        this.dialogLoading = false
        this.showDialog = true
      })
    },

    isNumber: Validators.handleNumberKeyEvent,

    validateAssetTokenOffer (value) {
      return Validators.maxTokenAmount(value, this.token.balance)
    },

    cancel () {
      this.showDialog = false
    },

    submit () {
      this.dialogLoading = true

      var data = {
        AssetToken: Formatter.tokenAmount(this.release.asset),
        EuroToken: Formatter.tokenAmount(this.release.asset * this.release.euro)
      }

      this.$http.post('blockchain/market/release/AssetToken/EuroToken', data).then(({ data }) => {
        this.cancel()
        this.successIndicator(data)
        this.loadAssetToken()
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { dialogLoading: false })
      })
    }
  }

}
</script>
