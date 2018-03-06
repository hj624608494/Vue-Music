<template>
  <!-- 外层灰色条 -->
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 有颜色的进度条 -->
      <div class="progress" ref="progress"></div>
      <!-- 小圆点按钮 -->
      <!-- prevent 阻止默认浏览器事件 -->
      <div class="progress-btn-wrapper" ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {prefixStyle} from '@/common/js/dom'
const progressBtn = 16 // 定义按钮宽度 根据css的宽度
const transform = prefixStyle('transform')
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    this.touch = {}
  },
  methods: {
    // 触摸开始
    progressTouchStart (e) {
      // 定义初始化 表示已经初始化成功
      this.touch.initiated = true
      // 设置按钮X坐标的位置
      this.touch.startX = e.touches[0].pageX
      // 设置已经走了多少（根据高亮色进度条）
      this.touch.left = this.$refs.progress.clientWidth
    },
    // 触摸拖动
    progressTouchMove (e) {
      // 如果没有进入初始化禁止拖动
      if (!this.touch.initiated) {
        return
      }
      // 获取按钮被拖动了多远 用当前坐标X - 初始化的X坐标获得偏移量
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 设置高亮进度条的宽度 必须大于0的情况下 把初始化的高亮进度条的宽度加上滑动后偏移量
      // 当用户无止境的拖动时是不允许的 设置最大范围在整个进度条的长度内
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtn, Math.max(0, this.touch.left + deltaX))
      // 调用函数
      this._offset(offsetWidth)
    },
    // 触摸结束
    progressTouchEnd (e) {
      // 修改初始化值 拖动事件结束
      this.touch.initiated = false
      // 调用方法 把歌曲播放进度调制拖动结束后的位置
      this.triggerPercent()
    },
    // 点击总进度让高亮进度条进行偏移
    progressClick (e) {
      // 调动方法 传入点击位置的X轴
      // this._offset(e.offsetX) 遇到问题 如果直接点击按钮会获取不到 导致自动回弹到初始位置 可以利用pageX来代替offsetX
      /*
        pageX是获取当前位置距离屏幕最左边的位置开始算的 超出了进度的范围
        所以要利用Vue自带的函数 getBoundingClientRect()
        来定位到在组件初始化完成后按钮所在的正确位置left位置
      */
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetX = e.pageX - rect.left
      this._offset(offsetX)
      // 调用方法 通知外层点击后的位置
      this.triggerPercent()
    },
    // 定位拖动后歌曲进度
    triggerPercent () {
      // 获取整个进度条的长度 还要减去圆点的占位宽度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtn
      // 获取进度条已被拖动了多远 用于计算播放时间  (高亮进度条 / 进度条)
      const prevent = this.$refs.progress.clientWidth / barWidth
      // 把事件派发出去
      this.$emit('percentChange', prevent)
    },
    // 公共函数 用于修改高亮进度条以及按钮的位置
    _offset (offsetWidth) {
      // 设置有颜色的进度条的宽度
      this.$refs.progress.style.width = `${offsetWidth}px`
      // 设置小球偏移
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    }
  },
  watch: {
    // 监听进度条变化
    percent (newPercent) {
      // 拖动时权限最大 防止在播放中和拖动冲突导致拖动后返回原点
      if (newPercent >= 0 && !this.touch.initiated) {
        // 获取整个进度条的长度 还要减去圆点的占位宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtn
        // 偏移量 歌曲播放的比例 * 整个宽度
        const offsetWidth = newPercent * barWidth
        // 调用函数
        this._offset(offsetWidth)
      }
    }
  }
}
</script>


<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

