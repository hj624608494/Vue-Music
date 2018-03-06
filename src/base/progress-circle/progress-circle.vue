<template>
  <div class="progress-circle">
    <!-- viewBox 视口宽度 0 0 100 100 表示从坐标0 0 开始画一个区域到100 100 -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- 内层圆形 -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!-- 外层圆形 -->
      <!-- stroke-dasharray 表示描边 -->
      <!-- stroke-dashoffset 表示描边偏移 -->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    // SVG大小
    radius: {
      type: Number,
      default: 100
    },
    // 播放进度
    percent: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // *100 是因为上面SVG设置的园的半径是50 半径 * 半径 = 圆的直径
      dashArray: Math.PI * 100
    }
  },
  // 判断歌曲播放时长实时计算
  computed: {
    dashOffset () {
      // 播放时长是以毫秒数执行的 如果到1证明播放完成
      // console.log(this.percent)
      // 0表示描边完成 所以可以根据 1 - 播放的时长 来监控进度条走到哪里
      return (1 - this.percent) * this.dashArray
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
