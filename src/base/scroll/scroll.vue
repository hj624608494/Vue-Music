<template>
<!-- 滚动组件 -->
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll';

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted () {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll () {
      // 判断元素是否存在
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      // 判断是否监听scroll
      if (this.listenScroll) {
        let me = this
        // 派发一个事件出去 把当前滚动到的位置属性发送出去
        this.scroll.on('scroll', (pos) => {
          me.$emit('scroll', pos)
        })
      }
      // 是否开启上拉刷新
      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          // 判断是否滚动到底部
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            // 派送一个事件出去 用于判断
            this.$emit('scrollToEnd')
          }
        })
      }
      // 判断在滚动前的作用
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    enable () {
      this.scroll && this.scroll.enable()
    },
    disable () {
      this.scroll && this.scroll.disable()
    },
    // 初始化高度
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    // 滚动到指定位置
    scrollTo () {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    // 滚动组件
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  // watch 监听数据是否有更新 有就重新计算滚动组件的高度
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
