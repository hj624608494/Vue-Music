<template>
  <div id="app">
    <MHeader></MHeader>
    <Tab></Tab>
    <!-- keep-alive 用于把数据缓存在内存中 减少http请求 -->
    <keep-alive>
        <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>
<script>
import MHeader from './components/m-header/m-header' // 头部
import Tab from './components/tab/tab' // 标题栏切换
import Player from '@/components/player/player' // 播放器
export default {
  // 注册组件并使用
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style lang="stylus" scoped>
</style>
