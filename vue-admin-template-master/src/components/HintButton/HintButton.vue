<template>
  <a :title="title" style="margin:10px 0">
    <el-button v-bind="$attrs" v-on="$listeners"></el-button>
  </a>
</template>
<script>
export default {
  name:'HintButton',
  props:['title'],
  mounted(){
    
  }
}
</script>

<style lang="less" scoped>
  
</style>