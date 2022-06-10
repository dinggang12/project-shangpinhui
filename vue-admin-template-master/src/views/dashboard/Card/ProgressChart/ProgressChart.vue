<template>
  <div class="charts" ref="charts">
  </div>
</template>

<script>
//引入echarts
import echarts from "echarts";

export default {
  name: 'ProgressChart',
  mounted(){
    //初始化echarts实例
    let lineCharts = echarts.init(this.$refs.charts);
    //配置数据
    lineCharts.setOption({
      xAxis:{
        show:false,//隐藏x轴
        //最小值与最大值
        min:0,
        max:100
      },
      yAxis:{
        show:false,
        type:'category'
      },
      //系列
      series:[
        {
          type:'bar',
          data:[78],
          color:"cyan",
          //柱状图的宽度
          barWidth:10,
          color:"yellowgreen",
          //背景颜色
          showBackground:true,
          backgroundStyle:{
            color:'#eee'
          },
          //文本
          label:{
            show:true,
            formatter:'|',
            //文本标签的位置调式
            position:"right"
          }
        }
      ],
      //布局模式
      grid:{
        left:0,
        top:0,
        bottom:0,
        right:0
      }

    })
  }
}
</script>

<style scoped>
  .charts{
    width: 100%;
    height:100%;
  }
</style>
