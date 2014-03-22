var nconf = require('nconf');

nconf.file({ file: 'config.'+ (nconf.get("AssetServerEnv") || "local") +'.json' });
module.exports = nconf.get('config');