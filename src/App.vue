<script setup lang="ts">
</script>

<template>
  <div>
    <router-view/>
  </div>
</template>

<style>
/* 全局重置样式，消除浏览器默认边距 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
