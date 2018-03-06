<template>
  <div class="singer" ref="singer">
    <!-- @select 监听派发事件 -->
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <!-- 子路由 -->
    <router-view></router-view>
  </div>
</template>

<script>
// 导入歌手接口
import { getSingerList } from '@/api/singer'
// 列表结构体
import ListView from '@/base/listview/listview'
// 基类数据
import Singer from '@/common/js/singer'
import { ERR_OK } from '@/api/config'
// 调用Vuex的方法 用于修改store的值
import {mapMutations} from 'vuex'
import {playlistMixin} from '@/common/js/mixin' // 调用混入方法

const HOT_NAME = '热门';
const HOT_SINGER_NUM = 10; // 前10条热门数据

export default {
  mixins: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingerList();
  },
  methods: {
    // 修改被mini播放器的占用的高度位置重置滚动列表的bottom值
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom // 重新设置距离mini高度的bottom边距
      this.$refs.list.resetScroll() // 调用list组件重置scroll高度的方法
    },
    // 歌手详情页
    selectSinger (singer) {
      // 调用路由事件进行跳转
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // 调用方法进行修改Vuex
      this.setSinger(singer)
    },
    _getSingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
        }
      })
    },
    // 处理数据 将数据进行分类
    _normalizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };
      // 对数据进行循环
      list.forEach((item, index) => {
        if (index < HOT_SINGER_NUM) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          })); // 往热门的items数据进行添加前10条
        }
        const key = item.Findex; // 获取关键字眼
        // 判断是否存在key
        if (!map[key]) {
          // 创建关键字结构
          map[key] = {
            title: key,
            items: []
          }
        }
        // 根据对应key的歌手进行追加
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      });
      // 为了得到有序列表，需要处理map
      let hot = []; // 热门数组
      let ret = []; // 歌曲人员
      // 遍历map
      for (let key in map) {
        let val = map[key];
        // 利用正则获取到title是否等于英文单词索引
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        // 如果获取到时热门
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 对ret进行排序
      ret.sort((a, b) => {
        // charCodeAt 对字符进行Unicode 与chatAt相比 前者只返回指定下标的字符串 后者返回整个字符串
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      });
      // 数组拼接
      return hot.concat(ret)
    },
    // 使用拓展运算符来映射和修改Vuex中Store的值 映射后可以在函数里 利用this.setSinger进行修改数据
    ...mapMutations({
      // setSinger 对应的是mutations-types中的常量进行绑定
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>


<style lang="stylus" scoped>
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>

