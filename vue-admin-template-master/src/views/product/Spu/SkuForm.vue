<template>
  <div>
    <el-form>
      <el-form-item label="spu的名称">
        {{spu.spuName}}
      </el-form-item>

      <el-form-item label="SKU名称">
        <el-input placeholder="sku名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>

      <el-form-item label="价格(元)">
        <el-input placeholder="价格(元)" type="number" v-model="skuInfo.price"></el-input>
      </el-form-item>

      <el-form-item label="重量(千克)">
        <el-input placeholder="重量(千克)" v-model="skuInfo.weight"></el-input>
      </el-form-item>

      <el-form-item label="规格描述">
        <el-input type="textarea" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true">
          <el-form-item :label="attr.attrName" v-for="attr in attrInfoList" :key="attr.id">
            <el-select placeholder="请选择" v-model="attr.attrIdAndValueId">
              <el-option :label="attrValue.valueName" :value="`${attr.id}:${attrValue.id}`" v-for="attrValue in attr.attrValueList" :key="attrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true">
          <el-form-item :label="saleAttr.saleAttrName" v-for="saleAttr in spuSaleAttrList" :key="saleAttr.id">
            <el-select placeholder="请选择" v-model="saleAttr.attrIdAndValueId">
              <el-option :label="saleAttrValue.saleAttrValueName" :value="`${saleAttr.id}:${saleAttrValue.id}`" v-for="saleAttrValue in saleAttr.spuSaleAttrValueList" :key="saleAttrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table border :data="spuImageList" @selection-change="handleSelectionChange">
          <el-table-column label="" width="80px" type="selection"></el-table-column>
          <el-table-column label="图片" prop="prop">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" style="width:100px;height:100px">
            </template>
          </el-table-column>
          <el-table-column label="名称">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button v-if="row.isDefault==0" type="primary" @click="changeDefault(row)">设置默认</el-button>
              <el-button v-else>默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>

export default {
  name:'SkuForm',
  data(){
    return {
      spuImageList:[],//存储图片的信息
      spuSaleAttrList:[],//存储销售属性的信息
      attrInfoList:[],//存储平台属性的信息
      skuInfo:{//收集sku数据的字段
        //第一类收集的数据，父组件给的
        "category3Id": 0,
        "spuId": 0,
        "tmId": 0,
        //第二类，需要通过v-model收集的数据
        "price": 0,
        "weight": "",
        "skuDesc": "",
        //第三类，需要自己书写代码
        "skuDefaultImg": "",//默认图片
        "skuImageList": [//收集图片信息
          // {
          //   "id": 0,
          //   "imgName": "string",
          //   "imgUrl": "string",
          //   "isDefault": "string",
          //   "skuId": 0,
          //   "spuImgId": 0
          // }
        ],
        "skuName": "",
        "skuSaleAttrValueList": [//收集的是销售属性列表的数据
          // {
          //   "id": 0,
          //   "saleAttrId": 0,
          //   "saleAttrName": "string",
          //   "saleAttrValueId": 0,
          //   "saleAttrValueName": "string",
          //   "skuId": 0,
          //   "spuId": 0
          // }
        ],
        "skuAttrValueList": [//平台属性
          // {
          //   "attrId": 0,
          //   "attrName": "string",
          //   "id": 0,
          //   "skuId": 0,
          //   "valueId": 0,
          //   "valueName": "string"
          // }
        ],
      },
      spu:{},
      imageList:[],//收集图片的数据字段，但是需要注意，收集的数据缺少，isDefault字段
    }
  },
  methods:{
    //获取skuForm数据
    async getData(category1Id,category2Id,spu){
      //收集父组件给子组件的数据
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      this.spu=spu;
      //获取图片的数据
      let result = await this.$API.spu.reqSpuImageList(spu.id)
      if(result.code==200){
        let list = result.data
        list.forEach(item => {
          item.isDefault = 0;//0代表设置默认，1代表默认
        });
        this.spuImageList=list
      }
      //获取销售属性的数据
      let result1 = await this.$API.spu.reqSpuSaleAttrList(spu.id)
      if(result1.code==200){
        this.spuSaleAttrList=result1.data
      }
      //获取平台属性的数据
      let result2 = await this.$API.spu.reqAttrInfoList(category1Id,category2Id,spu.category3Id)
      if(result2.code==200){
        this.attrInfoList=result2.data
      }
    },
    //table表格复选框按钮的事件
    handleSelectionChange(params){
      //获取到用户选中图片的信息数据，但是当前收集的数据中，缺少isDefault字段
      this.imageList=params;
    },
    //排他
    changeDefault(row){
      //图片列表的数据isDefault变为0
      this.spuImageList.forEach(item=>{
        item.isDefault=0
      })
      row.isDefault = 1
      //设置默认图片的地址
      this.skuInfo.skuDefaultImg=row.imgUrl
    },
    //点击取消按钮
    cancel(){
      //自定义事件，让父组件切换场景为0
      this.$emit('changeScenes',0)
      //清除数据
      Object.assign(this._data,this.$options.data())
    },
    //点击保存按钮
    async save(){
      //整理参数
      //整理平台属性
      const {attrInfoList,skuInfo,spuSaleAttrList,imageList} = this
      //整理平台属性的方式1
      //新建数组
      // let arr = []
      // attrInfoList.forEach((item)=>{
      //   //当前平台属性用户进行选择
      //   if(item.attrIdAndValueId){
      //     const [attrId,valueId] = item.attrIdAndValueId.split(":");
      //     //携带服务器的参数是对象
      //     let obj = {valueId,attrId};
      //     arr.push(obj);
      //   }
      // })
      // skuInfo.skuAttrValueList = arr
      //整理平台属性的方式2
      let result = attrInfoList.reduce((prev,item)=>{
        if(item.attrIdAndValueId){
          const [attrId,valueId] = item.attrIdAndValueId.split(":");
          prev.push({attrId,valueId})
        }
        return prev
      },[])
      skuInfo.skuAttrValueList = result

      //整理销售属性
      let result1 = spuSaleAttrList.reduce((prev,item)=>{
        if(item.attrIdAndValueId){
          const [saleAttrId,saleAttrValueId] = item.attrIdAndValueId.split(":");
          prev.push({saleAttrId,saleAttrValueId})
        }
        return prev
      },[])
      skuInfo.skuSaleAttrValueList = result1

      //整理图片数据
      skuInfo.skuImageList = imageList.map(item=>{
        return {
          imgName : item.imgName,
          imgUrl : item.imgUrl,
          isDefault : item.isDefault,
          spuImgId : item.id
        }
      })
      //发请求
      let result2 = await this.$API.spu.reqAddSku(skuInfo)
      if(result2.code==200){
        this.$message({
          type:'success',
          message:'添加sku成功'
        })
        this.$emit('changeScenes',0)
      }
    }
  }
}
</script>

