export default {
  data() {
    return {
      //数据更新时间 s
      updateTime:10000,
      //是否开启鼠标悬浮数据停止更新
      isSuspension:false,
      //X轴坐标小数位数
      xDigits:4,
      //Y轴坐标小数位数
      yDigits:4,
      //提示框数据
      tipDate:[
        {label:'委托价',value:'123'},
        {label:'累计',value:'798'},
      ],
      //币对名称
      coinName:'BTC/USDT',
      //是否对数据进行优化处理
      isOptimizeData:false,
      //请求数据的地址
      url:'http://test.xd.local/api/coin-exchange/v1/exchange/getDepth',
      //容器id
      containerId:'XD-depth',
      //画图数据的倾斜度,取值在0-1
      gradient:0.2,



      //loading状态
      loadingType:true,
    }
  }
}
