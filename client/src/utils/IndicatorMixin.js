export default {
  methods: {
    successIndicator (data, properties = {}) {
      Object.keys(properties).forEach(k => { this[k] = properties[k] })

      if (data.message) this.$bus.emit('app:indicator', 'success', data.message)
    },

    errorIndicator (data, properties = {}) {
      Object.keys(properties).forEach(k => { this[k] = properties[k] })

      if (this.errors && data.errors) {
        Object.keys(data.errors).forEach(k => {
          this.errors[k] = this.errors[k] || []
          this.errors[k].push(data.errors[k])
        })
      }

      if (data.message) this.$bus.emit('app:indicator', 'error', data.message)
    },

    resetIndicator () {
      this.$bus.emit('app:indicator')
    }
  }
}
