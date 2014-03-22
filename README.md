# Asset-server

A simple S3-like asset server that supports buckets via subdomains, GET/PUT/HEAD/DEL requests, storing files in the local filesystem. For ease and clarity of code, it does not support fetching ranges from files, just the entire contents. It does support versioning files (http://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html). Asset-server was built as an image host for a project that needed a S3-like, quick host that could be rolled into a package to be hosted onsite, but obviously you can store any sort of files in it.

## Requirements

- Node.JS >= 0.10.21
- MongoDB

## Installing

1. Run "npm install"
2. Copy config.dev.json.example into config.yourenv.json and edit it to suit your setup. *.local.asset-server.com/net always points to 127.0.0.1 so you can use that for testing. 
3. Run "AssetServerEnv=yourenv node app.js" (AssetServerEnv defaults to local)

## Usage

You can use S3-like requests to PUT objects through asset-server into mongodb. Files are stored on the filesystem in a folder specified in your config file. Authorization strings are constructed like S3 requests, but this server has not been tested with third-party library like Knox. You can use asset-server-client (https://github.com/aprnd/asset-server-client or npm install asset-server-client) as a client module in your project. It includes working examples of how to use the module.

### Supported headers:

- Date
- Content-MD5
- Content-Length
- Content-Type