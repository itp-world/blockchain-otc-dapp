import moment from 'moment'
export default {

  datetime (date) {
    return date ? moment(date).format('L LTS') : null
  },

  tokenAmount (amount, appendix) {
    var value = parseFloat(amount || 0).toFixed(2)
    if (appendix) value += ' ' + appendix
    return value
  }

}
