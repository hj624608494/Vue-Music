// Vuex 入口
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// 修改state的时候会打印日志
import createLogger from 'vuex/dist/logger'

// 注册插件
Vue.use(Vuex)

// Vuex调试工具
const debug = process.env.NODE_ENV !== 'production'

// new一个Vuex的实例 把对应使用的是参数都传递进去
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug, // 调试模式
  plugins: debug ? [createLogger()] : [] // 修改state打印日志
})
