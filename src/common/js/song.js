import {getLyric, getSongs} from '@/api/song'
import {ERR_OK, Guid} from '@/api/config'
import {Base64} from 'js-base64'

// 结构类
export default class Song {
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id // 歌曲id
    this.mid = mid // 歌曲mid
    this.singer = singer // 歌手
    this.name = name // 歌名
    this.album = album // 专辑名称
    this.duration = duration // 歌曲时长
    this.image = image // 专辑图
    this.url = url // 歌曲地址
  }
  // 歌词获取
  getLyric () {
    // 如果歌词存在就不要给他二次请求
    if (this.lyric) {
      // 因为接口请求是一个Promise 所以需要返回Promise
      return Promise.resolve(this.lyric)
    }
    // 异步处理数据
    return new Promise((resolve, reject) => {
      // 递归调用
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric) // 对Base64位的歌词解析
          resolve(this.lyric) // 歌词返回
        } else {
          // eslint语法 请务必在reject的时候new Error
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

// 创建歌曲工厂方法
export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid, // 歌曲路径也可以用这个
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval, // 歌曲时长以秒作为单位
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: ''
  })
}

// 分隔多个歌手
export function filterSinger (singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  // 循环歌手
  singer.forEach((s) => {
    ret.push(s.name)
  })
  // 返回对数据进行分割
  return ret.join('/')
}

// 歌曲播放地址
export function getSongUrl (song, mId) {
  getSongs(mId).then((res) => {
    if (res.code === ERR_OK) {
      if (res.data.items) {
        let item = res.data.items[0];
        song.url = `http://dl.stream.qqmusic.qq.com/${item.filename}?vkey=${item.vkey}&guid=${Guid}&fromtag=66`
      }
    }
  })
}
