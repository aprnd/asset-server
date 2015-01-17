var bcrypt = require('bcrypt');
var crypto = require('crypto');
var config = require('../modules/config');
var log = require('../modules/log');
var helpers = require('../modules/helpers');
var storage = require('../modules/storage');
var models = storage.models;
var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');

function slug(Text)
{
    if(Text) return Text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'');
    else return false;
}

function getBucketDirectoryName(bucket) {
  return config.storagelocation+bucket.subdomain+"/";
}

exports.bucket = {};

/**
 * POST a new object via a web form
 */
exports.post = function post(req, res) {
  res.end(); // nope
};

/**
 * GET an object
 */
exports.get = function get(req, res) {

  var requestFile = req.url.split('?versionId=')[0];
  var requestVersion = req.url.split('?versionId=')[1];

  var query = {
    path : requestFile,
    bucket: req.bucket._id
  };

  // If requesting a version (file.ext?version), add that to the query
  if(requestVersion) query.hash = requestVersion;

  // Find the blob and return the latest one with the requested path
  models.Blob.findOne(query, {}, { sort: { 'created' : -1 } }, function(err, blob) {
    if(!err && blob) {

      res.header('Content-Type', blob.contentType);
      res.header('Content-Length', blob.contentLength);
      res.header('Last-Modified', blob.created);

      // Create a read stream for the blob
      var file = fs.createReadStream(getBucketDirectoryName(req.bucket)+blob.fileName);

      // Set an etag for cache
      res.etag = blob.contentMd5;

      // Log the request
      log.info('GET', blob._id, requestFile, { ip: req.requestIp });

      // Pipe the file to the user
      file.pipe(res);

    }
    else if(!err && !blob) {
      res.send(404, 'Not Found');
    }
    else {
      log.error(err);
      res.send(500, err);
    }
  });

};

/**
 * PUT an object
 */
exports.put = function put(req, res) {

  var requestFile = req.url.split('?versionId=')[0];
  var requestVersion = req.url.split('?versionId=')[1];

  var requestPath = path.dirname(requestFile);
  var requestBasename = path.basename(requestFile);

  var contentType = req.header('Content-Type');
  var contentLength = req.header('Content-Length');
  var contentMd5 = req.header('Content-MD5');

  // We'll need Content-Type and Content-Length to be set
  if(contentType && contentLength) {

    var fileVersionHash = crypto.createHash('sha1').update(contentType + contentLength + contentMd5 + requestFile + Date.now()).digest("hex");
    var fileNameHash = crypto.createHash('sha1').update(req.subdomain + requestFile + contentType + contentLength).digest('hex');
    var fileName = uuid.v4()+'-'+fileNameHash;

    // If there's a request version (?ver), use that for the version hash.
    var hash = requestVersion ?
      requestVersion :
      crypto.createHash('md5').update(contentType + contentLength + contentMd5 + requestFile + Date.now()).digest("hex");

    var newBlob = new models.Blob({
      hash: hash,
      contentType: contentType,
      contentLength: contentLength,
      bucket: req.bucket._id,
      path: requestFile,
      sourceIp: req.requestIp,
      fileName: fileName
    });

    newBlob.save(function(err, blob) {
      if(!err && blob) {
        log.info('PUT', requestFile, blob.hash, req.requestIp);
        var file = fs.createWriteStream(getBucketDirectoryName(req.bucket)+fileName);
        req.on('end', function() {
          log.info('PUT', blob._id, requestFile, { ip: req.requestIp });
          res.writeHead(200, { 'x-amz-version-id': blob.hash });
          res.end();
        });
        req.pipe(file);
      }
      else {
        log.error(err, requestFile, { ip: req.requestIp });
        res.send(500, 'Saving failed. Error: '+err);
      }
    });

  }
  else {
    log.error('Content-Type and Content-Length headers are not set.');
    res.send(500, 'Content-Type and Content-Length headers are not set.');
  }

};

/**
 * DELETE an object
 */
exports.del = function del(req, res) {

  var requestFile = req.url.split('?versionId=')[0];
  var requestVersion = req.url.split('?versionId=')[1];

  var query = {
    path : requestFile,
    bucket: req.bucket._id
  };

  if(requestVersion) query.hash = requestVersion;

  models.Blob.find(query, function(err, blobs) {
    for(i=0;i<blobs.length;i++) {
      var fileName = getBucketDirectoryName(req.bucket)+blobs[i].fileName;
      log.log('Unlinking '+fileName);
      fs.unlink(fileName);
    }
  }).remove(function(err) {
    if(!err) {
      log.info('DEL', requestFile, requestVersion, { ip: req.requestIp });
      res.send(200);
    }
    else {
      log.error('DEL failed', requestFile, requestVersion, { ip: req.requestIp });
      res.send(500, 'Deleting failed. Error: '+err);
    }
  });

};

/**
 * Return metadata from a blob
 */
exports.head = function head(req, res) {

  var requestFile = req.url.split('?versionId=')[0];
  var requestVersion = req.url.split('?versionId=')[1];

  var query = {
    path : requestFile,
    bucket: req.bucket._id
  };

  if(requestVersion) query.hash = requestVersion;

  models.Blob.findOne(query, {}, { sort: { 'created' : -1 } }, function(err, blob) {
    if(!err && blob) {
      var headers = {
        'Content-Type': blob.contentType,
        'Content-Length': blob.contentLength
      };
      res.writeHead(200, headers);
      log.log('HEAD', requestFile, requestVersion, { ip: req.requestIp });
      res.end();
    }
    else if(!err && !blob) {
      res.send(404, 'Not Found');
    }
    else {
      res.send(500, err);
    }
  });

};

/**
 * Create a new bucket
 */
exports.bucket.post = function bucketPost (req, res) {

  var name = req.header('name');
  var subdomain = slug(req.header('subdomain'));

  if(name && subdomain && config.reservedsubdomains.indexOf(subdomain) === -1) {

    var hash = crypto.createHash('sha1').update(name + Date.now()).digest("hex");
    var apiKey = crypto.createHash('sha1').update(name + hash + Date.now()).digest("hex");
    var apiSecret = crypto.createHash('sha1').update(name + hash + apiKey + Date.now()).digest("hex");

    var newBucket = new models.Bucket({
      hash: hash,
      subdomain: subdomain,
      name: name,
      apiKey: apiKey,
      apiSecret: apiSecret
    });

    newBucket.save(function(err, bucket) {

      if(!err) {

        var ret = {
          subdomain: bucket.subdomain,
          name: bucket.name,
          apiKey: bucket.apiKey,
          apiSecret: apiSecret
        };

        fs.mkdir(getBucketDirectoryName(bucket), function() {
          log.info('POST /bucket - Created new bucket '+bucket.subdomain, { ip: req.requestIp });
          res.send(200, ret);
        });

      }
      else {
        res.send(500, err);
      }

    });

  }
  else {
    var msg;
    if(config.reservedsubdomains.indexOf(subdomain) > -1) msg = "Subdomain name is reserved, try another";
    else msg = "Missing bucket name or subdomain";
    res.send(500, msg);
  }

};

