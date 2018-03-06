import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '@/components/recommend/recommend' // 推荐页面
import Singer from '@/components/singer/singer' // 歌手页面
import Rank from '@/components/rank/rank' // 排行榜页面
import Search from '@/components/search/search' // 搜索页面
import SingerDetail from '@/components/singer-detail/singer-detail' // 歌手详情页
import Disc from '@/components/disc/disc' // 推荐详情页
import RankList from '@/components/rank-list/rank-list' // 排行榜列表页面
import UserCenter from '@/components/user-center/user-center' //

Vue.use(Router) // 注册组件

export default new Router({
  /*
  * 配置路由规则
  * path => 路由地址
  * name => 路由名字
  * component => 路由绑定组件
  */
  routes: [
    {
      path: '/',
      redirect: '/recommend' // 指定跳转路由
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          name: 'disc',
          component: Disc
        }
      ]
    },
    {
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [ // 配置子路由需要利用children children是一个数组对象
        {
          path: ':id',
          name: 'SingerDetail',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      name: 'Rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: RankList
        }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      name: 'User',
      component: UserCenter
    }
  ]
})
