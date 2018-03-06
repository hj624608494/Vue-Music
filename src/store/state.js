import {playMode} from '@/common/js/config'
import {loadSearch, loadPlay, loadFavorite} from '@/common/js/cache'
// Vuex存储器 存放各类数据
const state = {
  singer: {}, // 歌曲信息
  playing: false, // 播放状态
  fullScreen: false, // 播放器展开
  playlist: [], // 播放列表
  sequenceList: [], // 顺序列表
  mode: playMode.sequence, // 播放模式 默认循序播放
  currentIndex: -1, // 当前播放的歌曲
  disc: {}, // 推荐歌单列表
  ranklist: [], // 排行榜歌单列表
  searchHistory: loadSearch(), // 搜索结果历史 读取缓存
  playHistory: loadPlay(), // 播放历史
  favoriteList: loadFavorite()// 收藏列表
}

export default state
