<template>
  <div class="rank" ref="rank">
    <scroll :data="topList" class="toplist" ref="toplist">
      <ul>
        <li @click="selectItem(item)" class="item" v-for="(item, index) in topList" :key="index">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl"/>
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.songList" :key="index">
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { Rank } from '@/api/rank' // 接口
import { ERR_OK } from '@/api/config' // 判断
import Scroll from '@/base/scroll/scroll' // 滚动组件
import Loading from '@/base/loading/loading' // 加载组件
import { playlistMixin } from '@/common/js/mixin' // 复用类型
import { mapMutations } from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      topList: []
    }
  },
  created () {
    this._getRankList()
  },
  methods: {
    // 获取列表数据
    _getRankList () {
      Rank().then((res) => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    // 判断是否有播放列表的存在
    handlePlaylist (playlist) {
      const bottom = playlist.length ? '60px' : 0
      this.$refs.rank.style.bottom = bottom // 设置滚动列表的位置
      this.$refs.toplist.refresh() // 重置高度
    },
    // 跳转对应排行详情页
    selectItem (item) {
      this.$router.push({
        path: `/rank/${item.id}`
      })
      // 把数据存储在vuex里面
      this.setRankList(item)
    },
    ...mapMutations({
      setRankList: 'SET_RANK_LIST'
    })
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>


