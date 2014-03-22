var nconf = require('nconf');

var filename = 'config.'+ (nconf.env().get("AssetServerEnv") || "local") +'.json';

nconf.file({ file: filename });
module.exports = nconf.get('config');