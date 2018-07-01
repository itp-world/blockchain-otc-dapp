<template>
  <v-dialog v-model="show" persistent>
    <v-form v-model="valid" ref="walletUnlockForm" @submit="submit">
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>Unlock Wallet</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <password-field v-model="wallet.password"
                          label="Wallet Password"
                          :errors="errors.password"
                          :rules="rules">
          </password-field>
        </v-card-text>
        <v-card-actions class="d-block text-xs-center">
          <v-btn @click.stop="cancel" :disabled="loading" depressed>Cancel</v-btn>
          <v-btn type="submit" class="primary" :disabled="!valid" :loading="loading" depressed>Unlock</v-btn>
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

  props: ['visible'],

  data () {
    return {
      wallet: { password: '' },
      valid: false,
      loading: false,
      rules: [ (value) => !!value || 'The password is required' ],
      errors: { password: [] }
    }
  },

  computed: {
    show: {
      get () { return this.visible },
      set (value) { if (!value) this.$emit('close') }
    }
  },

  methods: {
    cancel () {
      this.resetIndicator()
      this.show = false
      this.$bus.emit('app:form:password:visible', false)
      this.$refs.walletUnlockForm.reset()
      this.errors.password = []
      this.loading = false
    },

    submit () {
      if (this.$refs.walletUnlockForm.validate()) {
        this.$bus.emit('app:form:password:visible', false)
        this.loading = true
        this.$wallet.unlockWallet(this, this.wallet.password).then(() => {
          this.cancel()
          this.successIndicator({ message: 'The wallet has been successfully unlocked.' })
          this.$bus.emit('app:wallet:status', 'unlocked')
        }).catch((error) => {
          this.errorIndicator(error, { loading: false })
        })
      }
    }
  }

}
</script>
