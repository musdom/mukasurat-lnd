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
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

meta.add('macaroon', adminMacaroon.toString('hex'));

app.use(cors());
app.use(express.static(`./web-ui/dist`));

let nodeObj = {
  getInfo: {},
  balance: {
    wallet: null,
    channels: null,
  },
  channels: null,
};

app.get('/', (req,res) => {
  res.sendFile('index.html');
});

app.get('/v1/getinfo', (req,res) => {
  lightning.getInfo({}, meta, (err, response) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    const timeStamp = Date.now();
    let d = new Date(timeStamp);
    console.log(`\n${d.toLocaleString()} - GetInfo:`);
    console.dir(response, {colors:true});
    let resObj = response;
    resObj.time = timeStamp;
    res.json(resObj);
  });
  // res.json(nodeObj.getInfo);
});

app.get('/v1/balance/blockchain', (req,res) => {
  lightning.walletBalance({}, meta, function(err, response) {
    if (err) console.log(err);
    console.log('\nWallet Balance:');
    const balanceSatoshi = Number(response.total_balance);
    const balanceBTC = balanceSatoshi / 100000000;
    console.log(`${balanceSatoshi} sat`);
    console.log(`${balanceBTC} BTC`);
    nodeObj.balance.wallet = balanceBTC;
    res.json(balanceBTC);
  });
});

app.get('/v1/channels', (req,res) => {
  lightning.listChannels({}, meta, function(err, response) {
    // console.log('Channels: ');
    // console.dir(response, {colors:true});
    nodeObj.channels = response;
    res.json(response);
  });
});

io.on('connection', function (socket) {
  console.log('Client connected');
  io.emit('customEmit', 'halo');

  getChannelBalance((balance) => {
    const emitObj = {
      balance: balance,
      fulfilment: false
    }
    socket.emit('channel-balance', emitObj);
  });

  socket.on('invoice-incoming', function (amount) {
    console.log(amount);
    lightning.addInvoice({
      memo: 'nodejs',
      value: amount,
      expiry: 3600
    }, meta, function(err, response) {
      if (err) console.log(err);
      console.log('AddInvoice: ' + response.payment_request);
      socket.emit('invoice-incoming-prepared', response.payment_request);
    });
  });

  socket.on('invoice-outgoing', function (invoice) {
    console.log(invoice);
  });

  // socket.on('disconnect', function () {
  // });
});

// query lnd only every 5 minutes
// setInterval(() => {
//   lightning.getInfo({}, meta, (err, response) => {
//     if (err) {
//       console.log(err);
//       nodeObj.getInfo = err;
//     }
//     const timeStamp = Date.now();
//     let d = new Date(timeStamp);
//     console.log(`\n${d.toLocaleString()} - GetInfo:`);
//     console.dir(response, {colors:true});
//     nodeObj.getInfo = response;
//     nodeObj.getInfo.time = timeStamp;
//   });
// }, 30000);

function getChannelBalance(cb) {
  lightning.channelBalance({}, meta, function(err, response) {
    if (err) console.log(err);
    const balanceSatoshi = Number(response.balance);
    const balanceBTC = balanceSatoshi / 100000000;
    console.log('\nChannel Balance:');
    console.log(`${balanceSatoshi} sat`);
    console.log(`${balanceBTC} BTC`);
    nodeObj.balance.channels = balanceSatoshi;
    cb(balanceSatoshi);
  });
}

const call = lightning.subscribeInvoices({}, meta);
call.on('data', function(invoice) {
  console.log(invoice);
  const emitObj = {
    balance: nodeObj.balance.channels,
    fulfilment: {
      value: invoice.value,
    }
  };
  io.emit('channel-balance', emitObj);
  setTimeout(() => {
    getChannelBalance((balance) => {
      const emitObj = {
        balance: balance,
        fulfilment: false
      };
      io.emit('channel-balance', emitObj);
    });
  }, 500);
})
.on('end', function() {
  // The server has finished sending
})
.on('status', function(status) {
  // Process status
  console.log("Current status" + status);
});

server.listen(3000, () => console.log('vue-lnd listening on port 3000!'));
