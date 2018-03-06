import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from '@/common/js/util' // 打乱播放列表 实现随机播放


// mini播放器占用高度处理
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  // 组件进行切换的时候
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    // 监听列表变化
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist () {
      // 抛出一个异常 如果组件内部没有调用当前组件就抛出异常
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

// 播放器公用组件
export const playerMixin = {
  computed: {
    // 切换播放模式
    iconMode () {
      // 判断是顺序 -> 循环 -> 还是随机
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    // 切换播放模式
    changeMode () {
      // 每次点击都切到让mode+1 并且取余为0
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode) // 切换状态
      let list = null // 列表数据
      // 如果是随机模式的话
      if (mode === playMode.random) {
        // 重新打乱排序
        list = shuffle(this.sequenceList)
      } else {
        // 顺序播放和单曲循环都用顺序列表
        list = this.sequenceList
      }
      // 改变播放下标 使得播放时切换播放列表时候下一首歌的下标不会混乱
      this.resetCurrentIndex(list)
      // 改变播放列表
      this.setPlayList(list)
    },
    // 重置下标 保证切换选项时更新currentIndex
    resetCurrentIndex (list) {
      // findIndex 查询到如果结果为真的话返回结果的下标
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      // 重新设置currentIndex
      this.setCurrentIndex(index)
    },
    // 收藏样式切换
    getFavoriteIcon (song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      } else {
        return 'icon-not-favorite'
      }
    },
    // 收藏点击切换
    toggleFavorite (song) {
      // 如果存在就是关闭收藏
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    // 判断是否是收藏歌曲
    isFavorite (song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE', // 修改歌曲播放状态
      setCurrentIndex: 'SET_CURRENT_INDEX', // 根据下标获取切换歌曲
      setPlayMode: 'SET_PLAY_MODE', // 修改播放模式参数
      setPlayList: 'SET_PLAYLIST' // 修改歌单列表
    }),
    ...mapActions([
      'saveFavoriteList', // 保存收藏
      'deleteFavoriteList' // 删除收藏
    ])
  }
}

// 搜索公共区
export const searchMixin = {
  data () {
    return {
      query: '', // 关键词
      refreshDelay: 120 // 重置高度
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 截取输入框返回的信息
    onQueryChange (query) {
      this.query = query
    },
    // 取消框选中
    blurInput () {
      // 调用子组件方法
      this.$refs.searchBox.blur()
    },
    // 点击热门搜索词汇自动添加到输入框
    addQuery (query) {
      // 调用子组件内部的方法
      this.$refs.searchBox.setQuery(query)
    },
    // 保存搜索结果
    saveSearch () {
      // 把当前的query储存进去
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
