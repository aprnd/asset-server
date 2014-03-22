var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: true, timestamp: true }),
    //new winston.transports.File({ filename: __dirname + '/../debug.log', json: true, timestamp: true })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: true, timestamp: true }),
    //new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
  ],
  exitOnError: false
});

module.exports = logger;