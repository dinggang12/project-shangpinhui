<template>
  <div>
    <card></card>
    <sale></sale>
    <observe></observe>
  </div>
</template>

<script>

import Card from './Card/Card.vue'
import Observe from './Observe/Observe.vue'
import Sale from './Sale/Sale.vue'
export default {
  name: 'Dashboard',
  components:{
    Card,
    Sale,
    Observe
  },
  mounted(){
    this.$store.dispatch('getData')
  }
}
</script>

<style scoped>
  
</style>
