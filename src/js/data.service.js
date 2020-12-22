const YAML = require('yaml')

var DEFAULT_DATA = `
config:
  tokens_total: 6
  token_booking_cost:
    days:
      1: 0
      2: 1
      3: 2
      max: 3
    time:
      60: 0
      90: 0
data:
  bookings: []
`

function DataService() {
    this.getDefaultData = function() {
        return YAML.stringify(YAML.parse(DEFAULT_DATA));
    }
}

export { DataService };