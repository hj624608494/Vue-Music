export function hasClass (el, className) {
  // (^|\\s) 开头可以有内容或者有空白字符 (\\s|$)有空白字符或者直接结束
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  // 先转换成为数组
  let newClass = el.className.split(' ')
  newClass.push(className)
  // 在把他重新添加进去
  el.className = newClass.join(' ')
}

export function getData (el, name, val) {
  const prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)
}

let elementStyle = document.createElement('div').style
// 自定义css后缀
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform', // 谷歌
    Moz: 'MozTransform', // 火狐
    O: 'OTransform', // 欧朋
    ms: 'msTransform', // ie
    standard: 'transform' // 默认
  }
  // 循环判断当前浏览器是否存在拓展
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  // 如果都不支持就返回false
  return false
})()

// 判断上面的函数
export function prefixStyle (style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }
  // 前缀 + 样式获取第一个 然后toUpperCase转换大写
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
