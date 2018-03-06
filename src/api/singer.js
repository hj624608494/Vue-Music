import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

// 获取歌手列表
export function getSingerList () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    g_tk: 1021978079,
    hostUin: 0,
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })

  return jsonp(url, data, options)
}

// 获取歌手详情列表
export function getSingerDetail (Singermid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 1021978079,
    hostUin: 0,
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    singermid: Singermid,
    order: 'listen',
    begin: 0,
    num: 30,
    songstatus: 1
  })

  return jsonp(url, data, options)
}
