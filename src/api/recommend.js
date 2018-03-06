import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'
import axios from 'axios'
// 自定义请求头
axios.defaults.baseURL = '/api'

// 获取推荐接口的数据
export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';

  const data = Object.assign({}, commonParams, options, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  // 返回结构
  return jsonp(url, data, options)
}

// 获取推荐歌单
export function getDiscList () {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  const data = Object.assign({}, {
    callback: 'recom6722418763006688',
    g_tk: 1021978079,
    jsonpCallback: 'recom6722418763006688',
    hostUin: 0,
    format: 'jsonp',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    data: '{"comm":{"ct":24},"recomPlaylist":{"method":"get_hot_recommend","param":{"async":1,"cmd":2},"module":"playlist.HotRecommendServer"}}'
  })

  return jsonp(url, data)
}

// 推荐列表详情页
export function getDiscSong (disstid) {
  const data = Object.assign({}, {
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    disstid,
    format: 'jsonp',
    g_tk: 190876849,
    jsonpCallback: 'playlistinfoCallback',
    loginUin: 1378993548,
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0
  })
  // 代理请求并且返回
  return axios.post('/discSong', data).then((res) => {
    return Promise.resolve(res.data)
  })
}
