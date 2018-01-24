<template>
  <div class="hello">
    <el-row type="flex" class="row-bg" justify="center">
      <el-col
        v-if="nodeInfo.d"
        :sm="16"
        :lg="8">
        <div class="grid-content bg-purple-light">
          <h2>Balance</h2>
          <h3>Wallet: {{ balance.wallet }} BTC</h3>
          <h3>Channel: {{ balance.channels }} satoshis</h3>
          <el-button v-on:click="getChannelBalance">Refresh</el-button>
        </div>
        <div class="grid-content bg-purple">
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
        <div class="grid-content bg-purple-dark">
          <h3>Create Invoice</h3>
          <el-form :inline="true">
            <el-form-item label="Amount (satoshi)">
              <el-input-number
                v-model="amountToInvoice.value"
                :min="1"
                :max="100000000">
              </el-input-number>
            </el-form-item>
            <el-form-item>
              <el-button @click="createInvoice">Submit</el-button>
            </el-form-item>
          </el-form>
          <el-form v-if="amountToInvoice.paymentRequest">
            <el-form-item label="Invoice">
              <el-input :value="amountToInvoice.paymentRequest" readonly></el-input>
            </el-form-item>
          </el-form>
          <h3>Pay Invoice</h3>
          <el-form ref="form">
            <el-form-item label="Invoice">
              <el-input
                v-model="invoice"
                @input="payInvoice">
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col
        v-if="channels"
        :sm="8"
        :lg="12">
        <div class="grid-content bg-purple-dark">
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  data() {
    return {
      nodeInfo: {
        d: null,
      },
      balance: {
        wallet: null,
        channels: null,
      },
      channels: null,
      invoice: null,
      amountToInvoice: {
        value: Math.floor(Math.random() * 99) + 100,
        memo: null,
        expiry: 3600,
        paymentRequest: null,
      },
    };
  },
  methods: {
    getChannelBalance() {
      axios.get('http://hyve.ddns.net:3000/v1/balance/channels')
        .then((response) => {
          // JSON responses are automatically parsed.
          this.balance.channels = response.data;
        })
        .catch((e) => {
          this.$notify.error({
            title: 'Error',
            message: `getChannelBalance: ${e}`,
          });
        });
    },
    getWalletBalance() {
      axios.get('http://hyve.ddns.net:3000/v1/balance/blockchain')
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
      axios.get('http://hyve.ddns.net:3000/v1/channels')
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
      this.$socket.emit('invoice-incoming', this.amountToInvoice.value);
      this.amountToInvoice.value = Math.floor(Math.random() * 99) + 100;
    },
    payInvoice() {
      this.$socket.emit('invoice-outgoing', this.invoice);
    },
    // tableRowClassName({ row, rowIndex }) {
    //   console.log(row.active);
    //   console.log(rowIndex);
    //   if (rowIndex === 1) {
    //     return 'success-row';
    //   } else if (rowIndex === 3) {
    //     return 'warning-row';
    //   }
    //   return '';
    // },
  },
  created() {
    // socket listener
    this.$options.sockets['invoice-incoming-prepared'] = (data) => {
      this.amountToInvoice.paymentRequest = data;
    };
    this.$options.sockets['channel-balance'] = (data) => {
      this.balance.channels = data;
    };
    axios.get('http://hyve.ddns.net:3000/v1/getinfo')
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
    this.getWalletBalance();
    this.getChannelBalance();
    this.getChannels();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
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
</style>
