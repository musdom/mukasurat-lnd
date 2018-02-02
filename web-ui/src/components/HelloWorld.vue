<template>
  <div class="hello">
    <el-row type="flex" class="row-bg" justify="center">
      <el-col
        v-if="nodeInfo.d"
        :sm="16"
        :lg="8">
        <div class="grid-content bg-content">
          <h2>Balance</h2>
          <h3>Wallet: {{ balance.wallet }} BTC</h3>
          <h3>Channel: {{ balance.channels }} satoshis</h3>
        </div>
        <div class="grid-content bg-content">
          <p>{{ nodeInfo.d.toLocaleString() }}</p>
          <!-- <el-form ref="form" label-width="180px" size="mini">
            <el-form-item v-for="(value, key) in nodeInfo" :label="key" v-bind:key="key">
              <el-input :value="value.toString()" readonly></el-input>
            </el-form-item>
          </el-form> -->
          <el-form label-width="120px" size="mini">
            <el-form-item label="uri">
              <el-input :value="nodeInfo.uris.toString()" readonly></el-input>
            </el-form-item>
            <el-form-item label="pubkey">
              <el-input :value="nodeInfo.identity_pubkey.toString()" readonly></el-input>
            </el-form-item>
            <el-form-item label="active channels">
              <el-input :value="nodeInfo.num_active_channels" readonly></el-input>
            </el-form-item>
            <el-form-item label="peers">
              <el-input :value="nodeInfo.num_peers" readonly></el-input>
            </el-form-item>
            <el-form-item label="blk height">
              <el-input :value="nodeInfo.block_height" readonly></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="grid-content bg-content">
          <h3>Create Invoice</h3>
          <el-form :inline="true">
            <el-form-item label="Amount (satoshi)">
              <el-input-number
                v-model="incomingInvoice.nextValue"
                :min="1"
                :max="100000000">
              </el-input-number>
            </el-form-item>
            <el-form-item>
              <el-button @click="createInvoice">Submit</el-button>
            </el-form-item>
          </el-form>
          <el-form v-if="incomingInvoice.paymentRequest" :inline="true">
            <el-form-item label="Invoice">
              <el-input :value="incomingInvoice.paymentRequest" readonly>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                icon="el-icon-mobile-phone"
                @click="dialogQRVisible = true">
                QR
              </el-button>
            </el-form-item>
          </el-form>
          <!-- <h3>Pay Invoice</h3>
          <el-form ref="form">
            <el-form-item label="Invoice">
              <el-input
                v-model="invoice"
                @input="payInvoice">
              </el-input>
            </el-form-item>
          </el-form> -->
        </div>
      </el-col>
      <el-col
        v-if="channels"
        :sm="8"
        :lg="12">
        <div class="grid-content bg-content">
          <el-table
            :data="channels"
            style="width: 100%"
            stripe
            border>
            <el-table-column
              prop="remote_pubkey"
              label="Remote pubkey">
            </el-table-column>
            <el-table-column
              prop="channel_point"
              label="Chan pt">
            </el-table-column>
            <el-table-column
              prop="active"
              label="Active"
              width="120"
              align="center">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.active === true ? 'success' : 'danger'"
                  close-transition>{{scope.row.active.toString()}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="capacity"
              label="Capacity"
              width="120">
            </el-table-column>
            <el-table-column
              prop="local_balance"
              label="Local"
              width="120">
            </el-table-column>
            <el-table-column
              prop="num_updates"
              label="Updates"
              width="120">
            </el-table-column>
          </el-table>
          <!-- DEBUG -->
          <!-- <pre>{{ channels }}</pre> -->
        </div>
      </el-col>
    </el-row>
    <el-dialog title="Invoice" :visible.sync="dialogQRVisible">
      <el-row type="flex" justify="center">
        <el-col align="center">
          <qriously
            background="white"
            v-bind:value="incomingInvoice.paymentRequest"
            v-bind:size="320" />
          <p>Payment: {{ incomingInvoice.currentValue }} satoshis</p>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog title="Payment received!" :visible.sync="dialogTxVisible">
      <el-row type="flex" justify="center">
        <el-col align="center">
          <i class="el-icon-success tx-receipt"></i>
          <!-- <el-button type="success" icon="el-icon-check" round></el-button> -->
          <h1>{{ lastPayment.value }} satoshis received</h1>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  data() {
    return {
      host: `http://${window.location.hostname}:3000`,
      nodeInfo: {
        d: null,
      },
      balance: {
        wallet: null,
        channels: null,
      },
      channels: null,
      invoice: null,
      incomingInvoice: {
        nextValue: Math.floor(Math.random() * 99) + 100,
        currentValue: 0,
        memo: null,
        expiry: 3600,
        paymentRequest: null,
      },
      dialogQRVisible: false,
      dialogTxVisible: false,
      lastPayment: {
        value: null,
      },
    };
  },
  methods: {
    getInfo() {
      axios.get(`${this.host}/v1/getinfo`)
        .then((response) => {
          // JSON responses are automatically parsed.
          this.nodeInfo = response.data;
          this.nodeInfo.d = new Date(Number(response.data.time));
        })
        .catch((e) => {
          this.$notify.error({
            title: 'Error',
            message: `getInfo: ${e}`,
          });
        });
    },
    getWalletBalance() {
      axios.get(`${this.host}/v1/balance/blockchain`)
        .then((response) => {
          // JSON responses are automatically parsed.
          this.balance.wallet = response.data;
        })
        .catch((e) => {
          this.$notify.error({
            title: 'Error',
            message: `getWalletBalance: ${e}`,
          });
        });
    },
    getChannels() {
      axios.get(`${this.host}/v1/channels`)
        .then((response) => {
          // JSON responses are automatically parsed.
          this.channels = response.data.channels;
        })
        .catch((e) => {
          this.$notify.error({
            title: 'Error',
            message: `getChannels: ${e}`,
          });
        });
    },
    createInvoice() {
      this.$socket.emit('invoice-incoming', this.incomingInvoice.nextValue);
    },
    payInvoice() {
      this.$socket.emit('invoice-outgoing', this.invoice);
    },
  },
  created() {
    // initialize currentValue
    this.incomingInvoice.currentValue = this.incomingInvoice.nextValue;
    // socket listener
    this.$options.sockets['invoice-incoming-prepared'] = (data) => {
      this.incomingInvoice.paymentRequest = data;
      this.incomingInvoice.currentValue = this.incomingInvoice.nextValue;
      this.incomingInvoice.nextValue = Math.floor(Math.random() * 99) + 100;
    };
    this.$options.sockets['channel-balance'] = (data) => {
      this.balance.channels = data.balance;
      // hide QR dialog if still opened
      this.dialogQRVisible = false;
      if (data.fulfilment) {
        this.incomingInvoice.paymentRequest = '';
        this.lastPayment.value = data.fulfilment.value;
        this.dialogTxVisible = true;
        // this.$notify({
        //   title: 'Payment received!',
        //   message: `${data.fulfilment.value} satoshis received`,
        //   type: 'success',
        // });
      }
    };
    this.getInfo();
    this.getWalletBalance();
    this.getChannels();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .bg-content {
    background: #5ccbff;
  }
  /* .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  } */
  .grid-content {
    border-radius: 4px;
    padding: 1em;
    margin: 1em;
  }
  .el-col {
    border-radius: 4px;
  }
  .row-bg {
    padding: 1em;
    /* background-color: #f9fafc; */
  }
  .el-table .warning-row {
    background: oldlace;
  }
  .el-table .success-row {
    background: #f0f9eb;
  }
  .tx-receipt {
    font-size: 10em;
    color: green;
  }
</style>
