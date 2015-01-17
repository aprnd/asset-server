var tld = require('tldjs');
var config = require('./config');
var storage = require('./storage');
var models = storage.models;
var AssetRequest = require('asset-server-client').AssetServerRequest;
var log = require('../modules/log');

/**
 * Middleware to check for the request subdomain and append any bucket data to the request.
 */
exports.checkDomain = function checkDomain(req, res, next) {

  if(tld.isValid(req.headers.host)) {

    // set cache
    res.cache("_public_", { "max-age": 604800 });

    var subdomain = tld.getSubdomain(req.headers.host).split('.')[0]; // split in case we're serving subdomain.local or subdomain.dev etc. pages
    
    if(subdomain !== '' && subdomain !== null && config.reservedsubdomains.indexOf(subdomain) === -1) {
     models.Bucket.findOne({ subdomain: subdomain }, function(err, bucket) {
        if(!err && bucket !== null) {
          req.bucket = bucket;
          return next();
        }
        else {
          res.send(404, 'Bucket '+subdomain+' not found');
        }
      });

    }
    else {
      res.send(404, 'Bucket not found or invalid');
      res.end();
    }
 
  }
  else {
    res.send(404, 'Not a valid host');
  }

};

/**
 * Middleware to fail if this request is tried on a bucket
 */
exports.failDomain = function failDomain(req, res, next) {
  if(tld.isValid(req.headers.host)) {
    var subdomain = tld.getSubdomain(req.headers.host).split('.')[0]; // split in case we're serving subdomain.local or subdomain.dev etc. pages
    if(subdomain !== '' && subdomain !== null && config.reservedsubdomains.indexOf(subdomain) === -1) {
      res.send(403, 'Forbidden');
    }
    else {
      return next();
    }
  }
  else {
    res.send(403, 'Forbidden');
  }
};

/**
 * Middleware to check the existence of bucketKey header for adding new buckets
 */
exports.checkBucketKey = function checkBucketKey(req, res, next) {
  if(req.header('bucketkey') !== config.bucketkey) {
    res.send(403, 'Forbidden');
  }
  else return next();
};

/**
 * Middleware to check for basic http auth against apiKey and apiSecret.
 */
exports.requireAuthorization = function requireAuthorization(req, res, next) {

  var assetRequest = new AssetRequest(req.url, req.headers, req.method, {
    domain: req.bucket.subdomain + '.' + config.domain,
    port: 5604, // this request doesn't care about the port number as it's just used to generate a header to compare with
    bucket: req.bucket.subdomain,
    apiKey: req.bucket.apiKey,
    apiSecret: req.bucket.apiSecret,
    expiryMinutes: 10,
    socketTimeout: 10000
  });

  if(req.header('Content-MD5')) assetRequest['Content-MD5'] = req.header('Content-MD5');
  if(req.header('Content-Length')) assetRequest['Content-Length'] = req.header('Content-Length');
  if(req.header('Content-Type')) assetRequest['Content-Type'] = req.header('Content-Type');

  assetRequest.constructAllHeaders(function() {
    if(assetRequest.headers.Authorization !== req.header('Authorization')) {
      res.send(403, 'Forbidden');      
    }
    else {
      return next();
    }
  });

};

exports.requireValidDate = function checkDate(req, res, next) {
  var expires = req.header('Date');
  var now = new Date();

  if(expires > now) {
    return next();
  }
  else {
    res.send(410, 'Request expired');
  }
};