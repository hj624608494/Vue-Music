<template>
  <!-- 搜索列表展示 -->
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll"
          @scrollToEnd="searchMore"
          ref="suggest"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import Scroll from '@/base/scroll/scroll' // 滚动组件
import Loading from '@/base/loading/loading' // 加载组件
import Singer from '@/common/js/singer' // 歌手结构
import NoResult from '@/base/no-result/no-result' // 没有数据时展示
import { Search } from '@/api/search' // 搜索结果
import { ERR_OK } from '@/api/config'
import { createSong, getSongUrl } from '@/common/js/song' // 歌手数据分隔
import { mapMutations, mapActions } from 'vuex';

const TYPE_SINGER = 'singer' // 常量
const PERPAGE = 20 // 搜索歌词的数量

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1, // 当前页数
      result: [],
      pullup: true, // 开启上拉刷新
      hasMore: false, // 判断是否还有更多的数据
      beforeScroll: true // 滚动前事件
    }
  },
  methods: {
    // 数据加载使用
    selectItem (item) {
      // 判断是否歌手格式
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        // 路由跳转
        this.$router.push({
          path: `/search/${singer.id}`
        })
        // 对vuex进行修改
        this.setSinger(singer)
      } else {
        // 如果是歌曲就直接处理歌曲数据
        this.insertSong(item)
      }
      // 派发一个事件去外部 由外部来执行搜索历史处理
      this.$emit('selectSearch')
    },
    // 重置滚动组件的高度
    refresh () {
      this.$refs.suggest.refresh()
    },
    // 上拉加载更多
    searchMore () {
      // 数据已经到底了
      if (!this.hasMore) {
        return
      }
      this.page++ // 页数+1
      // 重新请求接口
      Search(this.query, this.page, this.showSinger, PERPAGE).then((res) => {
        if (res.code === ERR_OK) {
          // 对数组进行拼接 不能直接更改result
          this.result = this.result.concat(this._getResult(res.data))
          // 检测数据已经到底
          this._checkMore(res.data)
        }
      })
    },
    // 根据数据类型变化图标
    getIconCls (item) {
      // 判断是否为歌手数据
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    // 根据数据类型变化名字
    getDisplayName (item) {
      // 判断是否为歌手数据
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        // 处理多个歌手的情况
        return `${item.name} - ${item.singer}`
      }
    },
    // 关键词搜索
    _search () {
      this.page = 1 // 重置页码
      this.$refs.suggest.scrollTo(0, 0) // 把滚动组件重新滚动到顶部
      this.hasMore = true // 开启更多
      Search(this.query, this.page, this.showSinger, PERPAGE).then(res => {
        if (res.code === ERR_OK) {
          this.result = this._getResult(res.data)
          // 检测数据已经到底
          this._checkMore(res.data)
        }
      })
    },
    // 检测数据是否到底
    _checkMore (data) {
      const song = data.song
      // 判断是否有歌曲 以及当前歌曲数量 + 歌曲页数 * PERPAGE > 歌曲的总数
      if (!song.list.length || (song.curnum + song.curpage * PERPAGE) >= song.totalnum) {
        this.hasMore = false
      }
    },
    // 处理搜索返回的歌曲以及歌手信息
    _getResult (data) {
      let ret = []
      // 判断是否有直达以及直达内是否有歌手
      if (data.zhida && data.zhida.singerid) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      // 判断是否有歌曲
      if (data.song) {
        // 把数据片接到原本数据的后面
        ret = ret.concat(this._normalizeSong(data.song.list))
      }
      return ret
    },
    // 数据格式处理
    _normalizeSong (list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songmid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      // 循环添加歌曲地址
      ret.forEach(item => {
        ret.url = getSongUrl(item, item.mid)
      })
      // 返回值
      return ret
    },
    // 滚动前处理
    listScroll () {
      this.$emit('listScroll')
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    // 监听搜索词汇是否变化
    query () {
      this._search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
