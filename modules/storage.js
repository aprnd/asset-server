var mongoose = require('mongoose');
var log = require('./log');
var config = require('./config');
var modelRegister = require('../models/');

var models = {};
var conn = mongoose.createConnection(config.mongodb);

conn.on('error', function (err) {
  var stack = new Error().stack;
  log.error('mongodb error: '+err);
});

conn.once('open', function () {
  log.info('mongodb connected to '+config.mongodb);

  modelRegister.init(conn, mongoose.Schema);

});

module.exports = conn;
