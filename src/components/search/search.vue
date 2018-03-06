<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" class="shortcut" ref="shortcut" :data="shortcut">
        <div>
          <!-- 热门搜索 -->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" v-for="(item, index) in hotKey" :key="index" class="item"><span>{{item.k}}</span></li>
            </ul>
          </div>
          <!-- 搜索历史 -->
          <div class="search-history">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <!-- 搜索列表 -->
            <search-list
                  :searches="searchHistory"
                  @selectItem="addQuery"
                  @deleteItem="deleteSearchHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!-- 搜索列表 -->
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggest" @listScroll="blurInput" @selectSearch="saveSearch" :query="query"></suggest>
    </div>
    <!-- 弹窗 -->
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from '@/base/search-box/search-box' // 搜索框组件
import SearchList from '@/base/search-list/search-list' // 搜索历史列表
import Confirm from '@/base/confirm/confirm' // 弹窗组件
import Suggest from '@/components/suggest/suggest' // 搜索歌曲列表
import Scroll from '@/base/scroll/scroll'
import { getHotKey } from '@/api/search' // 热门关键词
import { ERR_OK } from '@/api/config' // 判断
import { mapActions, mapGetters } from 'vuex';
import {playlistMixin, searchMixin} from '@/common/js/mixin' // 播放器公用与搜索公用函数

export default {
  mixins: [playlistMixin, searchMixin],
  data () {
    return {
      hotKey: [], // 热门搜索词汇
      refreshDelay: 100
    }
  },
  created () {
    this._getHotKey()
  },
  computed: {
    // 把热门字段和搜索历史字段拼接在一起 利于计算scroll滚动
    shortcut () {
      return this.hotKey.concat(this.searchHistory)
    },
    // 实时获取最新搜索的历史
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : 0
      // 重置位置
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.searchResult.style.bottom = bottom
      // 重新计算滚动组件的高度
      this.$refs.shortcut.refresh()
      // 调用子组件方法重置子组件的滚动组件高度
      this.$refs.suggest.refresh()
    },
    // 热门搜索接口
    _getHotKey () {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10) // 截取前10条关键词
        }
      })
    },
    // 弹窗
    showConfirm () {
      this.$refs.confirm.show()
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  watch: {
    // 监听从搜索列表切换回搜索界面
    query (newQuery) {
      // 因为切换回来搜素界面的条件是没有搜索词
      if (!newQuery) {
        setTimeout(() => {
          // 重置下滚动组件，重新计算高度
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
