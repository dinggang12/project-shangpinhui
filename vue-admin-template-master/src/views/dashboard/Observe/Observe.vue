<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="12">
        <search1></search1>
      </el-col>
      <el-col :span="12">
        <category></category>
      </el-col>
    </el-row>
  </div>
</template>
  
<script>

import Category from './Category.vue';
import Search1 from './Search1.vue'
export default {
  name:'Observe',
  components:{
    Search1,
    Category
  }
}
</script>

<style>

</style>