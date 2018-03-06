import * as types from './mutation-types'
import {playMode} from '@/common/js/config' // 播放模式
import {shuffle} from '@/common/js/util' // 打乱排序
import {saveSearch, deleteSearch, clearSearch, savePlay, deleteFavorite, saveFavorite} from '@/common/js/cache'

// 随机播放时查询对应的歌曲并且返回歌曲当前的下标
function findIndex (list, song) {
  // 查找对应字段的歌曲并且返回歌曲下标
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 选择播放
// 系统自带：commit 获取方法 state 获取未被修改时候的state值  用户操作 ：list 播放列表 index 歌曲索引
export const selectPlay = function ({commit, state}, {list, index}) {
  // 作为方法把值提交到state里面进行修改 类似于action
  commit(types.SET_SEQUENCE_LIST, list)
  // 如果在随机播放的时候 点击歌手列表的歌曲 会重新设置为顺序播放
  // 判断当前播放的模式是随机
  if (state.mode === playMode.random) {
    let randomlist = shuffle(list) // 重新把列表打乱，不让他顺序播放
    commit(types.SET_PLAYLIST, randomlist) // 修改播放列表
    index = findIndex(randomlist, list[index]) // 查找到对应点击的歌曲的下标
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  // 先设置正常播放的列表 以免切换模式的时候无法拿到正常循序的列表
  commit(types.SET_SEQUENCE_LIST, list)
  // 重新编排列表为随机
  let randomlist = shuffle(list)
  // 设置播放列表
  commit(types.SET_PLAYLIST, randomlist)
  // 设置播放的下标 默认为0
  commit(types.SET_CURRENT_INDEX, 0)
  // 弹框打开
  commit(types.SET_FULL_SCREEN, true)
  // 播放状态
  commit(types.SET_PLAYING_STATE, true)
}

// 播放列表删除指定歌曲
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 当前歌曲的播放下标
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1) // 删除
  // 顺序列表的播放下标
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1) // 删除

  // 判断删除的歌曲是否在当前播放的歌曲的上边 或者 是播放列表中的最后一首歌
  if (currentIndex > pIndex || playlist.length === currentIndex) {
    currentIndex--
  }
  // 把修改后的值修改vuex
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 如果播放列表不为空的时候
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState) // 播放设置
}

// 清空播放列表
export const clearSongList = function ({commit}) {
  // 把store的值设置为默认
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

// 搜索列表添加歌曲
export const insertSong = function ({commit, state}, song) {
  // 操作store的数组的时候 请先把数据进行拷贝
  let playlist = state.playlist.slice() // 当前播放列表的副本
  let sequenceList = state.sequenceList.slice() // 歌曲列表的副本
  let currentIndex = state.currentIndex // 当前播放的下标
  // 记录当前播放的歌曲
  let currentSong = playlist[currentIndex]
  // 判断在播放列表中存在选中的这首歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 先让歌曲下标++ 保证列表数统一
  currentIndex++
  // 插入到播放列表中 splce（index，howmany，item）howmany中是删除多少条 插入是插入到当前位置的后面
  playlist.splice(currentIndex, 0, song)
  // 判断是否存在
  if (fpIndex > -1) {
    // 如果当前歌曲的索引大于搜索到的索引 也就是说这首歌在播放列表的前面
    if (currentIndex > fpIndex) {
      // 把这首歌删除
      playlist.splice(fpIndex, 1)
      // 因为歌曲删除了 所以索引需要减
      currentIndex--
    } else {
      // 如果在后面 就增加进去
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 当前歌曲列表的索引 因为只是用来计算 所以直接查到就+1
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 是否存在当前播放列表
  let fsIndex = findIndex(sequenceList, song)
  // 先插入这首歌
  sequenceList.splice(currentIndex, 0, song)
  // 判断这首歌是否存在了
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1) // 把这首歌在当前列表前面的删除了
      currentIndex-- // 减少索引
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  // 对vuex数据进行修改
  commit(types.SET_PLAYLIST, playlist) // 播放列表
  commit(types.SET_CURRENT_INDEX, currentIndex) // 当前播放的歌曲
  commit(types.SET_SEQUENCE_LIST, sequenceList) // 顺序列表
  commit(types.SET_FULL_SCREEN, true) // 弹框打开
  commit(types.SET_PLAYING_STATE, true) // 播放状态
}

// 缓存搜索结果
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除指定缓存数据
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空缓存
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 播放歌曲缓存
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song)) // 设置播放歌曲的缓存
}

// 收藏歌曲
export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 删除收藏
export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
