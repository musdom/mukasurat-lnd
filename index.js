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

const express = require('express');
const cors = require('cors');
const app = express();

meta.add('macaroon', adminMacaroon.toString('hex'));

app.use(cors());
app.use(express.static(`./web-ui/dist`));

app.get('/', (req,res) => {
  res.sendFile('index.html');
});

app.get('/v1/getinfo', (req,res) => {
  lightning.getInfo({}, meta, (err, response) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    // console.log('GetInfo:', response);
    console.log('\nGetInfo:');
    console.dir(response, {colors:true});
    res.json(response);
  });
});


lightning.channelBalance({}, meta, function(err, response) {
  if (err) console.log(err);
  const balanceSatoshi = Number(response.balance);
  const balanceBTC = balanceSatoshi / 100000000;
  console.log('\nChannel Balance:');
  console.log(`${balanceSatoshi} sat`);
  console.log(`${balanceBTC} BTC`);
});

lightning.walletBalance({}, meta, function(err, response) {
  if (err) console.log(err);
  console.log('\nWallet Balance:');
  const balanceSatoshi = Number(response.total_balance);
  const balanceBTC = balanceSatoshi / 100000000;
  console.log(`${balanceSatoshi} sat`);
  console.log(`${balanceBTC} BTC`);
});

const call = lightning.subscribeInvoices({}, meta);
call.on('data', function(invoice) {
    console.log(invoice);
})
.on('end', function() {
  // The server has finished sending
})
.on('status', function(status) {
  // Process status
  console.log("Current status" + status);
});

app.listen(3000, () => console.log('vue-lnd listening on port 3000!'));
