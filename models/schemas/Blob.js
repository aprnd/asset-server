module.exports = function ExportBlobSchema(mongoose, Schema) {

  var bcrypt = require("bcrypt");
  var lastmod = require('../lastmod');

  var BlobSchema = new Schema({

    hash: {
      type: String,
      required: true,
      unique: true
    },

    contentType: {
      type: String,
      required: true
    },

    contentLength: {
      type: Number,
      required: true
    },

    contentMd5: {
      type: String
    },

    created: {
      type: Date,
      default: Date.now,
      required: true
    },

    bucket: {
      type: Schema.Types.ObjectId,
      ref: 'Bucket',
      required: true
    },

    path: {
      type: String,
      index: true,
      required: true
    },

    sourceIp: {
      type: String,
      required: true
    },

    fileName: {
      type: String,
      required: true,
      index: true,
    }

  });


  BlobSchema.plugin(lastmod);

  return BlobSchema;

};

