<template>
  <div>
    <el-card style="margin: 20px 0">
      <!-- 三级联动全局组件 -->
      <category-select
        @getCategoryId="getCategoryId"
        :show="scene!=0"
      ></category-select>
    </el-card>
    <el-card>
    <!-- 底部这里将有三部分切换 -->
      <!-- 展示SPU列表的结构 -->
      <div v-show="scene==0">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addSpu">添加SPU</el-button>
        <el-table border style="width:100%" :data="records">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column label="SPU的名称" prop="spuName"></el-table-column>
          <el-table-column label="SPU的描述" prop="description"></el-table-column>
          <el-table-column label="操作">
            <!-- 作用域插槽，放四个按钮 -->
            <template slot-scope="{ row, $index }">
              <hint-button type="success" icon="el-icon-plus" size="mini" title="添加spu" @click="addSku(row)"></hint-button>
              <hint-button type="warning" icon="el-icon-edit" size="mini" title="修改spu" @click="updateSpu(row)"
                ></hint-button>
              <hint-button type="info" icon="el-icon-info" size="mini" title="查看当前spu全部的sku列表" @click="handler(row)"
                ></hint-button>
              <el-popconfirm title="这是一段内容确定删除吗?" @onConfirm="deleteSpu(row)">
                <hint-button type="danger" icon="el-icon-delete" size="mini" title="删除spu"  slot="reference"></hint-button>
              </el-popconfirm>
              
            </template>
          </el-table-column>
        </el-table>
        <el-pagination style="text-align:center"
          :total="total"
          :current-page="page"
          :page-size="limit"
          :page-sizes="[3, 5, 10]"
          layout="prev,pager,next,jumper,->,sizes,total"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
      <spu-form v-show="scene==1" @changeScene="changeScene" ref="spu"></spu-form>
      <sku-form v-show="scene==2" ref="sku" @changeScenes="changeScenes"></sku-form> 
    </el-card>

    <el-dialog :title="`${spu.spuName}的sku列表`" :visible.sync="dialogTableVisible" :before-close="close">
      <!-- table展示sku的列表 -->
      <el-table :data="skuList" border v-loading="loading">
        <el-table-column  label="名称" prop="skuName"></el-table-column>
        <el-table-column  label="价格" prop="price"></el-table-column>
        <el-table-column  label="重量" prop="weight"></el-table-column>
        <el-table-column  label="默认图片" prop="prop">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" style="width:100px;height:100px">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import CategorySelect from "@/components/CategorySelect/CategorySelect.vue";
import SkuForm from './SkuForm.vue';
import SpuForm from './SpuForm.vue';
import { done } from 'nprogress';
export default {
  components: { CategorySelect, SkuForm, SpuForm },
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      //控制三级联动的可操作性
      page:1,//当前第几页
      limit:3,//每页展示几条数据
      records:[],//存储SPU列表的数据
      total:0,//分页器一共多少条数据
      scene:0,//0代表展示spu列表数据，1代表添加或者修改spu，2代表添加sku
      dialogTableVisible:false,//控制dialog对话框的显示与隐藏
      spu:'',
      skuList:[],//存储sku列表的数据
      loading:true,//表格添加加载的效果
    };
  },
  name: "Spu",
  methods: {
    //三级联动的自定义事件，可以把子组件的相应id传递给父组件
    getCategoryId({ categoryId, level }) {
      //categoryId可以获取一级二级三级分类的id
      //level 区分几级id
      if (level == 1) {
        this.category1Id = categoryId;
        //清除二三级id
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        //清除三级id
        this.category3Id = "";
      } else if (level == 3) {
        this.category3Id = categoryId;
        //获取SPU列表的数据进行展示
        this.getSpuList();
      }
    },
    //获取SPU列表的数据
    async getSpuList(pages=1) {
      this.page=pages;
      const {page,limit,category3Id} = this;
      let result = await this.$API.spu.reqSpuList(page,limit,category3Id);
      if(result.code==200){
        this.total=result.data.total;
        this.records=result.data.records;
      }
    },
    // //点击分页器的第几页按钮的回调
    // handleCurrentChange(page){
    //   this.page=page;
    //   this.getSpuList()
    // }
    //当某一页展示数据的条数发生变化
    handleSizeChange(limit){
      //修改参数，再次发请求
      this.limit=limit;
      this.getSpuList()
    },
    //添加SPU按钮的回调
    addSpu(){
      this.scene=1
      //通知子组件SpuForm发请求获取品牌数据和销售属性数据--2个
      this.$refs.spu.addSpuData(this.category3Id)
    },
    //修改某一个SPU
    updateSpu(row){
      this.scene=1;
      //获取子组件spuform子组件
      //在父组件中可以通过$refs获取子组件的属性和方法
      this.$refs.spu.initSpuData(row)
    },
    //SPUForm自定义事件
    changeScene({scene,flag}){
      //flag这个形参为了区分保存按钮是添加还是修改
      this.scene=scene
      //获取spu列表数据
      if(flag=='修改'){
        this.getSpuList(this.page)
      }else{
        this.getSpuList()
      }
      
    },
    //删除spu按钮的回调
    async deleteSpu(row){
      let result = await this.$API.spu.reqDeleteSpu(row.id)
      if(result.code==200){
        this.$message({
          type:'success',
          message:'删除成功'
        })

        this.getSpuList(this.records.length>1?this.page:this.page-1)
      }
    },
    //添加sku按钮的回调
    addSku(row){
      this.scene=2;
      //父组件调用子组件的方法 ，让子组件发请求 ，3个
      this.$refs.sku.getData(this.category1Id,this.category2Id,row)
    },
    //skuForm通知父组件修改场景
    changeScenes(scene){
      this.scene=scene
    },
    //查看sku按钮的回调
    async handler(spu){
      //点击按钮的时候，对话框可见
      this.dialogTableVisible=true
      //保存spu的信息
      this.spu=spu;
      let result  = await this.$API.spu.reqSkuList(spu.id)
      if(result.code==200){
        this.skuList=result.data
        //loading隐藏
        this.loading=false
      }
    },
    //关闭对话框的回调
    close(done){
      this.loading=true;
      //清除sku列表的数据
      this.skuList=[];
      //关闭对话框
      done()
    }

  },
};
</script>

<style lang="less" scoped>
</style>