// const grpc = require('grpc');
// const fs = require('fs');
//
// const LND_HOMEDIR = `/home/${process.env.USER}/.lnd`;
// const lndCert = fs.readFileSync(LND_HOMEDIR + '/tls.cert');
// const adminMacaroon = fs.readFileSync(LND_HOMEDIR + '/readonly.macaroon');
// const meta = new grpc.Metadata();
// const credentials = grpc.credentials.createSsl(lndCert);
// const lnrpcDescriptor = grpc.load('rpc.proto');
// const lnrpc = lnrpcDescriptor.lnrpc;
// const lightning = new lnrpc.Lightning('localhost:10009', credentials);
//
// meta.add('macaroon', adminMacaroon.toString('hex'));
//
// lightning.getInfo({}, meta, function(err, response) {
//   if (err) console.log(err);
//   // console.log('GetInfo:', response);
//   console.log('GetInfo:');
//   console.dir(response, {colors:true});
// });

var fs = require('fs');
var request = require('request');

var macaroon = fs.readFileSync(`./readonly.macaroon`).toString('hex');
var options = {
  url: 'https://cyberblox.zapto.org:8035/v1/getinfo',
  // Work-around for self-signed certificates.
  rejectUnauthorized: false,
  json: true,
  headers: {
    'Grpc-Metadata-macaroon': macaroon,
  },
};

console.log(macaroon);

request.get(options, function(error, response, body) {
  if (error) {
    console.log(error);
  }
  console.dir(body, {colors: true});
});
