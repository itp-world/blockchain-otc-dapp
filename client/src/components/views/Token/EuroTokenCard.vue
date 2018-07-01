<template>
  <v-card>
    <v-toolbar card>
      <v-toolbar-title>EuroToken</v-toolbar-title>
      <v-spacer/>
      <v-tooltip left>
        <v-btn @click.native="openDialog" icon slot="activator">
          <v-icon>file_upload</v-icon>
        </v-btn>
        <span>Release token for trading</span>
      </v-tooltip>
      <v-tooltip left>
        <v-btn @click.native="loadEuroToken" :loading="euroTokenLoading" icon slot="activator">
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
      <div class="caption mt-2">Unreleased EuroToken for trading</div>
      <v-chip label class="ma-0 d-block">
        <v-icon left>euro_symbol</v-icon>{{ token.balance }} {{ token.token.symbol }}
      </v-chip>
      <small class="mt-3 d-block">Last update: {{ updatedAt }}</small>
    </v-card-text>

    <v-dialog v-model="showDialog" persistent>
      <v-card>
        <v-card-title>
          <div class="headline">Release EuroToken for Trading</div>
        </v-card-title>
        <v-card-text>
          <p>
            Please use the user management from the adminstration menu entry.
          </p>
          <p>
            There you can transfer EuroToken to any user via clicking the
            corresponding <v-icon small>settings</v-icon> icon.
          </p>
        </v-card-text>
        <v-card-actions class="d-block text-xs-center">
          <v-btn @click="cancel" depressed>Cancel</v-btn>
          <v-btn @click="redirect" class="primary" depressed>Goto User Management</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import Formatter from '@/utils/Formatter'
export default {

  data () {
    return {
      token: { token: {} },
      updatedAt: '',
      euroTokenLoading: false,
      showDialog: false
    }
  },

  created () {
    this.loadEuroToken()
  },

  methods: {
    loadEuroToken () {
      return this.$http.get('blockchain/token/EuroToken').then(({ data: { data } }) => {
        data.balance = Formatter.tokenAmount(data.balance)
        this.token = data
        this.euroTokenLoading = false
        this.updatedAt = Formatter.datetime(new Date())
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { euroTokenLoading: false })
      })
    },

    openDialog () {
      this.showDialog = true
    },

    cancel () {
      this.showDialog = false
    },

    redirect () {
      this.cancel()
      this.$router.push({ name: 'AdministrationUsers' })
    }
  }

}
</script>
