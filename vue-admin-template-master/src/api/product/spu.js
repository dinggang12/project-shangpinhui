import request from '@/utils/request'

//获取spu列表数据   GET /admin/product/{page}/{limit}  category3Id
export const reqSpuList=(page,limit,category3Id)=>request({url:`/admin/product/${page}/${limit}`,method:'get',params:{category3Id}})


//获取某一个spu信息：GET / admin / product / getSpuById / {spuId}
export const reqSpu=(spuId)=>request({url:`/admin/product/getSpuById/${spuId}`,method:'get'})


//获取品牌信息数据/admin/product/baseTrademark/getTrademarkList get
export const reqTradeMarkList=()=>request({url:'/admin/product/baseTrademark/getTrademarkList',method:'get'})

//获取SPU图片 /admin/product/spuImageList/{spuId}
export const reqSpuImageList=(spuId)=>request({url:`/admin/product/spuImageList/${spuId}`,method:'get'})

//获取全部销售属性 GET /admin/product/baseSaleAttrList 一共三个
export const reqBaseSaleAttrList=()=>request({url:'/admin/product/baseSaleAttrList',method:'get'})



// {
//   "category3Id": 0,
//   "description": "string",
//   "id": 0,
//   "spuImageList": [
//     {
//       "id": 0,
//       "imgName": "string",
//       "imgUrl": "string",
//       "spuId": 0
//     }
//   ],
//   "spuName": "string",
//   "spuSaleAttrList": [
//     {
//       "baseSaleAttrId": 0,
//       "id": 0,
//       "saleAttrName": "string",
//       "spuId": 0,
//       "spuSaleAttrValueList": [
//         {
//           "baseSaleAttrId": 0,
//           "id": 0,
//           "isChecked": "string",
//           "saleAttrName": "string",
//           "saleAttrValueName": "string",
//           "spuId": 0
//         }
//       ]
//     }
//   ],
//   "tmId": 0
// }


//修改spu或者添加spu 对于修改或者添加，携带给服务器的参数大致是一样的，看是否带id
//POST /admin/product/saveSpuInfo   POST /admin/product/updateSpuInfo
export const reqAddOrUpdateSpu=(spuInfo)=>{
  if(spuInfo.id){
    return request({url:'/admin/product/updateSpuInfo',method:'post',data:spuInfo})
  }else{
    return request({url:'/admin/product/saveSpuInfo',method:'post',data:spuInfo})
  }
}

//删除spu的接口 DELETE /admin/product/deleteSpu/{spuId}
export const reqDeleteSpu=(spuId)=>request({url:`/admin/product/deleteSpu/${spuId}`,method:'delete'})


//获取图片的接口GET /admin/product/spuImageList/{spuId}
//export const reqSpuImageList=(spuId)=>request({url:`/admin/product/spuImageList/${spuId}`,method:'get'})

//获取销售属性的数据 GET /admin/product/spuSaleAttrList/{spuId}
export const reqSpuSaleAttrList=(spuId)=>request({url:`/admin/product/spuSaleAttrList/${spuId}`,method:'get'})

//获取平台属性的数据GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
export const reqAttrInfoList=(category1Id,category2Id,category3Id)=>request({url:`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,method:'get'})

//增加sku POST /admin/product/saveSkuInfo
export const reqAddSku=(skuInfo)=>request({url:'/admin/product/saveSkuInfo',method:'post',data:skuInfo})



//获取sku列表数据 GET /admin/product/findBySpuId/{spuId}
export const reqSkuList=(spuId)=>request({url:`/admin/product/findBySpuId/${spuId}`,method:'get'})