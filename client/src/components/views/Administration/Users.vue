<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>User</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            append-icon="search"
            label="Search"
            single-line
            hide-details
            v-model="filter">
          </v-text-field>
        </v-toolbar>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="items"
            :loading="tableLoading"
            :pagination.sync="pagination"
            :total-items="totalItems"
            :hide-actions="totalItems < 10"
            :rows-per-page-items="[10, 25, 50]"
            item-key="username"
            prev-icon="navigate_before"
            next-icon="navigate_next"
            sort-icon="arrow_drop_down"
            must-sort
          >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
              <tr @click="props.expanded = !props.expanded">
                <td>
                  <v-tooltip v-if="props.item.username == $auth.user.username" color="info" top>
                    <v-chip slot="activator" label class="d-block its-you">
                      <v-icon left>account_box</v-icon>{{ props.item.username }}
                    </v-chip>
                    <span>this is your account</span>
                  </v-tooltip>
                  <span v-else>{{ props.item.username }}</span>
                </td>
                <td class="text-xs-right nowrap">{{ props.item.euroToken }}</td>
                <td class="text-xs-right nowrap">{{ props.item.assetToken }}</td>
                <td class="text-xs-center nowrap">{{ props.item.lastLoginAt }}</td>
                <td class="text-xs-center">
                  <v-icon v-if="props.item.activated" small>check_circle</v-icon>
                </td>
                <td class="text-xs-center">
                  <v-icon v-if="props.item.isAdmin" small>check_circle</v-icon>
                </td>
                <td class="justify-center pa-0">
                  <v-tooltip left>
                    <v-btn icon class="ma-0" @click.stop="openDialog(props.item)" slot="activator">
                      <v-icon>settings</v-icon>
                    </v-btn>
                    <span>Update {{ props.item.username }}'s account data</span>
                  </v-tooltip>
                </td>
              </tr>
            </template>
            <template slot="expand" slot-scope="props">
              <v-card dark>
                <v-card-text>
                  <span class="label">Current Login at:</span> {{ props.item.currentLoginAt }}<br/>
                  <span class="label">Created at:</span> {{ props.item.createdAt }}<br/>
                  <span class="label">Updated at:</span> {{ props.item.updatedAt }}<br/>
                  <span class="label">Wallet Address:</span> {{ props.item.wallet }}
                </v-card-text>
              </v-card>
            </template>
          </v-data-table>
        </v-card-text>

        <v-dialog v-model="showDialog" persistent>
          <v-form v-model="valid" ref="updateUserForm" @submit="submit">
            <v-card>
              <v-card-title>
                <div class="headline">Account {{ updateUser.username }}</div>
              </v-card-title>
              <v-card-text>
                <v-checkbox v-if="$auth.user.username != updateUser.username"
                            label="Activated"
                            v-model="updateUser.activated">
                </v-checkbox>
                <v-checkbox v-if="$auth.user.username != updateUser.username"
                            label="Administrator"
                            v-model="updateUser.isAdmin">
                </v-checkbox>
                <v-text-field v-if="updateUser.wallet"
                              label="Transfer EuroToken"
                              v-model="updateUser.tokenTransfer"
                              :rules="[ validateTokenTransfer ]"
                              :error-messages="errors.tokenTransfer"
                              @keypress="isNumber"
                              @blur="updateUser.tokenTransfer = formatTokenAmount(updateUser.tokenTransfer)">
                </v-text-field>
                <v-text-field v-else
                              label="Transfer EuroToken"
                              value="0.0"
                              :error-messages="['The user don\'t have an registered wallet address']"
                              disabled>
                </v-text-field>
              </v-card-text>
              <v-card-actions class="d-block text-xs-center">
                <v-btn @click="cancel" :disabled="dialogLoading" depressed>Cancel</v-btn>
                <v-btn type="submit" class="primary" :disabled="!valid" :loading="dialogLoading" depressed>Update</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Formatter from '@/utils/Formatter'
import Validators from '@/utils/Validators'
export default {

  data () {
    return {
      tableLoading: false,
      filter: '',
      items: [],
      totalItems: 0,
      pagination: {},
      headers: [
        { text: 'Username', value: 'username', align: 'left' },
        { text: 'EuroToken', value: 'euroToken', width: '1%', sortable: false },
        { text: 'AssetToken', value: 'assetToken', width: '1%', sortable: false },
        { text: 'Last Login', value: 'lastLoginAt', width: '235px' },
        { text: 'Active', value: 'activated', width: '1%' },
        { text: 'Admin', value: 'isAdmin', width: '1%' },
        { text: '', value: 'action', width: '1%', sortable: false }
      ],
      showDialog: false,
      dialogLoading: false,
      valid: false,
      maxTokenTransfer: 0,
      errors: { tokenTransfer: [] },
      updateIndex: -1,
      updateUser: {}
    }
  },

  watch: {
    filter: {
      handler () { this.loadUsers() },
      deep: true
    },

    pagination: {
      handler () { this.loadUsers() },
      deep: true
    }
  },

  methods: {
    loadUsers () {
      this.tableLoading = true

      var { sortBy, descending, page, rowsPerPage } = this.pagination
      var params = { search: this.filter, sortBy, descending, page, rowsPerPage }

      this.$http.get('users', { params }).then(({ data: { data } }) => {
        this.items = data.users.map(this.formatUserData)
        this.totalItems = data.total
        this.tableLoading = false
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { tableLoading: false })
      })
    },

    openDialog (item) {
      this.$http.get('blockchain/token/EuroToken').then(({ data: { data } }) => {
        this.maxTokenTransfer = Formatter.tokenAmount(data.balance)
        this.updateIndex = this.items.indexOf(item)
        this.updateUser = {
          username: item.username,
          activated: item.activated,
          isAdmin: item.isAdmin,
          wallet: item.wallet,
          tokenTransfer: null
        }
        this.errors = { tokenTransfer: [] }
        this.dialogLoading = false
        this.showDialog = true
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { dialogLoading: false })
      })
    },

    isNumber: Validators.handleNumberKeyEvent,
    formatTokenAmount: Formatter.tokenAmount,

    validateTokenTransfer (value) {
      return Validators.maxTokenAmount(value, this.maxTokenTransfer)
    },

    cancel () {
      this.showDialog = false
    },

    submit () {
      this.dialogLoading = true

      var data = {
        activated: this.updateUser.activated,
        isAdmin: this.updateUser.isAdmin,
        transfer: {
          token: 'EuroToken',
          amount: Formatter.tokenAmount(this.updateUser.tokenTransfer)
        }
      }

      this.$http.put('users/' + this.updateUser.username, data).then(({ data }) => {
        Object.assign(this.items[this.updateIndex], this.formatUserData(data.data.user))
        this.cancel()
        this.successIndicator(data)
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { dialogLoading: false })
      })
    },

    formatUserData (user) {
      var keys = ['createdAt', 'updatedAt', 'currentLoginAt', 'lastLoginAt']
      keys.forEach(k => { user[k] = Formatter.datetime(user[k]) })
      user.euroToken = Formatter.tokenAmount(user.token.EuroToken.balance, user.token.EuroToken.token.symbol)
      user.assetToken = Formatter.tokenAmount(user.token.AssetToken.balance, user.token.AssetToken.token.symbol)
      return user
    }
  }

}
</script>
