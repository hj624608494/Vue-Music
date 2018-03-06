import 'babel-polyfill'; // 对es6进行补丁修复
import fastclick from 'fastclick'; // 对点击300毫秒延迟进行修复
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueLazyLoad from 'vue-lazyload'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './common/stylus/index.styl'

// 使用ElementUI
Vue.use(ElementUI)
// 使用LazyLoad
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})

// 推荐绑定到body
fastclick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
