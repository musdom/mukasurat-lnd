# Mukasurat LND
This repository is made up of:
1. NodeJS script that connects to lnd's gRPC methods.
2. A simple VueJS webapp, located in the web-ui directory.

## Setting up
1. [`lnd`](https://github.com/lightningnetwork/lnd) needs to be installed and running. Guide: https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md
2. Clone this repository
3. server.js is configured to look for **tls.cert** and **admin.macaroon** in the default lnd directory for Linux. If necessary, change LND_HOMEDIR to your lnd directory.
4. You may need to update **rpc.proto** as per https://github.com/lightningnetwork/lnd/blob/master/docs/grpc/javascript.md#setup-and-installation

``` bash
# install dependencies
npm install

# start server.js
npm start
```
## VueJS web application
Navigate to the web-ui directory, then
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# server.js will serve the dist folder at localhost:3000
npm run build
```
