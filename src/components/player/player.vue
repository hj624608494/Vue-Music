<template>
  <div class="player" v-show="playlist.length > 0">
    <!-- Vue提供动画钩子函数 -->
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
    <!-- 展开的播放器 -->
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img width="100%" height="100%" :src="currentSong.image">
      </div>
      <!-- 头部 标题以及返回按钮-->
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <!-- 中间部分 唱片&歌词 -->
      <div
        class="middle"
        @touchstart.prevent="middleTouchStart"
        @touchmove.prevent="middleTouchMove"
        @touchend.prevent="middleTouchEnd"
      >
        <!-- 唱片页面 -->
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdClass">
              <img class="image" :src="currentSong.image">
            </div>
          </div>
          <!-- 唱片底部小歌词 -->
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <!-- 歌词滚动组件 初始化时候currentLyric是Null 所以需要判断一下-->
        <scroll :data="currentLyric && currentLyric.lines" class="middle-r" ref="lyricList">
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{'current': currentLineNum === index}"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                >{{line.txt}}</p>
              </div>
          </div>
        </scroll>
      </div>
      <!-- 底部按钮 操作 -->
      <div class="bottom">
        <!-- 左右切换点 -->
        <div class="dot-wrapper">
          <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
          <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
        </div>
        <div class="progress-wrapper">
          <!-- 取整当前播放的时长 -->
          <span class="time time-l">{{format(currentTime)}}</span>
          <!-- 进度条 -->
          <div class="progress-bar-wrapper">
            <!-- percentChange 监听基础组件派发出来的进度条轨迹 -->
            <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
          </div>
          <!-- 确证歌曲总时长 -->
          <span class="time time-r">{{format(currentSong.duration)}}</span>
        </div>
        <div class="operators">
          <!-- 切换模式 -->
          <div class="icon i-left" @click="changeMode">
            <i :class="iconMode"></i>
          </div>
          <!-- 上一首 -->
          <div class="icon i-left" :class="disableCls">
            <i @click="prev" class="icon-prev"></i>
          </div>
          <!-- 播放暂停 -->
          <div class="icon i-center" :class="disableCls">
            <i @click="togglePlaying" :class="playIcon"></i>
          </div>
          <!-- 下一首 -->
          <div class="icon i-right" :class="disableCls">
            <i @click="next" class="icon-next"></i>
          </div>
          <!-- 收藏 -->
          <div class="icon i-right">
            <i class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <!-- 收起的播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdClass" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <!-- 利用SVG实现圆形进度条 把大小和当前播放的时间传递进去-->
          <progress-circle :radius="radius" :percent="percent">
            <!-- .stop 因为父元素有点击事件 所以添加stop阻止冒泡 -->
            <i @click.stop="togglePlaying" class="icon-mini" :class="playIconMiNi"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 歌曲列表 -->
    <playList ref="playlist"></playList>
     <!-- @canplay 从加载到播放过程中的钩子函数 -->
     <!-- @error 从加载到加载失败的钩子函数 -->
     <!-- @ended 歌曲播放完成 -->
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation' // js写CSS动画
import {prefixStyle} from '@/common/js/dom' // 自动添加后缀
import {playMode} from '@/common/js/config' // 播放模式
import {playerMixin} from '@/common/js/mixin' // 模式公共模块
import Lyric from 'lyric-parser' // 获取歌词解析器
import Scroll from '@/base/scroll/scroll' // 使用scroll组件使得歌曲可以滚动
import PlayList from '@/components/playlist/playlist' // 歌曲列表
import ProgressBar from '@/base/progress-bar/progress-bar' // 进度条
import ProgressCircle from '@/base/progress-circle/progress-circle' // 圆形进度条

const transform = prefixStyle('transform') // 动画效果
const transitionDuration = prefixStyle('transitionDuration') // 缓动效果

