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
          <el-form ref="form" label-width="120px" size="mini">
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
          <!-- DEBUG -->
          <!-- <pre>{{ channelBalance }}</pre> -->
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
      tableData: [
        {
          date: '2016-05-03',
          name: 'Tom',
          address: 'No. 189, Grove St, Los Angeles',
        },
      ],
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
  },
  created() {
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
</style>
