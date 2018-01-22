<template>
  <div class="hello">
    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="10">
        <div class="grid-content bg-purple-light">
          <el-form ref="form" label-width="120px">
            <el-form-item v-for="(value, key) in nodeInfo" :label="key" v-bind:key="key">
              <el-input :value="value.toString()" readonly></el-input>
            </el-form-item>
          </el-form>
          <!-- DEBUG -->
          <!-- <pre>{{ nodeInfo }}</pre> -->
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
      nodeInfo: {},
      tableData: [
        {
          date: '2016-05-03',
          name: 'Tom',
          address: 'No. 189, Grove St, Los Angeles',
        },
      ],
    };
  },
  created() {
    axios.get('http://hyve.ddns.net:3000/v1/getinfo')
      .then((response) => {
        // JSON responses are automatically parsed.
        this.nodeInfo = response.data;
      })
      .catch((e) => {
        this.nodeInfo = e;
      });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bg-purple-light {
  /* background: #e5e9f2; */
}
.grid-content {
  /* border-radius: 4px; */
  /* min-height: 36px; */
}
.row-bg {
  padding: 1em;
  /* background-color: #f9fafc; */
}
</style>
