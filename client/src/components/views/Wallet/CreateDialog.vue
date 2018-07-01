<template>
  <v-dialog v-model="show" persistent>
    <v-form v-model="valid" ref="walletCreateForm" @submit="submit">
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>Create / Regenerate Wallet</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <password-field v-model="wallet.password"
                          label="Wallet Password"
                          :errors="errors.password"
                          :rules="rules.password">
          </password-field>

          <v-text-field v-model="wallet.seed"
                        label="Wallet Seed"
                        prepend-icon="short_text"
                        :rules="rules.seed"
                        :error-messages="errors.seed"
                        multi-line
                        rows=2
                        no-resize
                        required>
          </v-text-field>
          <div class="input-field-action">
            <v-btn @click.native="generateSeed" :disabled="loading" class="secondary ma-0" depressed small>Generate Wallet Seed</v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="d-block text-xs-center">
          <v-btn @click.stop="cancel" :disabled="loading" depressed>Cancel</v-btn>
          <v-btn type="submit" class="primary" :disabled="!valid" :loading="loading" depressed>Create / Regenerate</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import PasswordField from '@/components/partials/PasswordField'
export default {

  components: {
    'password-field': PasswordField
  },

  props: [ 'visible' ],

  data () {
    return {
      wallet: { password: '', seed: '' },
      valid: false,
      loading: false,
      rules: {
        password: [
          (value) => !!value || 'The password is required',
          (value) => (!!value && value.length >= 8) || 'The password must be at least 8 characters long'
        ],
        seed: [ (value) => !!value || 'The seed is required' ]
      },
      errors: { password: [], seed: [] }
    }
  },

  computed: {
    show: {
      get () { return this.visible },
      set (value) { if (!value) this.$emit('close') }
    }
  },

  methods: {
    generateSeed () {
      this.errors.seed = []
      this.wallet.seed = this.$wallet.generateSeed()
    },

    cancel () {
      this.resetIndicator()
      this.show = false
      this.$bus.emit('app:form:password:visible', false)
      this.$refs.walletCreateForm.reset()
      this.errors = { password: [], seed: [] }
      this.loading = false
    },

    submit () {
      if (this.$refs.walletCreateForm.validate()) {
        this.$bus.emit('app:form:password:visible', false)
        this.loading = true
        this.$wallet.createWallet(this, this.wallet.password, this.wallet.seed).then(() => {
          this.cancel()
          this.successIndicator({ message: 'The wallet has been successfully created.' })
          this.$bus.emit('app:wallet:status', 'created')
        }).catch((error) => { this.errorIndicator(error, { loading: false }) })
      }
    }
  }

}
</script>
