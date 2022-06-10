<template>
  <div>
    <el-form label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option v-for="tm in tradeMarkList" :key="tm.id" :label="tm.tmName" :value="tm.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input type="textarea" rows="4" placeholder="描述" v-model="spu.description"></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!-- 上传图片  -->
        <!-- action：图片上传的地址 list-type文件列表的类型 preview预览，remove删除-->
        <!-- file-list 照片墙需要展示的数据：元素必须要有name和url属性-->
        <el-upload action="/dev-api/admin/product/fileUpload" list-type="picture-card" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :file-list="spuImageList" :on-success="handlerSuccess">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select :placeholder="`还有${unSelectSaleAttr.length}未选择`" v-model="attrIdAndAttrName">
          <el-option :label="unselect.name" :value="`${unselect.id}:${unselect.name}`" v-for="unselect in unSelectSaleAttr" :key="unselect.id"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" :disabled="!attrIdAndAttrName" @click="addSaleAttr">添加销售属性</el-button>
      </el-form-item>

      <el-form-item>
        <!-- 展示当前spu属于自己的销售属性 -->
        <el-table border :data="spu.spuSaleAttrList">
          <el-table-column label="序号" width="80px" type="index" align="center"></el-table-column>
          <el-table-column label="属性名" prop="saleAttrName"></el-table-column>
          <el-table-column label="属性值名称列表" prop="prop">
            <template slot-scope="{row,$index}">
              <el-tag :key="tag.id" v-for="(tag,index) in row.spuSaleAttrValueList" closable :disable-transitions="false" @close="row.spuSaleAttrValueList.splice(index,1)">{{tag.saleAttrValueName}}</el-tag>  
              <!-- 底下的结构可以当作span和input的切换 -->
              <el-input class="input-new-tag" v-if="row.inputVisible" v-model="row.inputValue" ref="saveTagInput" size="small" @blur="handleInputConfirm(row)"></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="addSaleAttrValue(row)">添加</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="spu.spuSaleAttrList.splice($index,1)"></el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-form-item>
      <el-form-item>
        <el-button @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
      
    </el-form>
  </div>
