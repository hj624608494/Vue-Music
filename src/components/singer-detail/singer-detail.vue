<template>
  <!-- 使用transition做转场动画 -->
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex' // 通过mapGetters来获取数据
import { getSingerDetail } from '@/api/singer' // 调用接口
import { ERR_OK } from '@/api/config'
import { createSong, getSongUrl } from '@/common/js/song' // 处理歌曲数据
import MusicList from '@/components/music-list/music-list' // 调用音乐详情页组件

export default {
  data () {
    return {
      songs: []
    }
  },
  computed: {
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.avatar
    },
    // 因为是多个store 所以这个函数要用数组输出
    ...mapGetters([
      'singer'
    ])
  },
  created () {
    this._getDetail()
  },
  methods: {
    _getDetail () {
    // 当直接在原来页面刷新的话 就让他退回到歌手列表
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      // 传入Vuex中singer的id
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
        }
      })
    },
    // 遍历歌曲列表
    _normalizeSongs (list) {
      let ret = []
      list.forEach(item => {
        // 获取到musicData中的歌曲
        let { musicData } = item
        // 判断对象中songid和albummid是否存在 因为必传的
        if (musicData.songid && musicData.albummid) {
          // 调用工厂函数处理数据
          ret.push(createSong(musicData))
        }
      });
      // 循环添加歌曲地址
      ret.forEach(item => {
        item.url = getSongUrl(item, item.mid)
      })
      // 返回数据
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>


<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  .slide-enter-active,.slide-leave-active
   transition: all .3s

  .slide-enter,.slide-leave-to
   transform translate3d(100%,0,0)
</style>


