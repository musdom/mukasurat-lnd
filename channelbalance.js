const grpc = require('grpc');
const fs = require('fs');

const LND_HOMEDIR = `/home/${process.env.USER}/.lnd`;
const lndCert = fs.readFileSync(LND_HOMEDIR + '/tls.cert');
const adminMacaroon = fs.readFileSync(LND_HOMEDIR + '/admin.macaroon');
const meta = new grpc.Metadata();
const credentials = grpc.credentials.createSsl(lndCert);
const lnrpcDescriptor = grpc.load('rpc.proto');
const lnrpc = lnrpcDescriptor.lnrpc;
const lightning = new lnrpc.Lightning('localhost:10009', credentials);

meta.add('macaroon', adminMacaroon.toString('hex'));

lightning.channelBalance({}, meta, function(err, response) {
  if (err) console.log(err);
  console.log('ChannelBalance:');
  console.dir(response, {colors:true});
});
