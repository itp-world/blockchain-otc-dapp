<template>
  <v-navigation-drawer app dark v-model="drawer" clipped temporary>
    <v-list dark>
      <v-list-tile @click="goto('Home')">
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Home</v-list-tile-title>
      </v-list-tile>

      <v-list-tile @click="goto('Market')">
        <v-list-tile-action>
          <v-icon>account_balance</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Market</v-list-tile-title>
      </v-list-tile>

      <v-list-tile @click="goto('Account')">
        <v-list-tile-action>
          <v-icon>account_box</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Account</v-list-tile-title>
      </v-list-tile>

      <v-list-group v-if="$auth.user.isAdmin" prepend-icon="settings" no-action>
        <v-list-tile slot="activator">
          <v-list-tile-content>
            <v-list-tile-title>Administration</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="goto('AdministrationUsers')">
          <v-list-tile-title>User</v-list-tile-title>
        </v-list-tile>

        <v-list-tile @click="goto('AdministrationToken')">
          <v-list-tile-title>Token</v-list-tile-title>
        </v-list-tile>
      </v-list-group>

      <v-list-tile @click="signOut">
        <v-list-tile-action>
          <v-icon>exit_to_app</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Sign Out</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {

  data () {
    return {
      drawer: false
    }
  },

  created () {
    this.$bus.on('app:navigation', this.navigation)
  },

  beforeDestroy () {
    this.$bus.off('app:navigation', this.navigation)
  },

  methods: {
    navigation (status) {
      this.drawer = status
    },

    signOut () {
      this.drawer = false
      this.$auth.signOut(this)
    },

    goto (name) {
      this.drawer = false
      this.resetIndicator()
      this.$router.push({ name })
    }
  }

}
</script>