export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false, // 判断歌曲是否加载完成
      currentTime: 0, // 歌曲播放的时间
      radius: 32, // 小mini进度条大小
      currentLyric: null, // 歌词
      currentLineNum: 0, // 当前歌词所在解析器中第几行
      currentShow: 'cd', // 左右切换界面
      playingLyric: '' // cd页面歌词
    }
  },
  // 初始化触摸事件
  created () {
    this.touch = {}
  },
  methods: {
    // 打开歌曲列表
    showPlaylist () {
      this.$refs.playlist.show()
    },
    // 获取歌曲时长
    updateTime (e) {
      // 获取当前歌曲播放的时间
      this.currentTime = e.target.currentTime // 获取的是时间戳 需要转换
    },
    // 歌曲加载完毕
    ready () {
      this.songReady = true // 设置为true
      this.savePlayHistory(this.currentSong) // 设置播放历史
    },
    // 歌曲加载失败
    error () {
      console.log('error song')
      this.songReady = true // 设置为true 就算加载失败也可以正常运行
    },
    // 歌曲播放完成
    end () {
      // 判断模式时候为单曲循环
      if (this.mode === playMode.loop) {
        // 调用单曲循环的函数
        this.loop()
      } else {
        // 切换到下一首歌
        this.next()
      }
    },
    // 单曲循环模式
    loop () {
      // 设置currentTime为0 重新播放
      this.$refs.audio.currentTime = 0
      // 调用自动播放
      this.$refs.audio.play()
      // 单曲循环播放可以利用解析内部的seek方法重新返回到头部
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 上一首
    prev () {
      // 歌曲未加载完毕 禁止跳转
      if (!this.songReady) {
        return
      }
      // 如果播放列表只有一条数据 切换成单曲循环
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        // 判断是否到了第一首歌
        if (index === -1) {
          index = this.playlist.length - 1 // 顺序播放 第一首歌时候就切换到最后一个首歌的下标
        }
        // 根据下标切换歌曲
        this.setCurrentIndex(index)
        // 判断在暂停时切换 自动开启播放
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      // 已经点击过一次下一首歌 设置songReady回默认值
      this.songReady = false
    },
    // 下一首
    next () {
      // 歌曲未加载完毕 禁止跳转
      if (!this.songReady) {
        return
      }
      // 如果播放列表只有一条数据 切换成单曲循环
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        // 判断是否到了最后一首歌
        if (index === this.playlist.length) {
          index = 0 // 顺序播放 最后一首歌就返回第一首歌的下标
        }
        // 根据下标切换歌曲
        this.setCurrentIndex(index)
        // 判断在暂停时切换 自动开启播放
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      // 已经点击过一次下一首歌 设置songReady回默认值
      this.songReady = false
    },
    // 切换播放暂停
    togglePlaying () {
      // 歌曲未加载完毕 禁止跳转
      if (!this.songReady) {
        return
      }
      // 传递参数进行修改
      this.setPlayingState(!this.playing)
      // 歌曲暂停也要停止歌词轮询
      if (this.currentLyric) {
        // 先停止
        this.currentLyric.togglePlay()
      }
    },
    // 收起播放页面
    back () {
      // 必须先引入Mutations 才能修改其状态值
      this.setFullScreen(false)
    },
    // 打开播放页面
    open () {
      this.setFullScreen(true)
    },
    // 移入时动画
    // el => dom节点 done => 回调函数
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      // 定义animations
      let animation = {
        // 开始的时候
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        // 动画进行到60%
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        // 动画进行到100%
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      // 注册动画
      animations.registerAnimation({
        name: 'move', // 动画名
        animation, // 动画效果
        presets: { // 间隔
          duration: 400,
          easing: 'linear'
        }
      })
      // 调用动画 dom节点 动画名字 回调函数 自动跑到afterEnter钩子内部
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      // 结束动画move
      animations.unregisterAnimation('move')
      // 清空组件动画
      this.$refs.cdWrapper.style.animation = ''
    },
    // 移除时动画
    leave (el, done) {
      // 添加动画
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      // 添加css3动画结束
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      // 清空transition和transform
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // 获取初始化位置和缩放
    _getPosAndScale () {
      // 先获取到小播放器的专辑图片的位置以及宽度
      const targetWidth = 40
      const paddingLeft = 40
      // const paddingBottom = 30
      // 大图距离顶部的top偏离值
      const paddingTop = 80
      const width = window.innerWidth * 0.8 // CD图的大小 根据屏幕的宽度的80%
      // 获取缩放比例
      const scale = targetWidth / width
      // 获取x轴 二分之一的屏幕宽度 - 小图的X轴偏移量 x轴要负数 因为是由下往上走
      const x = -(window.innerWidth / 2 - paddingLeft)
      // 屏幕的高度 - 距离顶部的偏移 - CD图的宽度/2获取到中心点 - 顶部偏移
      const y = window.innerHeight - paddingTop - width / 2 - paddingTop
      // 返回
      return {
        x, y, scale
      }
    },
    // 转换时间戳
    format (interval) {
      interval = interval | 0 // 向下取整
      const mintue = interval / 60 | 0 // 获取分
      const second = this._pat(interval % 60) // 获取秒 并且秒是个位数自动往前补上0
      return `${mintue}:${second}`
    },
    // 把秒是个位数时补0填充
    _pat (num, n = 2) {
      let numlen = num.toString().length // 获取长度 先转换成字符串
      // 循环如果位数是各位就自动补0
      while (numlen < n) {
        num = '0' + num
        numlen++ // 以防无限补 在补0之后numlen长度就等于2 自然不会再次跑进循环
      }
      // 返回
      return num
    },
    // 歌词处理
    getLyric () {
      // 获取工厂函数的内置对象 因为使用了Promise,所以需要进行异步调用
      this.currentSong.getLyric().then((res) => {
        // 调用歌曲解析器对歌词处理
        this.currentLyric = new Lyric(res, this.handleLyric)
        if (this.playing) {
          // 调用解析器的内置play让歌词跟踪播放进度进行切换
          this.currentLyric.play()
        }
      }).catch(() => { // 歌词获取异常时候进行清理操作
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 监听歌曲播放时间是否到达解析器内部对应的time时间戳
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      // 前5行歌词不需要滚动
      if (lineNum > 5) {
        // 获取到当前行数
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        // 让滚动组件进行滚动到指定位置
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        // 如果没有就让滚动组件默认停留在最上层
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      // cd页面当前播放的歌词
      this.playingLyric = txt
    },
    // 计算拖动后播放进度
    onProgressBarChange (percent) {
      const currentTime = this.currentSong.duration * percent
      // 修改播放时间  歌曲总时长 * 被拖动的距离
      this.$refs.audio.currentTime = currentTime
      // 需要在暂停时候拖动后自动播放
      if (!this.playing) {
        // 调用自动切换功能
        this.togglePlaying()
      }
      // 实时更新歌词位置
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 左右切换touch事件
    // 触摸开始
    middleTouchStart (e) {
      // 标识触摸事件已经开始
      this.touch.initiated = true
      const touch = e.touches[0] // 获取触摸参数
      // 记录初始化的X轴和Y轴
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    // 滑动移动
    middleTouchMove (e) {
      // 尚未初始化
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0] // 获取滑动中的参数
      // 滑动的距离 = 初始化的X（Y）轴 - 滑动后记录的X（Y）轴
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 利用绝对值判断是否在滚动歌词页面的scroll
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      // 如果当前为CD页面 记录的left值就是初始化的left 反之就是已经在歌词页面了
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 利用最大值使得禁止超出屏幕的滚动 向右滑动left值是正数 向左滑动left值是负数
      // 结合最少值禁止少于0的滚动事件
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      // 利用绝对值来设置百分比的width
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      // 滑动事件
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0 // 动画执行时间
      this.$refs.middleL.style.opacity = 1 - this.touch.percent // 设置透明度根据拖动距离计算
      this.$refs.middleL.style[transitionDuration] = 0 // 动画执行时间
    },
    // 滑动结束
    middleTouchEnd (e) {
      let offsetWidth
      let opacity
      // 判断是否为从右往左滑动
      if (this.currentShow === 'cd') {
        // 判断滑动的距离是否大于10%
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      // 判断是否为从左向右滑动
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` // 偏移动画
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms` // 动画执行时间
      this.$refs.middleL.style.opacity = opacity // 设置透明度
      this.$refs.middleL.style[transitionDuration] = `${time}ms` // 动画执行时间
    },
    // 修改功能
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN' // 获取歌手信息
    }),
    ...mapActions([
      'savePlayHistory' // 设置播放历史
    ])
  },
  // computed 实时计算 只要更新就会重新执行下面的内容
  computed: {
    // 播放时间的比例
    percent () {
      // 播放的时间除以总时长
      return this.currentTime / this.currentSong.duration
    },
    // CD旋转
    cdClass () {
      return this.playing ? 'play' : 'play pause'
    },
    // 设置播放按钮图标切换
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    playIconMiNi () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    // 暂时停用添加class效果
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    ...mapGetters([
      'fullScreen', // 获取歌手
      'playlist', // 获取歌曲列表
      'currentSong', // 调用方法 获取指定歌曲的信息
      'playing', // 播放状态
      'currentIndex', // 当前歌曲在播放列表中位于什么位置
      'mode', // 播放模式
      'sequenceList' // 顺序列表
    ])
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    PlayList
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 如果没有新的歌曲加入时候 直接跳出 为了避免删除完播放列表时候重新添加一首歌曲时候的报错
      if (!newSong.id) {
        return
      }
      // 禁止在暂时播放或者暂停的时候自动执行播放事件
      if (newSong.id === oldSong.id) {
        return
      }
      // 如果歌词正在执行或重新加载
      if (this.currentLyric) {
        // 先停止
        this.currentLyric.stop()
      }
      // 延迟加载 应对微信端加载和加载时间长
      setTimeout(() => {
        this.$refs.audio.play()
        // 调用方法获取歌词
        this.getLyric()
      }, 1000)
    },
    // 监听播放状态
    playing (newPlaying) {
      // 使用nextTick来控制只有在用户操作的时候才会有效果
      this.$nextTick(() => {
        const audio = this.$refs.audio
        // 判断值是否等于true或者false
        newPlaying ? audio.play() : audio.pause()
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
