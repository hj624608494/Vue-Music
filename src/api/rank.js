import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

// 排行榜列表
export function Rank () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 190876849,
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

// 排行榜详情列表
export function RankDetail (topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    tpl: 3,
    page: 'detail',
    type: 'top',
    topid: topid

  })
  return jsonp(url, data, options)
}
