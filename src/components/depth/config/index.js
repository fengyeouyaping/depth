import drawing from './drawing' //画图文件
import dataList from './dataList' //数据文件
import basis from './basis' //基础配置文件

export default {
  mixins:[basis,drawing,dataList]
}