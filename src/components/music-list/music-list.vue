<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" @select="selectItem" :songs="songs" ></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>


<script>
import Scroll from '@/base/scroll/scroll' // 滚动组件
import SongList from '@/base/song-list/song-list' // 音乐列表组件
import {prefixStyle} from '@/common/js/dom' // 自动css添加前缀
import Loading from '@/base/loading/loading' // loading
import {mapActions} from 'vuex' // 利用actions修改state的值
import {playlistMixin} from '@/common/js/mixin' // 调用方法

const RESERVED_HEIGHT = 40 // 偏移量
const transform = prefixStyle('transform') // 自动添加css前缀
const backdrop = prefixStyle('backdrop-filter')

export default {
  // 把playlistMixin组件的内容混入到当前组件里面 而且必须调用组件的method方法,否则会直接报错
  mixins: [playlistMixin],
  data () {
    return {
      scrollY: 0
    }
  },
  props: {
    bgImage: {
      type: String,
      defalut: ''
    },
    songs: {
      type: Array,
      defalut: []
    },
    title: {
      type: String,
      defalut: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  methods: {
    // 修改被mini播放器的占用的高度位置重置滚动列表的bottom值
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom // 重新设置距离mini高度的bottom边距
      this.$refs.list.refresh() // 并且重新计算scroll组件的高度
    },
    // 获取派发的内容
    selectItem (item, index) {
      this.selectPlay({
        list: this.songs, // 因为是播放整个列表 所以不需要使用item而传入整个songs
        index
      })
    },
    // 监听滚动
    scroll (pos) {
      this.scrollY = pos.y
    },
    // 返回上一层
    back () {
      this.$router.back()
    },
    // 随机播放全部
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    // 绑定方法让其可调用
    ...mapActions([
      'selectPlay', // 顺序播放
      'randomPlay' // 随机播放
    ])
  },
  mounted () {
    // 记录图片高度
    this.imageHeight = this.$refs.bgImage.clientHeight
    // 设置最少滚动高度  -图片的高度+头部余留值
    this.minTranslateY = -this.$refs.bgImage.clientHeight + RESERVED_HEIGHT
    // 组件加载完毕后 响应式滚动列表的top top = 背景图的高度 $el => 获取dom节点
    this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  watch: {
    // 监听滚动
    scrollY (newY) {
      // 设置滚动最大值 滚动值不能超过图片的高度
      let translateY = Math.max(this.minTranslateY, newY)
      let zIndex = 0 // 设置层级
      let scale = 1 // 设置放大值
      let blur = 0 // 设置模糊值
      // 遮罩层滚动
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      // 计算图片滚动公式 绝对值 = newY/图片的高度
      const percent = Math.abs(newY / this.imageHeight)
      // 判断如果往下拉的情况
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        // 如果往上滚动 就让图片设置模糊值 最大范围是20
        blur = Math.min(20 * percent, 20)
      }
      // 设置模糊 backdrop-filter css3 模糊效果 安卓是没有办法实现
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      // 滚动到顶部的时候
      if (newY < this.minTranslateY) {
        zIndex = 10
        // 设置图片的高度 清空paddingTop设置最少高度值
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none'
      } else {
        // 如果没有滚动到顶部 设置成为原来的样式
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = ''
      }
      // 设置层级关系
      this.$refs.bgImage.style.zIndex = zIndex
      // 设置放大动画
      this.$refs.bgImage.style[transform] = `scale(${scale})`
    }
  },
  components: {
    Scroll,
    SongList,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>

