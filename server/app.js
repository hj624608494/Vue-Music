var express = require('express');
var BodyParser = require('body-parser');
var path = require('path');
var app = express();
var axios = require('axios');
var Routes = express.Router();

var cors = require('cors');

app.use(BodyParser.json());

app.use(cors({
  origin: ['http://localhost:8080'],
  methods: ['GET', 'POST'],
  alloweHeaders: ['Conten-Type', 'Authorization']
}));

app.use('/api', Routes);

// 歌词请求
Routes.post('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://y.qq.com/portal/player.html',
      host: 'c.y.qq.com'
    },
    params: req.body
  }).then((response) => {
    var ret = response.data
    // 判断返回字符是否为字符串 处理jsoncallback为字符串的情况
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/ // 处理callback数据
      var matches = ret.match(reg) // match 检索是否存在数值
      if (matches) {
        // json转换
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    res.json({error: '请求错误'})
  })
})

// 推荐列表歌曲页面
Routes.post('/discSong', function (req, res) {
  var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.body
  }).then((response) => {
    var ret = response.data
    // 判断返回字符是否为字符串 处理jsoncallback为字符串的情况
    if (typeof ret === 'string') {
      var reg = /^\w+\(({.+})\)$/ // 处理jsonp格式的数据
      var matches = ret.match(reg) // match 检索是否存在数值
      if (matches) {
        // json转换
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    res.json({error: '请求错误'})
  })
})

// 静态文件绑定
app.use(express.static(path.join(__dirname, '../dist')));
// 所有请求都绑定到打包后的index
app.get('*',function (req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
})

app.listen(8888, function () {
  console.log('服务端已经开启')
})
