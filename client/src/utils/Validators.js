import Formatter from '@/utils/Formatter'
export default {

  handleNumberKeyEvent (evt) {
    evt = evt || window.event
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode >= 35 && charCode <= 39) return // allow: home, end, left, right
    if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) evt.preventDefault()
  },

  minTokenAmount (amount, minAmount) {
    if (!amount) return true
    amount = parseFloat(amount)
    return (amount > minAmount) || 'The token amount must be greater than ' + Formatter.tokenAmount(minAmount)
  },

  maxTokenAmount (amount, maxAmount) {
    if (!amount) return true
    amount = parseFloat(amount)
    return (amount >= 0 && amount <= maxAmount) || 'The token amount must be between 0 and ' + Formatter.tokenAmount(maxAmount)
  }

}
