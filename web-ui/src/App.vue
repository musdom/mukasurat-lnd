<template>
  <div id="app">
    <el-header>
      <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="1">Lightning Network Node [TESTNET]</el-menu-item>
        <!-- <el-submenu index="2">
          <template slot="title">Workspace</template>
          <el-menu-item index="2-1">item one</el-menu-item>
          <el-menu-item index="2-2">item two</el-menu-item>
          <el-menu-item index="2-3">item three</el-menu-item>
        </el-submenu>
        <el-menu-item index="3"><a href="https://www.ele.me" target="_blank">Orders</a></el-menu-item> -->
      </el-menu>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'App',
  sockets: {
    connect: () => {
      // console.log('socket connected');
    },
    // customEmit: (val) => {
    //   console.log('Server onConnect: ' + val);
    // },
  },
};
</script>

<style>
body {
  background-color: #280d3e;
  font-family: Arial;
  margin: 0;
}
.el-header {
  padding: 0;
}
.el-main {
  padding: 0;
}
</style>
