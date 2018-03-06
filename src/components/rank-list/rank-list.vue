<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from '@/components/music-list/music-list' // 调用music-list结构体
import { mapGetters } from 'vuex'
import { RankDetail } from '@/api/rank' // 列表接口
import { ERR_OK } from '@/api/config'
import { createSong, getSongUrl } from '@/common/js/song' // 数据结构
export default {
  data () {
    return {
      songs: [],
      rank: true
    }
  },
  computed: {
    title () {
      return this.ranklist.topTitle
    },
    bgImage () {
      // 获取第一个歌曲的图片
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters([
      'ranklist'
    ])
  },
  created () {
    this._getRankList()
  },
  methods: {
    _getRankList () {
      // 强制刷新返回排行页面
      if (!this.ranklist.id) {
        this.$router.push('/rank')
        return
      }
      RankDetail(this.ranklist.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.songlist)
        }
      })
    },
    // 处理数据结构
    _normalizeSongs (lists) {
      let ret = []
      lists.forEach((item) => {
        const musicData = item.data
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      // 循环添加歌曲地址
      ret.forEach(item => {
        item.url = getSongUrl(item, item.mid)
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
