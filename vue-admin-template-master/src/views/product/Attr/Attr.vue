<template>
  <div>
    <el-card style="margin: 20px 0px">
      <category-select @getCategoryId="getCategoryId" :show="!isShowTable"></category-select>
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addAttr"
          >添加属性</el-button
        >
        <el-table style="width: 100%" border :data="attrList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="attrName"
            label="属性名称"
            width="150px"
          ></el-table-column>
          <el-table-column label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0px 20px"
              >
                {{ attrValue.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
            <template slot-scope="{ row, $index }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加属性或者修改属性的结构 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrInfo.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table
          border
          style="width: 100%; margin: 20px 0px"
          :data="attrInfo.attrValueList"
        >
          <el-table-column
            type="index"
            label="序号"
            align="center"
            width="80px"
          ></el-table-column>
          <el-table-column label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                placeholder="请输入属性值名称"
                v-model="row.valueName"
                size="mini"
                v-if="row.flag"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
                :ref="$index"
              ></el-input>
              <span v-else @click="toEdit(row,$index)" style="display: block">{{
                row.valueName
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <!-- 气泡确认框 -->
              <el-popconfirm :title="`确定删除${row.valueName}?`" @onConfirm="deleteAttrValue($index)">
                <el-button type="danger" icon="el-icon-delete" size="mini" slot="reference">
                </el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="addOrUpdateAttr" :disabled="attrInfo.attrValueList.length<1">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
//按需引入lodash当中的深拷贝
import cloneDeep from "lodash/cloneDeep";
import CategorySelect from "@/components/CategorySelect/CategorySelect.vue";
export default {
  components: { CategorySelect },
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [], //接收平台属性的字段
      isShowTable: true, //控制表格的显示与隐藏
      attrInfo: {
        //收集新增属性或者修改属性
        attrName: "", //属性名
        attrValueList: [
          //属性值
          // {
          //   "attrId": 0,//相应属性名的id
          //   "valueName": ""//属性值
          // }
        ],
        categoryId: 0, //category3Id
        categoryLevel: 3, //因为服务器也需要区分几级id
      },
    };
  },
  methods: {
    getCategoryId({ categoryId, level }) {
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        //代表三级分类的id有了
        this.category3Id = categoryId;
        //发请求获取平台属性
        this.getAttrList();
      }
    },
    //获取平台属性的数据
    async getAttrList() {
      //获取分类的id
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    addAttrValue() {
      //向属性值的数组里面添加元素
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, //对于修改某一个属性的时候，可以在已有的属性值基础上新增新的属性值
        valueName: "",
        flag: true,
      });
      //flag 给每一个属性值添加一个标记flag，用户切换查看模式与编辑模式，每一个属性值可以控制自己的模式
      this.$nextTick(()=>{
        this.$refs[this.attrInfo.attrValueList.length-1].focus()
      })
    },
    //添加属性按钮的回调
    addAttr() {
      //切换table显示与隐藏
      this.isShowTable = false;
      //清除数据
      this.attrInfo = {
        attrName: "", //属性名
        attrValueList: [
          //属性值
        ],
        categoryId: this.category3Id, //category3Id
        categoryLevel: 3, //因为服务器也需要区分几级id
      };
    },
    //修改某一个属性
    updateAttr(row) {
      this.isShowTable = false;
      //将选中的属性复制给attrInfo
      //由于数据结构中存在对象里面套数组，数组里面套对象
      this.attrInfo = cloneDeep(row);
      //在修改某一个属性的时候，将相应的属性值元素添加上flag这个标记
      this.attrInfo.attrValueList.forEach((item)=>{
        //这样书写可以给属性值添加flag字段，但视图没变，因为不是相应式数据
        // item.flag=false
        this.$set(item,'flag',false)
      })
    },
    //失去焦点的事件，切换查看模式，显示sapn
    toLook(row) {
      //row 当前用户添加的最新的属性值
      //当前的编辑模式变为查看模式，input消失，显示span
      //如果属性值为空。不能作为新的属性值，给用户提示，
      //新增的属性值不能与已有的重复
      if(row.valueName.trim()==''){
        this.$message('请你输入正常的属性值')
        return
      }
      let isRepat=this.attrInfo.attrValueList.some((item)=>{
        //需要将row从数组里面扣除
        if(row!=item){
          return row.valueName==item.valueName
        }
      })
      if(isRepat) return
      row.flag = false;
    },
    toEdit(row,index){
      //点击span变为input
      row.flag=true
      //获取input节点，实现自动聚焦
      //点击span的时候，切换为input，页面的重回重排需要时间
      //重绘重排input，所以不能不可能一点击span就能获取input
      this.$nextTick(()=>{//当所有节点渲染完成后执行
        //获取相应的表单元素获得聚焦
        this.$refs[index].focus()
      })
    },
    deleteAttrValue(index){
      //气泡确认框，确认按钮的回调
      //当前删除属性值的操作不需要发请求
      this.attrInfo.attrValueList.splice(index,1)
    },
    //点击保存按钮
    async addOrUpdateAttr(){
      //整理参数
      //如果用户添加很多属性值，且属性值为空的不应该提交给服务器
      //提交给服务器的数据中，不应该出现flag字段
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(item=>{
        if(item.valueName!=''){
          //删除掉flag属性
          delete item.flag
          return true
        }
      })
      //发请求
      try{
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo)
        //展示平台属性的信号量进行切换
        
        this.$message({
          type:'success',
          message:'保存成功'
        })
        this.isShowTable=true
        //保存之后需要再次获取平台属性进行展示
        this.getAttrList();
      }catch(error){
        this.$message('保存失败')
      }
      
    }
  },
};
</script>

<style lang="less" scoped>
</style>