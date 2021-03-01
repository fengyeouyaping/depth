import axios from 'axios'
import Qs from 'qs'
import {math} from '../common/math'
import { ToolPoint } from '../common/public'

export default {
  data() {
    return {
      //记录定时器
      setIntervalDom:'',

      //X轴坐标数据
      xAxisList:[],

      //Y轴坐标数据
      yAxisList:[],

      //买盘数据
      buyDate:[],

      //卖盘数据
      sellDate:[],

      //屏幕宽度
      screenWidth: document.body.clientWidth,
      //为了避免频繁触发resize函数导致页面卡顿，使用定时器
      timer:false,  

    }
  },
  computed:{
    
  },
  watch:{
    //监听屏幕宽度，实时调整X轴坐标
    screenWidth(val){
      if(!this.timer){
          this.screenWidth = val
          this.timer = true
          let that = this
          setTimeout(function(){
            //得到x轴和y轴数据
            that.getCoordinates({bids:that.buyDate,asks:that.sellDate})
            that.timer = false
          },400)
      }
    },

    //监控交易对名称，更新数据
    coinName(){
      this.getListDate()
    },

  },
  created(){
    this.getDataFun()
    this.getListDate()
  },
  mounted () {
    //监听窗口宽度变化
    const that = this
    window.onresize = () => {
        return (() => {
            window.screenWidth = document.getElementById(this.containerId).offsetWidth
            that.screenWidth = window.screenWidth
        })()
    }
  },
  methods:{
    //请求接口获取数据
    getListDate(){
      this.loadingType = true
      //判断是否有定时器存在，如果存在先销毁再创建
      if(this.setIntervalDom){
        clearInterval(this.setIntervalDom)
        this.setIntervalDom = ""
      }

      this.setIntervalDom = setInterval(() => {
        this.getDataFun()
      },this.updateTime)
    },

    //请求接口
    getDataFun(){
      let params = {
        symbol:this.coinName,
        type:0
      }
      axios({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'way':'WEB'
        },
        method: 'post',
        url: this.url,
        data: Qs.stringify(params)
      }).then((result) => {
        if(result.success){
          this.dealDate(result.data.result)
        }else{
          this.loadingType = false
        }
      }).catch((err) => {
        console.log(err)
        this.loadingType = false
      })
    },

    //数据处理
    dealDate(list){
      //优化数据
      let datas = {}
      datas.asks = list.asks
      datas.bids = list.bids
      if(this.isOptimizeData && list.asks.length > 1 && list.bids.length > 1){
        datas = this.localDate(list)
      }
      // datas.bids.reverse()
      //对买卖盘数据进行y轴数据的累加
      datas = this.getYnum(datas)

      // datas.bids.reverse()
      // datas.bids.length = 0
      //处理买卖盘画图的点
      //得到x轴坐标和y轴坐标数据
      this.getPointList(datas)

      this.init(this.buyDate,this.sellDate,this.xAxisList,this.yAxisList)

    },

    //本地处理数据
    localDate(list){
      //bids--买盘   asks--卖盘

      //去重
      let result = {}
      result.asks = this.noRepeat(list.asks)
      result.bids = this.noRepeat(list.bids)
      
      //排序
      result.asks.sort(function(a, b){return a[0] - b[0]});
      result.bids.sort(function(a, b){return a[0] - b[0]});
      
      //根据买卖盘数据，截取合适的区间数据，以数据小区间为准
      let bids_interval = math.floatSub(result.bids[result.bids.length - 1][0], result.bids[0][0]) //买盘数据差
      let asks_interval = math.floatSub(result.asks[result.asks.length - 1][0], result.asks[0][0]) //卖盘数据差
      
      let res = {}
      if(bids_interval > asks_interval){ //截取买盘数据
        let allNum = math.floatAdd(asks_interval, result.bids[0][0])
        
        res.asks = result.asks
        res.bids = result.bids.filter((item) => allNum > Number(item[0]))
        
        let before = math.floatSub(allNum, res.bids[res.bids.length-1][0])
        let after  = math.floatSub(result.bids[res.bids.length][0],allNum)

        if(before > after){
          res.bids.push(result.bids[res.bids.length])
        }

      }else{                             //截取卖盘数据
        let allNum = math.floatAdd(bids_interval, result.asks[0][0])

        res.asks = result.asks.filter((item) => allNum > Number(item[0]))
        res.bids = result.bids
        
        let before = math.floatSub(allNum, res.asks[res.asks.length-1][0])
        let after  = math.floatSub(result.asks[res.asks.length][0],allNum)

        if(before > after){
          res.asks.push(result.asks[res.asks.length])
        }
        
      }
      
      return res
    },

    //数组去重
    noRepeat(arr){
      let obj={};
      let arr2=[];
      for(let i=0;i<arr.length;i++){
          if(!obj[arr[i][0]]){
              obj[arr[i][0]]=true;
              arr2.push(arr[i]);
          }
      }
      return arr2
    },

    //对买卖盘数据进行y轴数据的累加
    getYnum(datas){
      let arr = []

      if(datas.bids.length > 0){
        datas.bids.reverse()
        arr.bids = this.addNum(datas.bids).reverse()
      }else{
        arr.bids = []
      }

      if(datas.bids.length > 0){
        arr.asks = this.addNum(datas.asks)
      }else{
        arr.asks = []
      }

      return arr
    },

    //对数据累加，并返回数组
    addNum(lists){
      let allNum = 0
      let newArr = []
      lists.map((item) => {
        allNum = math.floatAdd(allNum, item[1])
        newArr.push([item[0],allNum])
      })

      return newArr
    },

    //处理买卖盘画图的点
    getPointList(datas){
      let gradient = this.gradient > 1 ? 1 : this.gradient

      this.buyDate = []
      this.sellDate = []
      //得到第一个点，第一个数据和第二个数据差值的占比
      //差值
      let poor = 0

      //买盘
      if(datas.bids.length > 1){
        for(let i=0;i<datas.bids.length;i++){
          //第一个点
          if(i==0){
            poor = math.floatSub(datas.bids[1][0],datas.bids[0][0])
            this.buyDate.push({
              x:Number(math.floatSub(datas.bids[0][0],math.floatMultiply(poor,gradient))),
              y:datas.bids[0][1],
              valueX:Number(ToolPoint(datas.bids[0][0],this.xDigits)),
              valueY:ToolPoint(datas.bids[0][1],this.yDigits),
            })
          }
          let item = datas.bids[i]
          let itemNext = datas.bids[i+1] ? datas.bids[i+1] : []
          
          this.buyDate.push({
            x:Number(item[0]),
            y:item[1],
            valueX:Number(ToolPoint(item[0],this.xDigits)),
            valueY:ToolPoint(item[1],this.yDigits),
          })
  
          //最后一个点
          if(i==datas.bids.length-1){
            poor = math.floatSub(item[0],datas.bids[datas.bids.length-2][0])
            this.buyDate.push({
              x:math.floatAdd(item[0],math.floatMultiply(poor,gradient)),
              y:0,
              valueX:Number(ToolPoint(item[0],this.xDigits)),
              valueY:0,
            })
          }else{
            poor = math.floatSub(itemNext[0],item[0])
            this.buyDate.push({
              x:math.floatAdd(item[0],math.floatMultiply(poor,gradient)),
              y:itemNext[1],
              valueX:Number(ToolPoint(item[0],this.xDigits)),
              valueY:ToolPoint(itemNext[1],this.yDigits),
            })
          }
        }
      }else if(datas.bids.length == 1){
        this.buyDate.push({
          x:0,
          y:datas.bids[0][1],
          valueX:Number(datas.bids[0][0]),
          valueY:ToolPoint(datas.bids[0][1],this.yDigits),
        })
        this.buyDate.push({
          x:Number(datas.bids[0][0]),
          y:datas.bids[0][1],
          valueX:Number(datas.bids[0][0]),
          valueY:ToolPoint(datas.bids[0][1],this.yDigits),
        })
        this.buyDate.push({
          x:Number(datas.bids[0][0]),
          y:0,
          valueX:Number(datas.bids[0][0]),
          valueY:ToolPoint(datas.bids[0][1],this.yDigits),
        })
      }
      

      //卖盘
      if(datas.asks.length > 1){
        for(let i=0;i<datas.asks.length;i++){
          
          //第一个点
          if(i==0){
            poor = math.floatSub(datas.asks[1][0],datas.asks[0][0])
            this.sellDate.push({
              x:Number(math.floatSub(datas.asks[0][0],math.floatMultiply(poor,gradient))),
              y:0,
              valueX:Number(ToolPoint(datas.asks[0][0],this.xDigits)),
              valueY:0,
            })
          }
          
          let item = datas.asks[i]
          let itemNext = datas.asks[i+1]
          
          this.sellDate.push({
            x:Number(item[0]),
            y:item[1],
            valueX:Number(ToolPoint(item[0],this.xDigits)),
            valueY:ToolPoint(item[1],this.yDigits),
          })
          
          //最后一个点
          if(i==datas.asks.length-1){
            poor = math.floatSub(item[0],datas.asks[datas.asks.length-2][0])
            this.sellDate.push({
              x:Number(math.floatSub(item[0],math.floatMultiply(poor,gradient))),
              y:item[1],
              valueX:Number(ToolPoint(item[0],this.xDigits)),
              valueY:ToolPoint(item[1],this.yDigits),
            })
          }else{
            poor = math.floatSub(itemNext[0],item[0])
            this.sellDate.push({
              x:Number(math.floatSub(itemNext[0],math.floatMultiply(poor,gradient))),
              y:item[1],
              valueX:Number(ToolPoint(item[0],this.xDigits)),
              valueY:ToolPoint(item[1],this.yDigits),
            })
          }
          
        }
      }else if(datas.asks.length == 1){
        this.sellDate.push({
          x:Number(datas.asks[0][0]),
          y:0,
          valueX:Number(datas.asks[0][0]),
          valueY:ToolPoint(datas.asks[0][1],this.yDigits),
        })
        this.sellDate.push({
          x:Number(datas.asks[0][0]),
          y:Number(datas.asks[0][1]),
          valueX:Number(datas.asks[0][0]),
          valueY:ToolPoint(datas.asks[0][1],this.yDigits),
        })
        this.sellDate.push({
          x:'max',
          y:Number(datas.asks[0][1]),
          valueX:Number(datas.asks[0][0]),
          valueY:ToolPoint(datas.asks[0][1],this.yDigits),
        })
      }

      //得到x轴和y轴数据
      this.getCoordinates({bids:this.buyDate,asks:this.sellDate})
    },

    //得到x轴坐标和y轴坐标数据
    getCoordinates(datas){
      //计算横坐标的个数
      let num = parseInt(math.floatDivide(math.floatSub(this.screenWidth,655),100)) + 6
      if(num <= 6){
        num = 6
      }
      if(datas.asks.length <= 3 && datas.bids.length <= 3){
        num = 1
      }
      if(datas.asks.length ==0 && datas.bids.length ==0){
        num = 0
      }
      
      //计算中心点
      let center = 0
      if(datas.asks.length >= 3 && datas.bids.length >= 3){
        let difference = datas.asks[0]['x'] - datas.bids[datas.bids.length-1]['x']
        center = datas.asks[0]['x'] - difference/2
      }
      if(datas.asks.length == 0 && datas.bids.length != 0){
        center = datas.bids[datas.bids.length-1]['x']
      }
      if(datas.asks.length != 0 && datas.bids.length == 0){
        center = datas.asks[0]['x']
      }

      //计算买卖盘的差值
      //卖盘差值
      let asksPoor = 0
      //买盘差值
      let bidsPoor = 0
      //最大差值
      let poor = 0
      
      if(datas.asks.length > 3){
        asksPoor = datas.asks[datas.asks.length-1]['x'] - center
      }
      
      if(datas.bids.length > 3){
        bidsPoor = center - datas.bids[0]['x']
      }
      
      poor = asksPoor > bidsPoor ? asksPoor : bidsPoor
      
      //计算最大值和最小值
      //X轴最小
      let XMin = 0
      //X轴最大
      let XMax = 0
      if(datas.asks.length > 3 || datas.bids.length > 3){
        XMin = center - poor
        XMax = center + poor
      }
      
      let XArr = []
      if(num > 1){
        //X轴数值差
        let XPoor = 2*poor

        XArr = [Number(XMin)]
        for(let i=0;i<num-2;i++){
          XArr.push(math.floatAdd(XArr[i],math.floatDivide(XPoor,num-1)))
        }

        XArr.push(Number(XMax))

        
      }else if(num == 1){
        XArr = [Number(center)]
      }

      this.xAxisList = []
      //处理X轴坐标小数位
      for(let i=0;i<XArr.length;i++){
        this.xAxisList.push(ToolPoint(XArr[i],this.xDigits))
      }
      
      
      


      //Y轴最大
      let YMax = 0
      let asksY = datas.asks[datas.asks.length-1] ? datas.asks[datas.asks.length-1]['y'] : 0
      let bidsY = datas.bids[0] ? datas.bids[0]['y'] : 0
      if(asksY > bidsY){
        YMax = math.floatMultiply(asksY,1.1)
      }else{
        YMax = math.floatMultiply(bidsY,1.1)
      }
      //Y轴最小
      let YMin = 0
      //Y轴数值差
      let YPoor = YMax

      let YArr = [Number(YMin)]
      for(let i=0;i<3;i++){
        YArr.push(math.floatAdd(YArr[i],math.floatDivide(YPoor,4)))
      }

      YArr.push(Number(YMax))

      this.yAxisList = []
      //处理Y轴坐标小数位
      for(let i=0;i<YArr.length;i++){
        if(YArr[i] != 0) {
          this.yAxisList.push(ToolPoint(YArr[i],this.yDigits))
        }else{
          this.yAxisList.push(YArr[i])
        }
      }


    },

    
  },
  destroyed() {
    //销毁定时器
    if(this.setIntervalDom){
      clearInterval(this.setIntervalDom)
      this.setIntervalDom = ""
    }
  },
}
