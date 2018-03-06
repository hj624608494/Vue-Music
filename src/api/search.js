import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

// 热门搜索关键词
export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

// 搜索框搜索
export function Search (query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    platform: 'h5',
    needNewCode: 1,
    w: query, // 输入内容
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0, // 要不要检索歌手
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage, // 加载数量
    n: perpage, // 每次加载数量
    p: page, // 当前页数
    remoteplace: 'txt.mqq.all',
    uid: 0
  })

  return jsonp(url, data, options)
}
