<template>
  <v-app>
    <v-snackbar v-model="snackbar.show"
                :color="snackbar.type"
                :timeout="0"
                :bottom="$vuetify.breakpoint.smAndDown"
                :top="$vuetify.breakpoint.mdAndUp">{{ snackbar.message }}
      <v-btn icon @click.native="snackbar.show = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-toolbar app tabs dark>
      <v-toolbar-side-icon v-if="$auth.isAuthenticated()" @click.native="$bus.emit('app:navigation', !navigation)"/>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-toolbar>

    <v-content>
      <navigation-drawer/>

      <v-container grid-list-lg>
        <router-view></router-view>
      </v-container>
    </v-content>

    <v-footer app dark></v-footer>
  </v-app>
</template>

<script>
import NavigationDrawer from '@/components/partials/NavigationDrawer'
export default {
  name: 'App',
  components: {
    'navigation-drawer': NavigationDrawer
  },
  data () {
    return {
      title: 'Blockchain OTC Market',
      navigation: false,
      snackbar: { show: false, type: null, message: '', timeout: null }
    }
  },
  created () {
    this.$bus.on('app:indicator', this.indicator)
    this.$bus.emit('app:navigation', this.drawer)
  },
  beforeDestroy () {
    this.$bus.off('app:indicator', this.indicator)
  },
  methods: {
    indicator (type, message) {
      this.snackbar.show = !!message
      this.snackbar.type = type || ''
      this.snackbar.message = message || ''
      clearTimeout(this.snackbar.timeout)
      if (message) this.snackbar.timeout = setTimeout(() => { this.snackbar.show = false }, 6000)
    }
  }
}
</script>

<style lang="sass" src="./assets/stylesheets/main.sass"></style>
