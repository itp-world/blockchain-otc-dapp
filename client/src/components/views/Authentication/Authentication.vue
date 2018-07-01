<template>
  <v-layout row wrap>
    <v-flex sm6 offset-sm3 md4 offset-md4>
      <v-form v-model="valid" ref="authForm" @submit="submit">
        <v-card>
          <v-toolbar card>
            <v-toolbar-title>{{ submitText }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field label="Username"
                          v-model="user.username"
                          prepend-icon="account_box"
                          :rules="rules.username"
                          :error-messages="errors.username"
                          required>
            </v-text-field>

            <password-field v-model="user.password"
                            :errors="errors.password"
                            :rules="rules.password">
            </password-field>
          </v-card-text>
          <v-card-actions class="d-block text-xs-center">
            <v-btn type="submit" color="primary" :disabled="!valid" :loading="loading">{{ submitText }}</v-btn>
          </v-card-actions>
          <v-card-actions class="d-block text-xs-center">
            <v-btn @click="toggle" :disabled="loading" flat small>{{ toggleText }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
import PasswordField from '@/components/partials/PasswordField'
export default {

  components: {
    'password-field': PasswordField
  },

  data () {
    return {
      valid: false,
      loading: false,
      submitText: 'Sign In',
      toggleText: 'I need to create an account',
      signUp: false,
      user: { username: '', password: '' },
      rules: {
        username: [ (value) => !!value || 'The username is required' ],
        password: [ (value) => !!value || 'The password is required' ]
      },
      errors: { username: [], password: [] }
    }
  },

  methods: {
    toggle () {
      this.loading = false
      this.resetMessagesAndPasswordVisibility()
      this.$refs.authForm.reset()
      this.signUp = !this.signUp

      if (this.signUp) {
        this.submitText = 'Sign Up'
        this.toggleText = 'I have already an account'
        this.rules.password.push(
          (value) => (!!value && value.length >= 8) || 'The password must be at least 8 characters long'
        )
      } else {
        this.submitText = 'Sign In'
        this.toggleText = 'I need to create an account'
        this.rules.password.pop()
      }
    },

    submit () {
      if (this.$refs.authForm.validate()) {
        this.resetMessagesAndPasswordVisibility()
        this.$auth[this.signUp ? 'signUp' : 'signIn'](this, this.user)
      }
    },

    resetMessagesAndPasswordVisibility () {
      this.resetIndicator()
      this.errors = { username: [], password: [] }
      this.$bus.emit('app:form:password:visible', false)
    }
  }

}
</script>
