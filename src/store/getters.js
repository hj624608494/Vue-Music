// 定义参数获取Vuex的state对应内容
export const singer = state => state.singer // 设置歌手信息&歌曲列表

export const playing = state => state.playing // 播放状态

export const fullScreen = state => state.fullScreen // 播放器展开

export const playlist = state => state.playlist // 播放列表

export const sequenceList = state => state.sequenceList // 顺序列表

export const mode = state => state.mode // 播放模式 默认循序播放

export const currentIndex = state => state.currentIndex // 当前播放的歌曲
// 计算属性 根据当前currentIndex获取指定歌曲
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}
export const disc = state => state.disc // 推荐歌单列表

export const ranklist = state => state.ranklist // 排行榜歌单列表

export const searchHistory = state => state.searchHistory // 搜索历史

export const playHistory = state => state.playHistory // 播放历史

export const favoriteList = state => state.favoriteList // 歌曲收藏
