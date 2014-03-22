/**
 * Initialize and start asset-server
 */
exports.init = function() {

  var restify = require('restify');
  var crypto = require('crypto');
  var fs = require('fs');

  var routes = require('./routes/index');

  var helpers = require('./modules/helpers');
  var config = require('./modules/config');

  // Variables to be passed to req
  var g = {};

  // Require our custom interface to Winston logger.
  var log = require('./modules/log');

  // Setup HTTPS if enabled
  if(config.ssl) {
    var httpsOptions = {
      key: fs.readFileSync(config.ssl.keyfile),
      certificate: fs.readFileSync(config.ssl.certfile)
    };
  }

  var winstonStream = {
      write: function(message, encoding){
          log.info(message.slice(0, -1));
      }
  };

  /**
   * Add configuration to request object
   */
  var addConfigurationToRequest = function addConfigurationToRequest(req, res, next) {
    req.requestIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return next();
  };

  /**
   * Setup both HTTP and HTTPS servers the same way
   * @param  {Object} app Restify instance
   */
  function setupServer(app) {
    //app.use(restify.dateParser(60)); // not used at the moment
    //app.use(restify.gzipResponse()); // gzip is broken with content-length set in restify
    //app.use(restify.acceptParser(httpServer.acceptable));
    //app.use(restify.queryParser());
    //app.use(restify.fullResponse()); // Respond with full headers
    //app.use(restify.bodyParser()); // Parse full body
    //app.use(restify.authorizationParser()); // Parse auth info manually
    app.use(restify.requestLogger({stream:winstonStream})); // Use winston to log restify
    app.use(restify.throttle({
      burst: config.throttle.burst,
      rate: config.throttle.rate,
      ip: true
    }));

    app.use(addConfigurationToRequest);

    /**
     * 
     *  Routes
     *  
     */

    // POST route to create buckets
    app.post('/bucket', helpers.failDomain, helpers.checkBucketKey, routes.bucket.post);

    /*
      POST requests are disabled for now as they require more implementation
      See: http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPOST.html
    */
    // httpServer.post('/', helpers.checkDomain, helpers.requireAuthorization, routes.post);

    // GET a blob (/blob?hash for a specific version)
    app.get('/.+', helpers.checkDomain, routes.get);

    // PUT a new blob
    app.put('/.+', helpers.requireValidDate, helpers.checkDomain, helpers.requireAuthorization, routes.put);

    // DELETE a blob (/blob?hash for a specific version)
    app.del('/.+', helpers.requireValidDate, helpers.checkDomain, helpers.requireAuthorization, routes.del);

    // Header information for a blob
    app.head('/.+', helpers.requireValidDate, helpers.checkDomain, helpers.requireAuthorization, routes.head);

  }

  /**
   * Start the HTTP/HTTPS servers up
   */

  // HTTPS only if enabled
  if(config.ssl) {
    var httpsServer = restify.createServer(httpsOptions);
    setupServer(httpsServer);

    httpsServer.listen(config.httpsport, function() {
      log.info('%s HTTPS listening at https://%s:%s', config.name, config.domain, config.httpsPort);
    });
  }

  // HTTP always
  var httpServer = restify.createServer();
  setupServer(httpServer);

  httpServer.listen(config.httpport, function() {
    log.info('%s HTTP listening at http://%s:%s', config.name, config.domain, config.httpPort);
  });

};
