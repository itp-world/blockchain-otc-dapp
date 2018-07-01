<template>
  <v-text-field v-model="password"
                :label="label"
                :type="visible ? 'text' : 'password'"
                prepend-icon="lock"
                :append-icon="visible ? 'visibility' : 'visibility_off'"
                :append-icon-cb="visibleHandler"
                :rules="rules"
                :error-messages="errors"
                @input="value => { $emit('input', value) }"
                required>
  </v-text-field>
</template>

<script>
export default {

  props: {
    value: { type: String },
    label: { type: String, default: 'Password' },
    rules: { type: Array, default: () => [] },
    errors: { type: Array, default: () => [] }
  },

  data () {
    return { password: '', visible: false }
  },

  created () {
    this.password = this.value
    this.$bus.on('app:form:password:visible', this.visibleHandler)
  },

  beforeDestroy () {
    this.$bus.off('app:form:password:visible', this.visibleHandler)
  },

  methods: {
    visibleHandler (visible) {
      if (visible === undefined) visible = !this.visible
      this.visible = visible
    }
  }

}
</script>
