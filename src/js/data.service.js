const YAML = require('yaml')

var DEFAULT_DATA = {};

function DataService() {
    this.getDefaultData = function() {
        return YAML.stringify(DEFAULT_DATA);
    }
}

export { DataService };