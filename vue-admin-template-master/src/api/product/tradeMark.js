//获取品牌管理的数据的模块
import request from '@/utils/request';
//获取品牌列表的接口 GET /admin/product/baseTrademark/{page}/{limit}
export const reqTradeMarkList=(page,limit)=>request({url:`/admin/product/baseTrademark/${page}/${limit}`,method:'get'});


//切忌，对于新增的品牌，不需要传递id 。id由服务器生成
export const reqAddOrUpdateTradeMark = (tradeMark) => {
  if(tradeMark.id){
    //修改品牌 PUT /admin/product/baseTrademark/update id logo tmName
    return request({url:'/admin/product/baseTrademark/update',method:'put',data:tradeMark})
  }else{
    //添加品牌的操作 POST /admin/product/baseTrademark/save 品牌名称，品牌的logo
    return request({url:'/admin/product/baseTrademark/save',method:'post',data:tradeMark})
  }
}

//删除某个品牌的请求 DELETE /admin/product/baseTrademark/remove/{id}
export const reqDeleteTradeMark = (id)=>request({url:`/admin/product/baseTrademark/remove/${id}`,method:'delete'})