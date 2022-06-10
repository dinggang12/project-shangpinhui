<template>
  <div>
    <!-- 按钮 -->
    <el-button type="primary" icon="el-icon-pius" style="margin:10px 0px" @click="showDialog">添加</el-button>
    <!-- 表格组件 -->
    <el-table style="width:100%" border :data="list">
      <!-- 每一列 -->
      <el-table-column type="index" label="序号" width="80px" align="center">
        
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <!-- 作用域插槽 -->
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" style="width:100px;height:100px">
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{row,$index}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTradeMark(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination :total="total" :current-page="page" :page-size="limit" :page-sizes="[3,5,10]" :pager-count="7" style="margin-top:20px;textAlign:center" layout="prev,pager,next,jumper,->,sizes,total" @current-change="getPageList" @size-change="handleSizeChange">
    </el-pagination>
    <!-- 对话框 -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <el-form style="width:80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 上传图片 不能使用v-model，不是表单元素 -->
          <el-upload class="avatar-uploader" action="/dev-api/admin/product/fileUpload" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name:'TradeMark',
  data(){
    //自定义校验规则
    var validateTmName = (rule, value, callback) => {
      if (value.length<2||value.length>10) {
        callback(new Error('品牌名称是需要2-10'));
      } else {
        callback();
      }
    };
    return{
      page:1,//代表分页器第几页
      limit:3,//当前页数展示数据条数
      total:0,//总共的数据条数
      list:[],//列表展示数据
      dialogFormVisible:false,//对话框显示和隐藏的
      tmForm:{//收集品牌的信息：对象身上的属性，不能瞎写，要看文档的字段
        tmName:"",
        logoUrl:'',
      },
      //表单验证的规则
      rules:{
        // tmName:[//品牌名称
        //     { required: true, message: '请输入品牌名称', trigger: 'blur' },
        //     { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
        //   ],
        tmName:[//品牌名称
            { required: true, message: '请输入品牌名称', trigger: 'blur' },
            { validator: validateTmName, trigger: 'change' }
          ],
        logoUrl:[//品牌LOGO
            { required: true, message: '请选择品牌的图片'}
          ],
      }
    }
  },
  mounted(){
    //组件一挂载完毕就发请求
    //获取列表数据的方法
    this.getPageList()
  },
  methods:{
    //获取品牌列表的数据
    async getPageList(pager=1){
      this.page=pager
      const {page,limit} = this
      //获取品牌列表的接口
      let result = await this.$API.tradeMark.reqTradeMarkList(page,limit)
      if(result.code==200){
        //分别是展示数据的总条数与列表展示的数据
        this.total = result.data.total;
        this.list = result.data.records;
      }
    },
    //当分页器某一页需要展示数据条数发生变化的时候会触发
    handleSizeChange(limit){
      this.limit=limit
      this.getPageList()
    },
    //点击添加品牌的按钮
    showDialog(){
      //显示对话框
      this.dialogFormVisible=true
      //清除数据
      this.tmForm = {tmName:'',logoUrl:''}
    },
    //修改某一个品牌
    updateTradeMark(row){
      //row代表当前用户选中的品牌的信息
      //显示对话框
      this.dialogFormVisible=true
      //将已有的信息赋值给表单进行展示
      //tmForm存储的即为服务器返回的品牌信息
      this.tmForm={...row}//浅拷贝
    },
    //图片长传成功
    handleAvatarSuccess(res, file) {
      //res，是长传成功之后，返回的数据
      //file,是上传成功之后服务器返回的数据
      //收集品牌图片的数据
      this.tmForm.logoUrl=res.data
    },
    //图片上传之前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    //添加按钮，（添加品牌或者修改品牌）
    addOrUpdateTradeMark(){
      //当全部验证的字段通过，再去书写逻辑
      this.$refs.ruleForm.validate(async (vaild)=>{
        if(vaild){//如果全部字段都符合条件
          this.dialogFormVisible=false
          //发请求（添加品牌或者修改品牌）
          let result = await this.$API.tradeMark.reqAddOrUpdateTradeMark(this.tmForm);
          if(result.code==200){
            //弹出信息
            this.$message({
              message:this.tmForm.id ? '修改品牌成功' : '添加品牌成功',
              type:'success'
            })
            //添加或者修改品牌成功之后，再次获取数据
            this.getPageList(this.tmForm.id?this.page:1)
          }
        }else{
          console.log("error submit")
          return false
        }
      })
      
    },
    //删除品牌
    deleteTradeMark(row){
      this.$confirm(`你确定删除${row.tmName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        //通过用户点击确定按钮时触发
        //向服务器发请求
        let result=await this.$API.tradeMark.reqDeleteTradeMark(row.id)
        if(result.code==200){
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getPageList(this.list.length>1?this.page:this.page-1)
        } 
      }).catch(() => {
        //通过用户点击取消按钮时触发
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    }
  }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>