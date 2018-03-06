<template>
  <div class="recommend" ref="recommend">
    <!-- 调用组件的时候 必须往里面传入data数据 否则无法执行 -->
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
          <!-- 利用element UI 替换原本的 -->
          <el-carousel indicator-position="outside" height="150px">
            <el-carousel-item v-for="item in recommends" :key="item.id">
                <a :href="item.linkUrl">
                    <img @load="loadImage" :src="item.picUrl" alt="">
                </a>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" :key="item.content_id" class="item">
              <div class="icon">
                <!-- 使用v-lazy来懒加载图片 -->
                <img v-lazy="item.cover" alt="" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name">{{item.title}}</h2>
                <p class="desc">{{item.rcmdcontent}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- loading -->
      <div class="loading-content" v-show="!discList.length"> <!-- 判断数据是否加载了 -->
        <Loading></Loading>
      </div>
    </Scroll>
    <!-- 二级路由 -->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
// 推荐接口组件
import { getRecommend, getDiscList } from '@/api/recommend';
// 列表滚动
import Scroll from '@/base/scroll/scroll';
// loading
import Loading from '@/base/loading/loading';
import { ERR_OK } from '@/api/config';
import {playlistMixin} from '@/common/js/mixin' // 调用混入方法
import {mapMutations} from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  // 生命周期方法 => 组件创建的时候
  created () {
    this._getRecommend();
    this._getDiscList();
  },
  // 存放方法的地方
  methods: {
    // 跳转到歌单详情页
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.content_id}`
      })
      // 修改Vuex数据
      this.setDisc(item)
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom // 重新设置距离mini高度的bottom边距
      this.$refs.scroll.refresh() // 重置scroll高度的方法
    },
    // 推荐轮播图
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          // 对data进行赋值
          this.recommends = res.data.slider;
        }
      })
    },
    // 推荐列表
    _getDiscList () {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          this.discList = res.recomPlaylist.data.v_hot
        }
      })
    },
    // 轮播图加载
    loadImage () {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true; // 设置标记 只有有一张图片加载就可以停止loadImage函数
      }
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  // 组成组件
  components: {
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
        img
         width : 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
