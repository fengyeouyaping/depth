import dark from './color/dark'
import light from './color/light'
import {math} from '../common/math'

export default {
  data() {
    return {
      //颜色版本
      skinVersion:'dark',

      //记录创建的style标签
      styleDom:'',

      //保存创建的canver
      canver:'',
      ctx:'',

      //保存创建的提示框
      tipDom:'',

      //内边距
      padding:[],

      //买盘数据
      buyDates:[],

      //卖盘数据
      sellDates:[],

      //记录鼠标位置
      mouseX:0,

    }
  },
  computed:{
    //颜色集合
    COLOR(){
      if(this.skinVersion == 'light'){
        return light
      }else{
        return dark
      }
    },
  },
  created() {
    
  },
  watch:{
    loadingType(val){
      let load = document.getElementById('LOADING')
      if(val){
        load.setAttribute('style',`display:block`)
      }else{
        load.setAttribute('style',`display:none`)
      }
    }
  },
  mounted() {
    //获取父级容器
    let container = document.getElementById(this.containerId)
    //初始化画布
    this.canver = document.createElement('canvas')
    this.ctx = this.canver.getContext('2d');
    container.appendChild(this.canver)
    //初始化提示框
    this.tipDom = this.getTip()
    container.appendChild(this.tipDom)

    this.fillContainer()
  },
  methods:{
    //画图初始化函数
    init(buyDate,sellDate,xAxisList,yAxisList){
      //画布的宽高
      let cw = this.screenWidth;
      let ch = document.getElementById(this.containerId).offsetHeight;
      
      //设置画布宽高
      this.canver.width = cw;
			this.canver.height = ch;

      //内间距padding
      this.padding = this.COLOR.padding;
      //根据Y轴数据，计算padding[1]
      if(this.padding[1] == -1){
        this.padding[1] = 8 + yAxisList[yAxisList.length-1].length*7
      }
      //处理奇数时线条模糊
      if(this.COLOR.coordinateHeight%2 != 0){
        this.padding = [this.padding[0]+0.5,this.padding[1]+0.5,this.padding[2]+0.5,this.padding[3]+0.5]
      }

      //原点，bottomRight:X轴终点,topLeft:Y轴终点
      let origin = {x:this.padding[3],y:ch-this.padding[2]};
      let bottomRight = {x:cw-this.padding[1],y:ch-this.padding[2]};
      let topRight = {x:cw-this.padding[1],y:this.padding[0]};


      if(buyDate.length > 0 || sellDate.length > 0){
        //创建坐标轴
        this.getCoordinate(xAxisList,yAxisList,cw,ch,this.padding,origin,bottomRight,topRight)
        //绘制折线图
        this.getArea(buyDate,sellDate,yAxisList,cw,ch,this.padding,origin,bottomRight)
      }

      //loading隐藏
      this.loadingType = false
      
      //更新提示框
      this.move()
      
    },
    
    //创建提示框
    getTip(){
      //创建提示框
      let tipDom = document.createElement('div')
      tipDom.id = 'tipDom'
      tipDom.style=`
      position:absolute;
      left:20px;
      top:0;
      display:none;
      width:${this.COLOR.tipWidth}px;
      height:${this.COLOR.tipHeight}px;
      background:${this.COLOR.tipBgColor};
      border-radius:${this.COLOR.tipBorderRadius}px;
      border:${this.COLOR.tipBorder}px ${this.COLOR.tipBorderType} ${this.COLOR.tipBorderColor};
      justify-content: space-between;
      z-index:999;
      `
      //创建左边的边框条
      let tipDomLeft = document.createElement('div')
      tipDomLeft.id = 'tipDomLeft'
      tipDomLeft.style=`
      width:3px;
      height:100%;
      background:${this.COLOR.buyLineColor};
      `
      //创建右边的边框条
      let tipDomRight = document.createElement('div')
      tipDomRight.id = 'tipDomRight'
      tipDomRight.style=`
      flex:1;
      padding:10px 15px 0 15px;
      `

      //创建圆点
      let tipPoint = document.createElement('div')
      tipPoint.id = 'tipPoint'
      tipPoint.style=`
      position:absolute;
      left:-${this.COLOR.tipPointSize/2+this.COLOR.tipPointBorderSize - this.COLOR.tipLineWidth/2}px;
      top:${this.COLOR.tipHeight+this.COLOR.tipPointSize}px;
      width:${this.COLOR.tipPointSize}px;
      height:${this.COLOR.tipPointSize}px;
      border-radius: 100%;
      background:${this.COLOR.buyLineColor};
      border:${this.COLOR.tipPointBorderSize}px solid ${this.COLOR.tipPointBorderColorBuy};
      `

      //创建向下延申线
      let tipLine = document.createElement('div')
      tipLine.id = 'tipLine'
      //虚线的长度=总长度-提示框长度-提示框到顶部的高度-圆点的高度-10 - 上边距 - 下边距
      let cw = this.screenWidth;
      let ch = document.getElementById(this.containerId).offsetHeight;
      let tipLineTop = this.COLOR.tipHeight + this.COLOR.tipPointSize + this.COLOR.tipPointBorderSize*2 + this.COLOR.tipPointSize + this.COLOR.padding[0]
      let tipLineHeight = ch - tipLineTop - this.COLOR.padding[2] -this.COLOR.tipPointSize/2
      tipLine.style=`
      position:absolute;
      left:0px;
      top:${tipLineTop}px;
      width:0;
      height:${tipLineHeight}px;
      border:${this.COLOR.tipLineWidth}px ${this.COLOR.tipLineType} ${this.COLOR.buyLineColor};
      `
      tipDom.appendChild(tipDomLeft)
      tipDom.appendChild(tipDomRight)
      tipDom.appendChild(tipPoint)
      tipDom.appendChild(tipLine)

      //创建定位层
      let position = document.createElement('div')
      position.id = 'position'
      position.style=`
      position:absolute;
      left:0;
      top:0;
      width:${cw}px;
      height:${ch}px;
      z-index:1000;
      `
      //监听鼠标移动事件
      position.addEventListener('mouseenter',() =>{this.enter()})
      position.addEventListener('mouseleave',() =>{this.leave()})
      //获取父级容器
      let container = document.getElementById(this.containerId)
      container.appendChild(position)

      return tipDom
    },

    //移入事件
    enter(){
      let position = document.getElementById('position')
      position.addEventListener('mousemove',(ev) =>{this.move(ev)})
    },

    //移除事件
    leave(){
      let position = document.getElementById('position')
      position.removeEventListener('mousemove',(ev) =>{this.move(ev)})
      //获取提示框
      let tipDom = document.getElementById('tipDom')
      tipDom.style.top='0'
      tipDom.style.display = 'none';
      this.mouseX = -9999
    },
    
    //移动提示框位置
    move(ev){
      //获取提示框
      let tipDom = document.getElementById('tipDom')
      let tipPoint = document.getElementById('tipPoint')
      let tipLine = document.getElementById('tipLine')
      let tipDomRight = document.getElementById('tipDomRight')
      let tipDomLeft = document.getElementById('tipDomLeft')

      let ch = document.getElementById(this.containerId).offsetHeight;

      //获取当前鼠标的x位置
      let mouseX = ev ? ev.clientX : this.mouseX
      this.mouseX = mouseX
      let allY = this.getTipY(mouseX)
      let mouseY = allY[0] - this.COLOR.tipHeight - 2*this.COLOR.tipBorder - this.COLOR.tipPointSize - 2*this.COLOR.tipPointBorderSize
      let tipLineTop = this.COLOR.tipHeight + this.COLOR.tipPointSize + this.COLOR.tipPointBorderSize*2 + this.COLOR.tipPointSize + this.COLOR.padding[0]

      //提示框文案
      let tipInnerHTML = ''
      for(let i=0;i<this.tipDate.length;i++){
        tipInnerHTML += `<div style="margin-bottom:10px;">`
        tipInnerHTML += `<p style="color:${this.COLOR.tipFontLabelColor};font-size:${this.COLOR.tipTextFont}px;height:${this.COLOR.tipTextFont}px;
        line-height:${this.COLOR.tipTextFont}px;margin-bottom:6px;">${this.tipDate[i]['label']}</p>`
        tipInnerHTML += `<p style="color:${this.COLOR.tipFontValueColor};font-size:${this.COLOR.tipTextFont}px;height:${this.COLOR.tipTextFont}px;line-height:${this.COLOR.tipTextFont}px;">${allY[i+1]}</p>`
        tipInnerHTML += `</div>`
      }
      tipDomRight.innerHTML = tipInnerHTML
      
      //隐藏提示框
      if(mouseX <= this.padding[3] || mouseX >= this.screenWidth - this.padding[1]){
        tipDom.style.top='0'
        tipDom.style.display = 'none';
      }else if(allY[0] == -9999){
        tipDom.style.top='0'
        tipDom.style.display = 'none';
      }else{
        //计算位置
        tipDom.style.display = 'flex';
        tipDom.style.left=`${mouseX}px`
        //提示框
        tipDom.style.top=`${mouseY}px`
        //圆点
        tipPoint.style.top=`${this.COLOR.tipHeight+this.COLOR.tipPointSize}px`
        //延长线

        let hei = ch - mouseY - this.COLOR.tipHeight - 2*this.COLOR.tipBorder - this.COLOR.tipPointSize - 2*this.COLOR.tipPointBorderSize - 20*2
        if(hei < 0){
          hei = 0
          tipLine.style.border = 'none'
        }else{
          tipLine.style.border = `${this.COLOR.tipLineWidth}px ${this.COLOR.tipLineType}`
        }

        tipLine.style.top = `${tipLineTop}px`
        tipLine.style.height = `${hei}px`
        
      }

      //右侧旋转提示框
      if(mouseX <= this.screenWidth - this.padding[1] && mouseX >= this.screenWidth - this.padding[1] - this.COLOR.tipWidth){
        tipDom.style.left=`${mouseX - this.COLOR.tipWidth + 3}px`
        tipDom.style.top=`${mouseY}px`
        
        tipDom.style.flexDirection=`row-reverse`
        document.getElementById('tipPoint').style.left=`${this.COLOR.tipWidth - (this.COLOR.tipPointSize/2+this.COLOR.tipPointBorderSize - this.COLOR.tipLineWidth/2)-3}px`
        document.getElementById('tipLine').style.left=`${this.COLOR.tipWidth-3}px`
        
      }else{
        tipDom.style.flexDirection=`row`
        document.getElementById('tipPoint').style.left=`-${this.COLOR.tipPointSize/2+this.COLOR.tipPointBorderSize - this.COLOR.tipLineWidth/2}px`
        document.getElementById('tipLine').style.left=0
      }

      //顶部旋转提示框
      if(mouseY < 0){
        //提示框
        tipDom.style.top=`${mouseY + this.COLOR.tipHeight + 2*this.COLOR.tipBorder + this.COLOR.tipPointSize + 2*this.COLOR.tipPointBorderSize+20}px`
        //圆点
        tipPoint.style.top=`-${2*this.COLOR.tipBorder + this.COLOR.tipPointSize + 2*this.COLOR.tipPointBorderSize+10}px`
        //延长线
        tipLine.style.top = `-10px`
        tipLine.style.height = `${ch - mouseY - this.COLOR.tipHeight - 2*this.COLOR.tipBorder - this.COLOR.tipPointSize - 2*this.COLOR.tipPointBorderSize-20*2}px`
      }

      //颜色
      if(allY[3] == 'buy'){
        //左侧
        tipDomLeft.style.background = this.COLOR.buyLineColor
        //圆点
        tipPoint.style.background=this.COLOR.buyLineColor
        tipPoint.style.borderColor=this.COLOR.tipPointBorderColorBuy
        //延长线
        tipLine.style.borderColor = this.COLOR.buyLineColor
      }else{
        //左侧
        tipDomLeft.style.background = this.COLOR.sellLineColor
        //圆点
        tipPoint.style.background=this.COLOR.sellLineColor
        tipPoint.style.borderColor=this.COLOR.tipPointBorderColorSell
        //延长线
        tipLine.style.borderColor = this.COLOR.sellLineColor
      }

      
      
    },

    //计算提示框的纵坐标和显示数据
    getTipY(mouseX){
      let center = (this.screenWidth - this.padding[1] - this.padding[3])/2
      
      //处于买盘--处于卖盘--其他情况隐藏
      if(this.buyDates.length > 0 && mouseX < center){
        if(mouseX >= this.buyDates[0]['x'] && mouseX <= this.buyDates[this.buyDates.length-1]['x']){
          for(let i=0;i<this.buyDates.length;i++){
          
            if(i == 0){
              if(mouseX == this.buyDates[i]['x']){//正好处于某一个点上
                return [this.buyDates[i]['y'],this.buyDates[i]['label'],this.buyDates[i]['value'],'buy']
              }
            }else if(mouseX == this.buyDates[this.buyDates.length-1]['x']){
              return [-9999,0,0,'buy']
            }else{
              if(mouseX == this.buyDates[i]['x']){//正好处于某一个点上
                return [this.buyDates[i]['y'],this.buyDates[i]['label'],this.buyDates[i]['value'],'buy']
              }else if(mouseX > this.buyDates[i-1]['x'] && mouseX < this.buyDates[i]['x']){//处于两个点中间
                if(this.buyDates[i-1]['y'] == this.buyDates[i]['y']){//处于纵坐标相同的两个点之间
                  return [this.buyDates[i]['y'],this.buyDates[i]['label'],this.buyDates[i]['value'],'buy']
                }else{
                  return [this.buyDates[i-1]['y'],this.buyDates[i-1]['label'],this.buyDates[i-1]['value'],'buy']
                }
              }
            }
            
          }
        }else if(mouseX > this.buyDates[this.buyDates.length-1]['x'] && mouseX < center -2){
          return [this.buyDates[this.buyDates.length-1]['y'],this.buyDates[this.buyDates.length-1]['label'],this.buyDates[this.buyDates.length-1]['value'],'buy']
        }else{
          return [-9999,0,0,'buy']
        }
        
      }else if(this.sellDates.length > 0 && mouseX > center){
        if(mouseX >= this.sellDates[0]['x'] && mouseX <= this.sellDates[this.sellDates.length-1]['x']){
          for(let i=0;i<this.sellDates.length;i++){
            if(i == 0){
              if(mouseX == this.sellDates[i]['x']){//正好处于某一个点上
                return [this.sellDates[i]['y'],this.sellDates[i]['label'],this.sellDates[i]['value'],'sell']
              }
            }else if(mouseX == this.sellDates[this.sellDates.length - 1]['x']){
              return [-9999,0,0,'sell']
            }else{
              if(mouseX == this.sellDates[i]['x']){//正好处于某一个点上
                return [this.sellDates[i]['y'],this.sellDates[i]['label'],this.sellDates[i]['value'],'sell']
              }else if(mouseX > this.sellDates[i-1]['x'] && mouseX < this.sellDates[i]['x']){//处于两个点中间
                if(this.sellDates[i-1]['y'] == this.sellDates[i]['y']){//处于纵坐标相同的两个点之间
                  return [this.sellDates[i-1]['y'],this.sellDates[i-1]['label'],this.sellDates[i-1]['value'],'sell']
                }else {
                  return [this.sellDates[i]['y'],this.sellDates[i]['label'],this.sellDates[i]['value'],'sell']
                }
              }
            }
            
          }
        }else if(mouseX < this.sellDates[0]['x'] && mouseX > center +2){
          return [this.sellDates[0]['y'],this.sellDates[0]['label'],this.sellDates[0]['value'],'sell']
        }else{
          return [-9999,0,0,'buy']
        }
        
      }else{
        return [-9999,0,0,'buy']
      }
      //返回参数[纵坐标,label,value,处于买盘还是卖盘]
    },

    //创建坐标轴
    getCoordinate(xAxisList,yAxisList,cw,ch,padding,origin,bottomRight,topRight){
      //设置字号
      this.ctx.fillStyle=this.COLOR.coordinateTextColor
      this.ctx.font = this.COLOR.coordinateTextFont;
      //坐标轴的颜色和线宽
      this.ctx.strokeStyle=this.COLOR.coordinateColor
      this.ctx.lineWidth=this.COLOR.coordinateHeight

      //绘制坐标轴
      this.ctx.beginPath();
      this.ctx.moveTo(origin.x,origin.y)
      this.ctx.lineTo(bottomRight.x,bottomRight.y)
      this.ctx.lineTo(topRight.x,topRight.y)

      //绘制X轴刻度线和X轴文字
      //计算刻度可使用的总宽度
      let avgWidth = (cw - padding[1] - padding[3] - 60)/(xAxisList.length-1);
      for(let i=0;i<xAxisList.length;i++){
        //循环绘制所有刻度线
        //移动刻度起点
        this.ctx.moveTo(30+origin.x+i*avgWidth,origin.y);
        //绘制到刻度终点
        this.ctx.lineTo(30+origin.x+i*avgWidth,origin.y+this.COLOR.calibrationHeight);
        //X轴文字
        let txtWidth = this.ctx.measureText(xAxisList[i]).width;
        //填充文字
        this.ctx.fillText(xAxisList[i],30+origin.x+i*avgWidth-txtWidth/2,origin.y+19);
      }

      //绘制Y方向刻度
      let avgHeight = (ch - padding[0] - padding[2] - 30)/(yAxisList.length-1);
      for(let k=0;k<yAxisList.length;k++){
          //绘制Y轴刻度
          this.ctx.moveTo(bottomRight.x,origin.y-k*avgHeight);
          //绘制到刻度终点
          this.ctx.lineTo(bottomRight.x+this.COLOR.calibrationHeight,origin.y-k*avgHeight);
          //填充文字
          this.ctx.fillText(yAxisList[k],bottomRight.x+8,origin.y-k*avgHeight+6);
      }
      
      this.ctx.stroke()
    },

    //绘制折线面积图
    getArea(buyDate,sellDate,yAxisList,cw,ch,padding,origin,bottomRight){
      this.buyDates = []
      this.sellDates = []
      //计算买盘可使用的总宽度
      let dishWidthX = buyDate.length == 0 ? 0 : math.floatDivide((cw - padding[1] - padding[3])/2-this.COLOR.middleWidth,(math.floatSub(math.floatSub(buyDate[buyDate.length-1]['x'],buyDate[0]['x']),1)));
      //计算买盘、卖盘可使用的总高度
      let dishWidthY = math.floatDivide((ch - padding[0] - padding[2] - 30),yAxisList[yAxisList.length-1]);

      //绘制买盘折线图
      this.ctx.beginPath();
      //折线图的颜色和线宽
      this.ctx.strokeStyle=this.COLOR.buyLineColor
      this.ctx.lineWidth=this.COLOR.lineHeight
      for(let i=0;i<buyDate.length;i++){
        //绘制路径
        let x = math.floatAdd(origin.x,math.floatMultiply(math.floatSub(buyDate[i]['x'],buyDate[0]['x']),dishWidthX))
        let y = Number(math.floatSub(origin.y,math.floatMultiply(buyDate[i]['y'],dishWidthY)))-this.COLOR.lineHeight
        
        if(i==0){
          //起点
          this.ctx.moveTo(x,y)
        }else{
          if(buyDate.length == 3){
            x = x - 2
          }
          this.ctx.lineTo(x,y)
        }
      }
      if(buyDate.length > 3){
        this.ctx.lineTo(bottomRight.x/2-2,Number(math.floatSub(origin.y,math.floatMultiply(buyDate[buyDate.length - 1]['y'],dishWidthY)))-this.COLOR.lineHeight)
      }
      
      this.ctx.stroke()

      //绘制买盘面积图
      this.ctx.beginPath();
      //折线图的颜色和线宽
      this.ctx.fillStyle=this.COLOR.buyBgColor
      for(let i=0;i<buyDate.length;i++){
        //绘制路径
        let x = math.floatAdd(origin.x,math.floatMultiply(math.floatSub(buyDate[i]['x'],buyDate[0]['x']),dishWidthX))-this.COLOR.lineHeight+1
        let y = Number(math.floatSub(origin.y,math.floatMultiply(buyDate[i]['y'],dishWidthY)))
        if(i==0){
          //起点
          this.ctx.moveTo(x,y)
          this.buyDates.push({
            label:buyDate[i]['valueX'],
            value:buyDate[i]['valueY'],
            x:x,
            y:y
          })
        }else if(i == buyDate.length-1){
          if(buyDate.length == 3){
            x = x - 2
          }
          this.ctx.lineTo(x,y)
          this.buyDates.push({
            label:buyDate[i]['valueX'],
            value:buyDate[i]['valueY'],
            x:x,
            y:y
          })
        }else{
          if(buyDate.length == 3){
            x = x - 2
          }
          this.ctx.lineTo(x,y)
          this.buyDates.push({
            label:buyDate[i]['valueX'],
            value:buyDate[i]['valueY'],
            x:x,
            y:y
          })
        }
      }
      this.ctx.lineTo(origin.x,origin.y)
      this.ctx.fill();

      //计算卖盘可使用的总宽度
      dishWidthX = sellDate.length == 0 ? 0 : math.floatDivide((cw - padding[1] - padding[3])/2-this.COLOR.middleWidth,(math.floatSub(math.floatSub(sellDate[sellDate.length-1]['x'],sellDate[0]['x']),1)));
      if(sellDate.length > 0){
        //绘制卖盘折线图
        this.ctx.beginPath();
        //折线图的颜色和线宽
        this.ctx.strokeStyle=this.COLOR.sellLineColor
        this.ctx.lineWidth=this.COLOR.lineHeight
        let startPointX = (cw - padding[1] - padding[3])/2+this.COLOR.middleWidth

        if(sellDate.length > 3){
          this.ctx.lineTo(bottomRight.x/2+2,Number(math.floatSub(origin.y,math.floatMultiply(sellDate[0]['y'],dishWidthY)))-this.COLOR.lineHeight)
        }
        for(let i=0;i<sellDate.length;i++){
          //绘制路径
          let x
          if(sellDate[i]['x'] == 'max'){
            x = bottomRight.x
          }else{
            x = math.floatAdd(startPointX,math.floatMultiply(math.floatSub(sellDate[i]['x'],sellDate[0]['x']),dishWidthX))
          }
          let y = Number(math.floatSub(origin.y,math.floatMultiply(sellDate[i]['y'],dishWidthY)))-this.COLOR.lineHeight
          if(x <= bottomRight.x){
            if(i==0){
              //起点
              this.ctx.moveTo(x,y)
            }else{
              this.ctx.lineTo(x,y)
            }
          }
        }
        this.ctx.lineTo(bottomRight.x,Number(math.floatSub(origin.y,math.floatMultiply(sellDate[sellDate.length-1]['y'],dishWidthY)))-this.COLOR.lineHeight)
        this.ctx.stroke()

        //绘制卖盘面积图
        this.ctx.beginPath();
        //折线图的颜色和线宽
        this.ctx.fillStyle=this.COLOR.sellBgColor;
        for(let i=0;i<sellDate.length;i++){
          //绘制路径
          let x = math.floatAdd(startPointX,math.floatMultiply(math.floatSub(sellDate[i]['x'],sellDate[0]['x']),dishWidthX))+this.COLOR.lineHeight-1
          let y = Number(math.floatSub(origin.y,math.floatMultiply(sellDate[i]['y'],dishWidthY)))
          if(x <= bottomRight.x){
            if(i==0){
              //起点
              this.sellDates.push({
                label:sellDate[i]['valueX'],
                value:sellDate[i]['valueY'],
                x:x,
                y:y
              })
              this.ctx.moveTo(x,y)
            }else{
              this.sellDates.push({
                label:sellDate[i]['valueX'],
                value:sellDate[i]['valueY'],
                x:x,
                y:y
              })
              this.ctx.lineTo(x,y)
            }
          }
        }
        this.sellDates.push({
          label:sellDate[sellDate.length-1]['valueX'],
          value:sellDate[sellDate.length-1]['valueY'],
          x:bottomRight.x,
          y:Number(math.floatSub(origin.y,math.floatMultiply(sellDate[sellDate.length-1]['y'],dishWidthY)))+this.COLOR.lineHeight+1
        })
        this.ctx.lineTo(bottomRight.x,Number(math.floatSub(origin.y,math.floatMultiply(sellDate[sellDate.length-1]['y'],dishWidthY)))+this.COLOR.lineHeight+1)
        this.ctx.lineTo(bottomRight.x,bottomRight.y)
        this.ctx.fill();
      }
    },

    //填充父级容器的样式，loading样式
    fillContainer(){
      //获取父级容器，并给父级容器添加背景色
      let container = document.getElementById(this.containerId)
      container.setAttribute('style',`background:${this.COLOR.bgColor};position: relative;`)
      
      //改变loading颜色
      let load = document.createElement('div')
      load.setAttribute("id","LOADING");  
      container.appendChild(load)
      let str = `#LOADING::after{background:${this.COLOR.bgColor}}`
      this.createStyle(str)
    },

    //创建style标签
    createStyle(str){
      this.removeChild()
      let sty = document.createElement("style");
      sty.type='text/css';  
      if (sty.styleSheet) {
        sty.styleSheet.cssText = str;
      } else {
        sty.innerHTML = str;
      }
      let head = document.getElementsByTagName('head')[0];
      this.styleDom= sty
      head.appendChild(sty);
    },

    //移除添加样式的时间
    removeChild() {
      if (this.styleDom) {
        this.styleDom.remove()
      }
    }
  },
  beforeDestroy() {
    this.removeChild()
  },
}
