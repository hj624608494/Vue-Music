<template>
<transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <!-- 在列表中添加一个click.stop可以有效阻止冒泡事件 -->
      <!-- 播放模式 -->
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <!-- 歌曲列表 -->
        <scroll :refreshDelay="refreshDelay" ref="listContent" class="list-content" :data="sequenceList">
          <transition-group name="list" tag="ul">
            <li ref="listItem" class="item" v-for="(item, index) in sequenceList" :key="index" @click="selectItem(item, index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <!-- 按钮区 -->
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <!-- 确认框 -->
      <confirm ref="confirm" text="是否清空播放列表" confrimBtnText="清空" @confirm="confirmClear"></confirm>
      <!-- 添加歌曲界面 -->
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import Scroll from '@/base/scroll/scroll' // 滚动组件
import Confirm from '@/base/confirm/confirm' // 确认框
import AddSong from '@/components/add-song/add-song' // 添加歌曲到播放列表
import {playMode} from '@/common/js/config' // 播放模式识别
import {mapActions} from 'vuex'
import {playerMixin} from '@/common/js/mixin' // 模式公共模块

export default {
  mixins: [playerMixin],
  data () {
    return {
      showFlag: false,
      refreshDelay: 120 // 因为transition-group会有100毫秒的延迟加载 导致滚动组件滚动到指定位置的失效，所以增加延迟时间
    }
  },
  computed: {
    modeText () {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
    }
  },
  methods: {
    // 打开添加歌曲界面
    addSong () {
      this.$refs.addSong.show()
    },
    // 选中播放
    selectItem (item, index) {
      // 如果当前播放为随机播放
      if (this.mode === playMode.random) {
        // 查询到index位于播放列表的位置
        index = this.playlist.findIndex((song) => {
          return song.id === item.id
        })
      }
      // 切换歌曲
      this.setCurrentIndex(index)
      // 修改播放状态
      this.setPlayingState(true)
    },
    // 滚动到当前播放歌曲的位置
    scrollToCurrent (current) {
      // 获取在列表的下标位置
      const index = this.sequenceList.findIndex((song) => {
        return current.id === song.id
      })
      // 让滚动组件自动滚动到当前播放的歌曲的位置
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    // 显示
    show () {
      this.showFlag = true
      // 重置高度以及滚动到正在播放歌曲中的位置
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    // 隐藏
    hide () {
      this.showFlag = false
    },
    // 选中Icon
    getCurrentIcon (item) {
      // 如果当前播放歌曲的id匹配到列表歌曲的id
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      }
      return ''
    },
    // 删除播放列表中指定的歌曲
    deleteOne (item) {
      this.deleteSong(item) // 调用action方法
      // 如果歌曲被全部删除完 就让列表关闭
      if (!this.playlist.length) {
        this.hide()
      }
    },
    // 清空播放列表
    confirmClear () {
      this.clearSongList() // 清空播放列表和歌曲列表
      this.hide() // 把播放列表隐藏
    },
    // 打开确认框
    showConfirm () {
      this.$refs.confirm.show() // 打开确认框
    },
    ...mapActions([
      'deleteSong',
      'clearSongList'
    ])
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 如果播放列表不展示或者新点击的跟旧点击的歌曲一样 就不操作
      if (!this.showFlag || newSong.id === oldSong) {
        return
      }
      // 滚动到点击的歌曲的位置
      this.scrollToCurrent(newSong)
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
