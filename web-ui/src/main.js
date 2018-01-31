// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import ElementUI from 'element-ui';
import VueSocketio from 'vue-socket.io';
import VueQriously from 'vue-qriously';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueSocketio, `http://${window.location.hostname}:3000`);
Vue.use(VueQriously);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
