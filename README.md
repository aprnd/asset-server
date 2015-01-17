## Asset-Server: Lightweight, Amazon S3-like, RESTful asset server for networked applications.

Asset-Server was built as an image host for a project that needed a S3-like, quick and reliable public file host that could be rolled into a package to be hosted onsite in some use cases, and being replaced by Amazon S3 in others. Obviously you can store any sort of files in it. AS is meant to act as a public-facing server that you can store both static (like website, marketing, e-mail and other assets that might get updated but need the same URL) and user-generated/uploaded content in. Runs with the help of Node.JS, Restify and MongoDB.

Tested with OSX 10.9.2 and Debian GNU/Linux.

### Changes

- 0.1.59 (Jan 17 2015):
```
  - Etag support
```

### Download

Clone source to download.

### Requirements

- Node.JS >= 0.10.21
- MongoDB

### Features:

- RESTful interface for direct blob management (GET/PUT/HEAD/DELETE /folder/file.ext)
- Subdomain buckets, ie. bucketname.asset-server.com.
- Metadata stored in MongoDB.
- Content transfer verification via MD5 hashes.
- SSL support.
- Automatic file versioning; just rewrite a file and the old one is archived.
- API access and secret keys for verification in S3-like fashion.
- Files are streamed direct to disk instead of being buffered in memory.

### Asset-Server does not support:

- File processing like image cropping, resizing, etc. Do that before uploading.
- Fetching file ranges. It is not meant as a streaming media repository.
- ACL (Access Control Lists). It is meant as a public-facing server and private files are not supported.

### Asset-Server will, in the future..

- Have a more thorough bucket API, so you can manage your bucket through REST.
- Support more metadata storage options than MongoDB; namely Redis.

## Installing

- Clone from source or install through npm.
- Run `npm install`.
- Decide on an environment name in the environment variable `AssetServerEnv`. If you're running a local instance, `local` is a good bet.

#### Configuration

- Copy config.local.json.example to config.yourenv.json.
- Change the hostname (`domain`, line 8). `*.local.asset-server.com` always points to 127.0.0.1 from DNS, so you can use that for local testing.
- Change the bucket creation key (`bucketkey`, line 14). This is used to create new buckets to upload to.
- If you wish, change `storagelocation`, line 19. This is the directory files are stored in. Make sure the directory exists and is writable by the user running the server.

#### Running

Run app.js to start the server. If you want to set the environment name on the fly, you can run `AssetServerEnv=yourenv node app.js`.

### Create a bucket

To create a bucket, send a POST request to /bucket with the following headers:

```
"name": "Your Bucket's Name",
"subdomain": "subdomain",
"bucketkey": "yourbucketkey"
```

The response body should contain JSON with your API key and secret that you can use to access the bucket.

### Testing with client module & app

#### asset-server-client
Link: https://github.com/aprnd/asset-server-client

Node.js client module to interact with a bucket. Includes test command-line scripts.

#### asset-server-desktop
Link: https://github.com/aprnd/asset-server-desktop

Alpha desktop client to upload files to an asset-server instance. Built on top of node-webkit.

![alt text](http://tester.asset-server.com/asset-server-desktop-a.png  "Screenshot")

## Credits and contributions

Contributions are welcome! Please note that the point is to keep the server lean and light, so besides the features listed above, there should be a very good reason to have the server do something else.

#### Juho Hietala
Applied Research & Development

E-mail: juho.hietala@aprnd.com
Twitter: http://www.twitter.com/appliedrnd