</template>
<script>
export default {
  name:'SpuForm',
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      //spu属性初始化的时候是空的对象,在修改spu的时候，会向服务器发请求，返回spu对象，在修改的时候可以利用服务器返回的这个对象收集最新的数据交给服务器
      //添加spu，如果是添加spu的时候并没有向服务器发请求，数据收集到哪里？{spu}，收集数据的时候有哪些字段
      spu:{//存储spu信息属性
        "category3Id": 0,//三级分类的id
        "description": "",//描述
        "spuImageList": [//收集spu图片的信息
          // {
          //   "id": 0,
          //   "imgName": "string",
          //   "imgUrl": "string",
          //   "spuId": 0
          // }
        ],
        "spuName": "",//spu的名称
        "tmId": '',//品牌的id
        "spuSaleAttrList": [//平台属性与属性值的收集
          // {
          //   "baseSaleAttrId": 0,
          //   "id": 0,
          //   "saleAttrName": "string",
          //   "spuId": 0,
          //   "spuSaleAttrValueList": [
          //     {
          //       "baseSaleAttrId": 0,
          //       "id": 0,
          //       "isChecked": "string",
          //       "saleAttrName": "string",
          //       "saleAttrValueName": "string",
          //       "spuId": 0
          //     }
          //   ]
          // }
        ]
      },
      tradeMarkList:[],//存储品牌的信息
      spuImageList:[],//存储spu图片的数据
      saleAttrList:[],//存储销售属性的数据
      attrIdAndAttrName:'',//收集未选择销售属性的id
    };
  },
  computed:{
    //计算出还未选择的销售属性
    unSelectSaleAttr(){
      //整个平台的销售属性：颜色、尺寸、版本this.saleAttrList
      //当前spu拥有的属于自己的销售属性spu.spuSaleAttrList
      //数组的过滤方法，可以从已有的数组里面过滤出用户需要的元素,并且返回一个新的数组
      //every，会返回一个布尔值，要么真
      return this.saleAttrList.filter((item)=>{
        return this.spu.spuSaleAttrList.every((item1)=>{
          return item.name!=item1.saleAttrName;
        })
      })
    }
  },
  methods: {
    addSaleAttr(){
      //已经收集到了销售属性的信息
      //把收集到的销售属性的数据进行分割
      const [baseSaleAttrId,saleAttrName] = this.attrIdAndAttrName.split(":");
      //向spu.spuSaleAttrList添加新的属性
      let newSaleAttr = {baseSaleAttrId,saleAttrName,spuSaleAttrValueList:[]};
      //添加新的销售属性
      this.spu.spuSaleAttrList.push(newSaleAttr);
      //清空数据
      this.attrIdAndAttrName=''
    },
    handleRemove(file, fileList) {
      //file代表的是删除的那张图片
      //fileList代表照片墙删除某一张图片后剩余的图片
      //console.log(file, fileList);
      //收集照片墙图片的数据
      //对于fileList中的图片有name和url字段
      //对于服务器而言是不需要name，url
      this.spuImageList=fileList
    },
    //照片墙图片预览的回调
    handlePictureCardPreview(file) {
      //将图片中的地址复制给这个属性
      this.dialogImageUrl = file.url;
      //控制dialog的显示与隐藏
      this.dialogVisible = true;
    },
    //照片墙图片上传成功的回调
    handlerSuccess(resonse,file,fileList){
      this.spuImageList=fileList
    },
    //初始化SpuForm的数据
    async initSpuData(spu){
      //获取spu信息的数据
      let spuResult = await this.$API.spu.reqSpu(spu.id);
      if(spuResult.code==200){
        //在修改spu的时候，需要向服务器发请求，把服务器返回的数据（对象）,赋值给spu属性
        this.spu=spuResult.data
      }
      //获取品牌的信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
      if(tradeMarkResult.code==200){
        this.tradeMarkList=tradeMarkResult.data
      }
      //获取spu图片的数组
      let spuImageResult = await this.$API.spu.reqSpuImageList(spu.id)
      if(spuImageResult.code==200){
        let listArr=spuImageResult.data;
        //由于照片墙显示图片的数据需要数组，数组里面的元素需要有那么字段
        listArr.forEach(item => {
          item.name=item.imgName;
          item.url=item.imgUrl;
        });
        this.spuImageList=listArr
      }
      //获取平台全部的销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList()
      if(saleResult.code==200){
        this.saleAttrList=saleResult.data
      }
    },
    //添加按钮的回调
    addSaleAttrValue(row){
      //点击销售属性值当中添加按钮的时候，需要展示由button变为input
      this.$set(row,'inputVisible',true)
      //通过响应式数据inputValue字段收集新增的销售属性值
      this.$set(row,'inputValue','')
    },
    //el-input失去焦点的事件
    handleInputConfirm(row){
      //修改inputVisible为false,就显示button
      //解构出销售属性解构的数据
      const {baseSaleAttrId,inputValue} = row;
      //新增的销售属性值的名称不能为空
      if(inputValue.trim() == ''){
        this.$message('属性值不能为空')
        return;
      }
      //属性值不能重复
      let result = row.spuSaleAttrValueList.every((item)=>{
        return item.saleAttrValueName!=inputValue
      })
      if(!result) return 
      let newSaleAttrVale={
        baseSaleAttrId,
        saleAttrValueName : inputValue
      }
      //新增
      row.spuSaleAttrValueList.push(newSaleAttrVale)
      row.inputVisible=false
    },
    //保存按钮的回调
    async addOrUpdateSpu(){
      //整理参数,整理照片墙的数据
      //携带对于图片，需要携带imgName和imgUrl字段
      this.spu.spuImageList = this.spuImageList.map(item=>{
        return {
          imgName:  item.name,
          imgUrl: (item.response&&item.response.data)||item.url
        }
      })
      let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu)
      if(result.code==200){
        this.$message({
          type:'success',
          message:'保存成功'
        })
        //通知父组件回到场景0
        this.$emit('changeScene',{scene:0,flag:this.spu.id?'修改':'添加'})
      }
      //清除数据
      Object.assign(this._data,this.$options.data())
    },
    //点击添加SPU按钮的时候，发请求的回调
    async addSpuData(category3Id){
      //添加spu的时候收集三级分类的id
      this.spu.category3Id=category3Id
      //获取品牌的信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
      if(tradeMarkResult.code==200){
        this.tradeMarkList=tradeMarkResult.data
      }
      //获取平台全部的销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList()
      if(saleResult.code==200){
        this.saleAttrList=saleResult.data
      }
    },
    //取消按钮
    cancel(){
      //取消按钮的回调，通知父亲切换场景为0
      this.$emit('changeScene',{scene:0,flag:''})
      //清理数据,把b对象的东西和a合并
      Object.assign(this._data,this.$options.data())
    }
  },
}
</script>

<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
