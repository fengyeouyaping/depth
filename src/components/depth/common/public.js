/**
 * 添加千位分隔符
 * @param num
 * @returns {Number}
 **/
export const milliFormat = (num) => {
  return num && num.toString()
    .replace(/\d+/, function (s) {
      return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
    })
}

/**
 * 截取小数精度
 * @param {*} total
 * @param {*} num
 */
export const ToolPoint = (total, num) => {
  if (!total.toString()) {
    return getDigits(total, num);
  }
  total = total.toString();
  if (total.indexOf(".") != -1) {
    let point = total.split(".")
    
    if(num == 0){
      return point[0]
    }else if (point[1].length >= num) {
      total = point[0] + "." + point[1].substring(0, num);
      return getDigits(total * 1, num)
    } else {
      return getDigits(total * 1, num);
    }
  } else {
    if(num == 0){
      return total
    }
    return getDigits(total * 1, num);
  }
}

/**
 * 小数位不够 用0补位
 * @param {*} total
 * @param {*} num
 */
export const getDigits = (total, num) => {
  total = total + ''
  if (total.split('.')[1] && total.split('.')[1].length === num) {
    return total
  } else {
    let i = 0
    if (total.split('.')[1]) {
      i = total.split('.')[1].length
    } else {
      total += '.'
    }

    while (i < num) {
      total += '0'
      i++
    }
    return total
  }
}

/**
 * 小数位不够 用0补位
 * @param {*} num  接收的数字
 * @param {*} point  保留数字的第几位
 */
export const tranNumber = function (num, point = 2) {
  let lang = sessionStorage.getItem('vuex') ? JSON.parse(sessionStorage.getItem('vuex'))['public']['lang'] : 'zh_CN'

  num = Number(num)
  let si = [{
      value: 1,
      symbol: ""
    },
    {
      value: 1E3,
      symbol: "K"
    },
    {
      value: 1E6,
      symbol: "M"
    },
    {
      value: 1E9,
      symbol: "B"
    }
  ];
  if (lang == 'zh_CN') {
    si = [{
        value: 1,
        symbol: ""
      },
      {
        value: 1E4,
        symbol: "万"
      },
      {
        value: 1E8,
        symbol: "亿"
      },
    ];
  } else if (lang == 'zh_TW') {
    si = [{
        value: 1,
        symbol: ""
      },
      {
        value: 1E4,
        symbol: "萬"
      },
      {
        value: 1E8,
        symbol: "億"
      },
    ];
  }

  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  
  let decimal = ToolPoint(num / si[i].value, point)
  return decimal + si[i].symbol;
}


