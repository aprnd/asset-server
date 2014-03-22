module.exports = function ExportBucketSchema(mongoose, Schema) {

  var bcrypt = require("bcrypt");
  var lastmod = require('../lastmod');

  var BucketSchema = new Schema({

    hash: {
      type: String,
      required: true,
      unique: true
    },

    subdomain: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    apiKey: {
      type: String,
      required: true
    },

    apiSecret: {
      type: String,
      required: true
    },

    created: {
      type: Date,
      default: Date.now
    }

  });

  BucketSchema.methods.validSecret = function(secret) {
    log.info('Comparing secrets for '+this.name);
    return bcrypt.compareSync(secret, this.apiSecret);
  };

  BucketSchema.plugin(lastmod);

  return BucketSchema;

};