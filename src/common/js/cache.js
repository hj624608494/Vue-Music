import storage from 'good-storage' // 对loaclStorage、sessionStorage 进行封装

const SEARCH_KEY = '__search__' // 搜索字段
const SEARCH_MAX_LEN = 15 // 最大缓存数据

const PLAY_KEY = '__play__' // 历史播放
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__' // 喜爱
const FAVORITE_MAX_LEN = 200

// 处理重复数据并把数据进行排序
function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare) // 查找数组里面是否有这个元素
  // 第一条数据
  if (index === 0) {
    return
  }
  // 数据存在
  if (index > 0) {
    arr.splice(index, 1) // 先把数据删除
  }
  // 把最新的数据追加到第一的位置
  arr.unshift(val)
  // 超过最大值的时候把最后一项移除
  if (maxLen && arr.length > maxLen) {
    arr.pop() // 移除最后一项
  }
}

// 删除指定缓存的数据
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare) // 查询是否存在
  if (index > -1) { // 存在的话直接移除
    arr.splice(index, 1)
  }
}

// 缓存搜索历史
export function saveSearch (query) {
  let searches = storage.get(SEARCH_KEY, []) // 获取数据
  // 对数据进行处理
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  // 把数据处理完后写入缓存
  storage.set(SEARCH_KEY, searches)
  // 最后返回
  return searches
}
// 删除指定缓存
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, []) // 获取缓存的数据
  deleteFromArray(searches, (item) => {
    return item === query
  })
  // 把缓存出来的新的数据加入
  storage.set(SEARCH_KEY, searches)
  return searches
}
// 清空搜索缓存
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}
// 读取搜索缓存
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}

// 保存播放记录缓存
export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

// 获取播放记录缓存
export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}

// 收藏保存
export function saveFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 删除收藏
export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 读取收藏
export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}

