const lists = {
  bgColor:'#FFFFFF',//背景色
  coordinateColor:'rgb(207, 209, 220)',//坐标轴颜色
  coordinateTextColor:'rgb(163, 175, 186)',//坐标轴文字颜色
  buyLineColor:'rgb(13, 168, 139)',//买盘折线颜色
  buyBgColor:'rgb(204, 232, 227)',//买盘面积填充颜色
  sellLineColor:'rgb(239, 86, 86)',//卖盘折线颜色
  sellBgColor:'rgb(251, 213, 219)',//卖盘面积填充颜色

  padding:[0,-1,28,0],//画布内间距padding--上，右，下，左        右边距为-1时，将自动计算右边距
  coordinateHeight:1,//坐标轴宽度
  calibrationHeight:4,//刻度线的长度
  coordinateTextFont:'12px SimHei',//坐标轴文字大小
  lineHeight:2,//折线线宽
  middleWidth:3,//图中间预留的宽度

  tipBgColor:'rgb(235, 240, 245)',//提示框背景色
  tipBorderColor:'rgb(235, 240, 245)',//提示框边框颜色
  tipFontLabelColor:'rgb(102, 114, 127)',//提示框文字颜色
  tipFontValueColor:'rgb(102, 114, 127)',//提示框数字颜色
  tipPointBorderColorBuy:'rgb(182, 229, 220)',//提示框圆点边框颜色  ---暂不支持透明底
  tipPointBorderColorSell:'rgb(250, 204, 204)',//提示框圆点边框颜色  ---暂不支持透明底

  tipWidth:150,//提示框的宽
  tipHeight:90,//提示框的高
  tipBorderRadius:3,//提示框圆角
  tipBorder:0,//提示框边框   0--没有边框
  tipBorderType:'solid',//提示框边框类型   solid--实线  dashed--方虚线  dotted--圆虚线  double--双线  
  tipTextFont:12,//提示框文字字体大小
  tipPointSize:8,//提示框圆点中心的大小   0--没有圆点
  tipPointBorderSize:5,//提示框圆点边框的大小
  tipLineWidth:1,//提示框向下延伸线   0--没有延伸线
  tipLineType:'dashed',//提示框向下延伸线类型   solid--实线  dashed--方虚线  dotted--圆虚线  double--双线  
}

export default lists