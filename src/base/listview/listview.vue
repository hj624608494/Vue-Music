<template>
  <scroll @scroll="scroll"
          :listen-scroll="listenScroll"
          :probe-type="probeType"
          :data="data"
          class="listview"
          ref="listview">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup" :key="group.title">
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <li @click="selectItem(item)" :key="item.name" v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
      <ul>
        <li v-for="(item, index) in shortcutList" :key="index" :data-index="index" class="item"
            :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <!-- 固定Title -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <!-- Loading -->
    <div v-show="!data.length" class="loading-container">
      <Loading></Loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from '@/base/scroll/scroll'
// 获取data的函数
import { getData } from '@/common/js/dom'
// loading组件
import Loading from '@/base/loading/loading'

// 获取字母表的元素的高度 计算根据height + padding推算
const AHCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30;

export default {
  props: {
    data: {
      type: Array,
      defalut: []
    }
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  // 初始化时候设置touch
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  methods: {
    // 向父元素暴露可以重新设置scroll的方法
    resetScroll () {
      this.$refs.listview.refresh()
    },
    // 点击事件派发参数出去
    selectItem (item) {
      this.$emit('select', item)
    },
    // 触摸点击事件 左侧滚动到指定位置
    onShortcutTouchStart (e) {
      // 获取data值 data是循环的下标  e.target 是获取元素
      let anchorIndex = getData(e.target, 'index')
      // 获取手指第一次触碰的地方的属性
      let fristTouch = e.touches[0]
      // 对touch的y坐标进行赋值
      this.touch.y1 = fristTouch.pageY
      // 当前锚点的索引
      this.touch.anchorIndex = anchorIndex
      // 最后让父元素滚动到指定位置
      this._scrollTo(anchorIndex)
    },
    // 触摸滑动事件 左侧滚动到指定位置
    onShortcutTouchMove (e) {
      // 获取移动时的dom属性
      let fristTouch = e.touches[0]
      // 记录滑动时候偏移的值
      this.touch.y2 = fristTouch.pageY
      // 把2个值互减获取偏移量 然后除以元素的高度并且向下取整
      let delta = (this.touch.y2 - this.touch.y1) / AHCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      // 最后让父元素滚动到指定位置
      this._scrollTo(anchorIndex)
    },
    // 列表数据加载重新更新高度
    refresh () {
      this.$refs.listview.refresh()
    },
    // 实时获取scroll滚动的y轴距离
    scroll (pos) {
      this.scrollY = pos.y
    },
    // 滚动到指定位置
    _scrollTo (index) {
      // 判断是否没有执行
      if (!index && index !== 0) {
        return
      }
      // 判断是否滚动到顶部
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) { // 判断是否超出底部范围
        index = this.listHeight.length - 2
      }
      // 必须要使用减号
      this.scrollY = -this.listHeight[index]
      // 选中指定下标 让better-scroll滚动到指定下标的地方
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    // 计算每个group的高度
    _calculateHeight () {
      this.listHeight = [];
      const list = this.$refs.listGroup; // 获取所有的group列表结构
      // 初始化height
      let height = 0;
      this.listHeight.push(height); // 第一组的高度必须是0
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight; // 因为是dom结构 所以可以直接获取他距离body的top距离
        this.listHeight.push(height); // 最后把高度追加到高度数组里面
      }
    }
  },
  // 监听data变化
  watch: {
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听是否落在了区间
    scrollY (newY) {
      // 获取已经加载好的数据高度
      const listHeight = this.listHeight
      // 当滚动到顶部 newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间区块滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1] // 第二个必须+1 用来做减运算
        // 判断是否滚动落在了height1和height2 之间 使用符号是因为传入值的时候是负号
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // 计算出第二个元素到fixedTitle之间的相差的值
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      // newVal是第一层和第二层之间的高度差距
      // newVal必须大于0并且newVal要小于fixedTtile
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
      // 判断是否已经在执行动画
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      // 设置C3动画 让FixedTitle往上撑走
      this.$refs.fixed.style.transform = `translate3d(0, ${this.fixedTop}px, 0)`
    }
  },
  // computed 数据发生变动时就会执行对相应数据有引用的函数
  computed: {
    // 获取滚动列表数据
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

