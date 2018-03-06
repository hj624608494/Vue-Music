<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(song,index)" v-for="(song, index) in songs" class="item" :key="song.id">
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)">{{getRankText(index)}}</span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>


<script>
export default {
  props: {
    songs: {
      type: Array,
      defalut: []
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 点击添加播放
    selectItem (item, index) {
      this.$emit('select', item, index)
    },
    // 拼接字符串
    getDesc (song) {
      return `${song.singer}·${song.album}`
    },
    // 前三名改成图片
    getRankCls (index) {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    },
    // 后3名改成文字
    getRankText (index) {
      if (index > 2) {
        return index + 1
      }
    }
  }
}
</script>


<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>


