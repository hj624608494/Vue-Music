// 返回一个随机数
function getRandomInt (min, max) {
  // Math.random 返回一个0到1（包括1）的随机
  // max - min + 1  +1是保证上限的值
  // Math.floor 因为Math.random是一个随机数 所以要利用floor向下取整
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// 歌曲打乱排序
export function shuffle (arr) {
  let _arr = arr.slice() // 避免直接修改传递的arr slice = 一个副本模式
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i) // 获取随机数
    let t = _arr[i] // 定义临时变量
    // 交换数据 打乱排序
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 搜索框延迟执行 处理被反复调用的问题
export function debounce (func, delay) {
  let timer
  return function (...args) {
    // 如果上一个还是执行 直接清除
    if (timer) {
      clearTimeout(timer)
    }
    // 重新使用一个新的计时器函数
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
