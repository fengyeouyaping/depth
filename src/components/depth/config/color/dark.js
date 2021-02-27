const lists = {
  bgColor:'#171b2b',//背景色
  coordinateColor:'#626884',//坐标轴颜色
  coordinateTextColor:'#626884',//坐标轴文字颜色
  buyLineColor:'#3db17c',//买盘折线颜色
  buyBgColor:'#102f35',//买盘面积填充颜色
  sellLineColor:'#E34D5A',//卖盘折线颜色
  sellBgColor:'#3f1c2d',//卖盘面积填充颜色

  padding:[0,-1,28,0],//画布内间距padding--上，右，下，左        右边距为-1时，将自动计算右边距
  coordinateHeight:1,//坐标轴宽度
  calibrationHeight:4,//刻度线的长度
  coordinateTextFont:'12px SimHei',//坐标轴文字大小
  lineHeight:2,//折线线宽
  middleWidth:3,//图中间预留的宽度

  tipBgColor:'rgba(0,0,0, 0.8)',//提示框背景色
  tipBorderColor:'red',//提示框边框颜色
  tipFontLabelColor:'#FFFFFF',//提示框文字颜色
  tipFontValueColor:'#FFFFFF',//提示框数字颜色
  tipPointBorderColorBuy:'#226e58',//提示框圆点边框颜色  ---暂不支持透明底
  tipPointBorderColorSell:'#753340',//提示框圆点边框颜色  ---暂不支持透明底

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
