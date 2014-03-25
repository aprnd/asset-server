## Asset-Server: Lightweight, Amazon S3-like, RESTful asset server for networked applications.

Asset-Server was built as an image host for a project that needed a S3-like, quick and reliable public file host that could be rolled into a package to be hosted onsite in some use cases, and being replaced by Amazon S3 in others. Obviously you can store any sort of files in it. AS is meant to act as a public-facing server that you can store both static (like website, marketing, e-mail and other assets that might get updated but need the same URL) and user-generated/uploaded content in. Runs with the help of Node.JS, Restify and MongoDB.

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

### Steps

- Clone from source.
- Run `npm install`.
- Decide on an environment name in the environment variable `AssetServerEnv`. IF you're running a local instance, `local` is a good bet.
- Copy config.local.json.example to config.yourenv.json.
- Change the bucket creation key (`bucketkey`, line 14). This is used to create new buckets to upload to.
- If you wish, change `storagelocation`, line 19. This is the directory files are stored in.
- Run app.js to start the server.

### Testing

#### asset-server-client
Link: https://github.com/aprnd/asset-server-client

Node.js client module to interact with a bucket. Includes test command-line scripts.

#### asset-server-desktop
Link: https://github.com/aprnd/asset-server-desktop

Alpha desktop client to upload files to an asset-server instance. Built on top of node-webkit.

![alt text](http://tester.asset-server.com/asset-server-desktop-a.png  "Screenshot")

## Credits

Juho Hietala


Applied Research & Development

E-mail: juho.hietala@aprnd.com
Twitter: http://www.twitter.com/appliedrnd
