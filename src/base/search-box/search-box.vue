<template>
  <!-- 搜索框组件 -->
  <div class="search-box">
    <i class="icon-search"></i>
    <!-- v-model 会把对应在data内的对象进行绑定 从而进行双向数据写入 -->
    <input ref="query" class="box" :placeholder="placeholder" v-model="query">
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script>
import {debounce} from '@/common/js/util' // 延时操作
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲, 歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    // 清空文本区域内容
    clear () {
      this.query = ''
    },
    // 把父元素的自动填写的内容传递到query里面
    setQuery (query) {
      this.query = query
    },
    // 取消选中
    blur () {
      this.$refs.query.blur()
    }
  },
  created () {
    // 组件创建的时候 执行监听data的query数据变化
    // 利用debounce来减少无用请求
    this.$watch('query', debounce((newQuery) => {
      // 把数据派发出去
      this.$emit('query', newQuery)
    }, 200))
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
