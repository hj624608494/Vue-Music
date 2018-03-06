import originJsonp from 'jsonp' // 引入jsonp

// jsonp封装
export default function jsonp (url, data, option) {
  // 判断是否存在?
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  // resolve 调用成功时候调用 reject 调用失败时候调用
  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data) // 成功就返回resolve的data
      } else {
        reject(err) // 失败就返回reject的err
      }
    })
  })
}

// 把地址参数进行过滤拼接
export function param (data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  // 因为拼接的url 所以先处理第一个拼接的&去除
  return url ? url.substring(1) : ''
}
