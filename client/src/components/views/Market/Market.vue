<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>Market</v-toolbar-title>
          <v-spacer/>
          <v-tooltip left>
            <v-btn @click.native="openTokenSellDialog" icon slot="activator">
              <v-icon>file_upload</v-icon>
            </v-btn>
            <span>Sell AssetToken</span>
          </v-tooltip>
          <v-tooltip left>
            <v-btn @click.stop="openTokenBalancesDialog" icon slot="activator">
              <v-icon>account_balance_wallet</v-icon>
            </v-btn>
            <span>Show your token balances</span>
          </v-tooltip>
        </v-toolbar>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="items"
            :total-items="totalItems"
            :pagination.sync="pagination"
            :loading="tableLoading"
            :hide-actions="totalItems < 10"
            :rows-per-page-items="[10, 25, 50]"
            item-key="id"
            no-data-text="No offers available"
            prev-icon="navigate_before"
            next-icon="navigate_next"
            sort-icon="arrow_drop_down"
            must-sort
          >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
              <tr @click="props.expanded = !props.expanded">
                <td class="text-xs-center">
                  <v-icon v-if="props.item.isOwner" small>check_circle</v-icon>
                </td>
                <td>{{ props.item.datetime }}</td>
                <td>{{ props.item.payTokenName }}</td>
                <td class="text-xs-right nowrap">{{ props.item.payTokenAmount }} {{ props.item.payTokenSymbol }}</td>
                <td>{{ props.item.buyTokenName }}</td>
                <td class="text-xs-right nowrap">{{ props.item.buyTokenAmount }} {{ props.item.buyTokenSymbol }}</td>
                <td class="text-xs-right nowrap">{{ props.item.buyTokenTotal }} {{ props.item.buyTokenSymbol }}</td>
                <td class="justify-center pa-0">
                  <v-tooltip v-if="props.item.isOwner" left>
                    <v-btn icon class="ma-0" @click.stop="openTokenRevokeOfferDialog(props.item)" slot="activator">
                      <v-icon small>delete</v-icon>
                    </v-btn>
                    <span>Revoke offer</span>
                  </v-tooltip>
                  <v-tooltip v-else left>
                    <v-btn icon class="ma-0" @click.stop="openTokenBuyDialog(props.item)" slot="activator">
                      <v-icon>compare_arrows</v-icon>
                    </v-btn>
                    <span>Buy {{ props.item.payTokenName }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </template>
            <template slot="expand" slot-scope="props">
              <v-card dark>
                <v-card-text>
                  <span class="label">Offer Id:</span> {{ props.item.id }}<br/>
                  <span class="label">Owner Address:</span> {{ props.item.owner }}
                </v-card-text>
              </v-card>
            </template>
          </v-data-table>
          <small class="d-block">Last update: {{ updatedAt }}</small>
        </v-card-text>
      </v-card>
    </v-flex>

    <wallet-create-dialog :visible="showWalletCreateDialog" @close="showWalletCreateDialog = false"/>
    <wallet-unlock-dialog :visible="showWalletUnlockDialog" @close="showWalletUnlockDialog = false"/>
    <v-dialog v-model="showTokenBalancesDialog">
      <token-balances-card @close="showTokenBalancesDialog = false" :dialog="true"/>
    </v-dialog>
    <token-buy-dialog
      :offer="tradingData"
      :visible="showTokenBuyDialog"
      @close="showTokenBuyDialog = false"
      @success="finalizeTokenBuy"
    />
    <token-sell-dialog
      :visible="showTokenSellDialog"
      @close="showTokenSellDialog = false"
      @success="finalizeTokenSell"
    />
    <token-revoke-offer-dialog
      :offer="tradingData"
      :visible="showTokenRevokeOfferDialog"
      @close="showTokenRevokeOfferDialog = false"
      @success="finalizeTokenRevokeOffer"
    />
  </v-layout>
</template>

<script>
import Formatter from '@/utils/Formatter'
import WalletCreateDialog from '@/components/views/Wallet/CreateDialog'
import WalletUnlockDialog from '@/components/views/Wallet/UnlockDialog'
import TokenBuyDialog from '@/components/views/Token/BuyDialog'
import TokenSellDialog from '@/components/views/Token/SellDialog'
import TokenRevokeOfferDialog from '@/components/views/Token/RevokeOfferDialog'
import TokenBalancesCard from '@/components/views/Token/BalancesCard'
export default {

  components: {
    'wallet-create-dialog': WalletCreateDialog,
    'wallet-unlock-dialog': WalletUnlockDialog,
    'token-buy-dialog': TokenBuyDialog,
    'token-sell-dialog': TokenSellDialog,
    'token-revoke-offer-dialog': TokenRevokeOfferDialog,
    'token-balances-card': TokenBalancesCard
  },

  data () {
    return {
      tableLoading: false,
      items: [],
      totalItems: 0,
      headers: [
        { text: 'Your Offer', value: 'isOwner', width: '1%' },
        { text: 'Offer Date', value: 'datetime' },
        { text: 'Token to Buy', value: 'payTokenName' },
        { text: 'Amount', value: 'payTokenAmount', width: '1%' },
        { text: 'Token to Pay', value: 'buyTokenName' },
        { text: 'Price per Token to Buy', value: 'buyTokenAmount', width: '1%' },
        { text: 'Total Price', value: 'buyTokenTotal', width: '1%' },
        { text: '', value: 'action', width: '1%', sortable: false }
      ],
      pagination: { sortBy: 'datetime', descending: true },
      updatedAt: null,
      availableWallet: false,
      unlockedWallet: false,
      showWalletCreateDialog: false,
      showWalletUnlockDialog: false,
      showTokenBuyDialog: false,
      showTokenSellDialog: false,
      showTokenRevokeOfferDialog: false,
      showTokenBalancesDialog: false,
      targetDialog: null,
      currentOffer: null,
      tradingData: {}
    }
  },

  created () {
    this.walletStatusHandler()
    this.$bus.$on('app:wallet:status', this.walletDialogHandler)
  },

  beforeDestroy () {
    this.$bus.$off('app:wallet:status', this.walletDialogHandler)
  },

  watch: {
    pagination: {
      handler () { this.loadOffers() },
      deep: true
    }
  },

  methods: {
    walletStatusHandler () {
      this.availableWallet = this.$wallet.availableWallet()
      this.unlockedWallet = this.$wallet.unlockedWallet()
    },

    walletDialogHandler () {
      this.walletStatusHandler()

      if (this.unlockedWallet && this.targetDialog) this['open' + this.targetDialog](this.currentOffer)
    },

    loadOffers () {
      this.tableLoading = true

      this.$http.get('blockchain/market/offers').then(({ data: { data } }) => {
        var { sortBy, descending, page, rowsPerPage } = this.pagination
        var offers = data.offers.map(this.formatOfferData)
        var items = offers

        if (sortBy) {
          items = items.sort((a, b) => {
            var sortA = a[sortBy]
            var sortB = b[sortBy]

            if (descending) {
              if (sortA < sortB) return 1
              if (sortA > sortB) return -1
              return 0
            } else {
              if (sortA < sortB) return -1
              if (sortA > sortB) return 1
              return 0
            }
          })
        }

        if (rowsPerPage > 0) {
          items = items.slice((page - 1) * rowsPerPage, page * rowsPerPage)
        }

        this.items = items
        this.totalItems = offers.length
        this.tableLoading = false
        this.updatedAt = Formatter.datetime(new Date())
      }).catch(({ response: { data } }) => {
        this.errorIndicator(data, { tableLoading: false })
      })
    },

    openTokenBalancesDialog (offer) {
      this.targetDialog = 'TokenBalancesDialog'

      if (!this.availableWallet) {
        this.showWalletCreateDialog = true
      } else {
        this.showTokenBalancesDialog = true
      }
    },

    openTokenBuyDialog (offer) {
      this.currentOffer = offer
      this.targetDialog = 'TokenBuyDialog'

      if (!this.availableWallet) {
        this.showWalletCreateDialog = true
      } else if (!this.unlockedWallet) {
        this.showWalletUnlockDialog = true
      } else {
        this.currentOffer = null
        this.tradingData = Object.assign({ maxAmount: offer.payTokenAmount }, offer)
        this.showTokenBuyDialog = true
      }
    },

    openTokenSellDialog () {
      this.currentOffer = null
      this.targetDialog = 'TokenSellDialog'

      if (!this.availableWallet) {
        this.showWalletCreateDialog = true
      } else if (!this.unlockedWallet) {
        this.showWalletUnlockDialog = true
      } else {
        this.showTokenSellDialog = true
      }
    },

    openTokenRevokeOfferDialog (offer) {
      this.currentOffer = offer
      this.targetDialog = 'TokenRevokeOfferDialog'

      if (!this.availableWallet) {
        this.showWalletCreateDialog = true
      } else if (!this.unlockedWallet) {
        this.showWalletUnlockDialog = true
      } else {
        this.currentOffer = null
        this.tradingData = Object.assign({}, offer)
        this.showTokenRevokeOfferDialog = true
      }
    },

    finalizeTokenBuy () {
      this.loadOffers()
      this.showTokenBuyDialog = false
    },

    finalizeTokenSell () {
      this.loadOffers()
      this.showTokenSellDialog = false
    },

    finalizeTokenRevokeOffer () {
      this.loadOffers()
      this.showTokenRevokeOfferDialog = false
    },

    formatOfferData (offer) {
      var data = {
        id: offer.id,
        datetime: Formatter.datetime(offer.datetime),
        owner: offer.owner,
        isOwner: this.$auth.user.wallet.toLowerCase() === offer.owner.toLowerCase(),
        payTokenName: offer.pay.name,
        payTokenAmount: Formatter.tokenAmount(offer.pay.amount),
        payTokenSymbol: offer.pay.symbol,
        payTokenAddress: offer.pay.address,
        buyTokenName: offer.buy.name,
        buyTokenAmount: Formatter.tokenAmount(offer.buy.amount / offer.pay.amount),
        buyTokenSymbol: offer.buy.symbol,
        buyTokenAddress: offer.buy.address,
        buyTokenTotal: Formatter.tokenAmount(offer.buy.amount)
      }
      return data
    }
  }

}
</script>
