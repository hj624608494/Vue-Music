<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!-- 搜索的结构 -->
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange"></search-box>
      </div>
      <!-- 搜索历史 -->
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <!-- 播放历史 -->
          <scroll :refreshDelay="refreshDelay" ref="songList" class="list-scroll" v-if="currentIndex === 0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <!-- 搜索历史 -->
          <scroll :refreshDelay="refreshDelay" ref="searchList" class="list-scroll" v-if="currentIndex === 1" :data="searchHistory">
            <div class="list-inner">
              <search-list @deleteItem="deleteSearchHistory" @selectItem="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <!-- 搜索结果 -->
      <div class="search-result" v-show="query">
        <suggest :query="query"
                 :showSinger="showSinger"
                 @selectSearch="selectSuggest"
                 @listScroll="blurInput"
        ></suggest>
      </div>
      <!-- 提示框 -->
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import SearchBox from '@/base/search-box/search-box' // 搜索框
import SearchList from '@/base/search-list/search-list' // 搜索列表
import Suggest from '@/components/suggest/suggest' // 搜索列表
import Switches from '@/base/switches/switches' // 选项按钮
import SongList from '@/base/song-list/song-list' // 歌曲结构组件
import Scroll from '@/base/scroll/scroll' // 滚动组件
import TopTip from '@/base/top-tip/top-tip' // 头部提示
import {searchMixin} from '@/common/js/mixin' // 搜索公用函数
import { mapGetters, mapActions } from 'vuex';
import Song from '@/common/js/song'
export default {
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false,
      showSinger: false, // 是否搜索歌手
      currentIndex: 0, // 默认选中下标
      switches: [ // 按钮文字
        {name: '最近播放'},
        {name: '搜索历史'}
      ]
    }
  },
  methods: {
    // 展开
    show () {
      this.showFlag = true
      // 展示时重置滚动组件的高度
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    // 关闭
    hide () {
      this.showFlag = false
    },
    // 搜索文本
    search (query) {
      this.query = query
    },
    // 记录搜索结果
    selectSuggest () {
      this.saveSearch()
      this.showTopTip() // 调用弹框事件
    },
    // 切换按钮组件的样式
    switchItem (index) {
      this.currentIndex = index
    },
    // 把缓存歌曲添加到歌曲列表中
    selectSong (song, index) {
      // 过滤当前播放的歌曲 也就是第一个
      if (index !== 0) {
        let songs = new Song(song) // 把缓存的内容重新用News实例化
        this.insertSong(songs) // 把歌曲插入到播放列表中
        this.showTopTip() // 调用弹框事件
      }
    },
    // 展开弹框
    showTopTip () {
      this.$refs.topTip.show()
    },
    ...mapActions([
      'insertSong'
    ])
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
