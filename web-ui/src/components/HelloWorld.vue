<template>
  <div class="hello">
    <el-row type="flex" class="row-bg" justify="left">
      <el-col :span="10">
        <div class="grid-content bg-purple-light">
          <!-- <p>{{ msg }}</p> -->
          <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
              prop="date"
              label="Date"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="Name"
              width="120">
            </el-table-column>
            <el-table-column
              prop="address"
              label="Address">
            </el-table-column>
          </el-table>

          <textarea v-model="nodeInfo">
          </textarea>
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
      nodeInfo: 'fgsfds',
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
        this.nodeInfo = response;
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
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px;
  background-color: #f9fafc;
}
</style>
