<template>
  <v-card>
    <v-toolbar card>
      <v-toolbar-title>Account Data</v-toolbar-title>
      <v-spacer/>
      <v-tooltip left>
        <v-btn icon @click.native="openDialog" slot="activator">
            <v-icon>edit</v-icon>
        </v-btn>
        <span>Edit account data</span>
      </v-tooltip>
    </v-toolbar>
    <v-card-text>
      <div class="caption">Username</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>account_box</v-icon>{{ username }}
      </v-chip>
      <div class="caption mt-2">Last Login</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>today</v-icon>{{ lastLoginAt }}
      </v-chip>
    </v-card-text>

    <v-dialog v-model="showDialog" persistent>
      <v-form v-model="valid" ref="updateUserForm" @submit="submit">
        <v-card>
          <v-toolbar card>
            <v-toolbar-title>Update Account Data</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <password-field v-model="updateUser.password"
                            :errors="errors.password"
                            :rules="rules.password">
            </password-field>
          </v-card-text>
          <v-card-actions class="d-block text-xs-center">
            <v-btn @click.stop="cancel"
                   :disabled="loading"
                   depressed>
              Cancel
            </v-btn>
            <v-btn type="submit"
                   color="primary"
                   :disabled="!valid"
                   :loading="loading">
              Update
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-card>
</template>

<script>
import Formatter from '@/utils/Formatter'
import PasswordField from '@/components/partials/PasswordField'
export default {

  components: {
    'password-field': PasswordField
  },

  data () {
    return {
      valid: false,
      loading: false,
      showDialog: false,
      updateUser: {},
      rules: {
        password: [
          (value) => !!value || 'Your current or new password is required',
          (value) => (!!value && value.length >= 8) || 'The password must be at least 8 characters long'
        ]
      },
      errors: { password: [] }
    }
  },

  computed: {
    username () {
      return this.$auth.user.username
    },

    lastLoginAt () {
      if (!this.$auth.user.lastLoginAt) return ''
      return Formatter.datetime(this.$auth.user.lastLoginAt)
    }
  },

  methods: {
    openDialog () {
      this.$refs.updateUserForm.reset()
      this.$bus.emit('app:form:password:visible', false)
      this.updateUser = { password: '' }
      this.showDialog = true
    },

    cancel () {
      this.resetIndicator()
      this.showDialog = false
      this.loading = false
    },

    submit () {
      this.loading = true
      this.$http.put('account', { password: this.updateUser.password }).then((response) => {
        this.cancel()
        this.successIndicator(response.data)
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { loading: false })
      })
    }
  }

}
</script>
