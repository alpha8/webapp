//常量类
var Yihu = {
  constants: {
    psCtx : 'http://www.yihuyixi.com/ps',
    webCtx : 'http://www.yihuyixi.com/yihu',
    cmsCtx : 'http://www.yihuyixi.com/cms',
    like: {
      artwork: 1,
      article: 2
    },
    searchPivot: {
      tea: 'cms/basedata/tea',
      artwork: 'cms/basedata/artwork'
    }
  },
  version: '1.0'
};

// 配置
window.CONFIG = {
  appkey: 'af1edc0739d6187cecffd39b751d284f',
  url:'https://app.netease.im'
};

/**
 * 输出完整的图片服务器URL地址
 */
Handlebars.registerHelper('ps',function(uri){
  return Yihu.constants.psCtx + '/download/' + uri;
});

/**
 * 两数相乘
 */
Handlebars.registerHelper('plus',function(v1, v2){
  return v1 * v2;
});

/**
 * 显示友好的价格格式
 *  小于1万元：显示为 8290元.
    大于1万元：如果没有百元十元零头，则显示为 12.65万元，
               如果有百元十元零头（折扣价时），则显示为126552元
 */
Handlebars.registerHelper('easyPrice',function(price){
  if(typeof(price) == 'number'){
    var pn = parseFloat(price);
    var num = pn.toFixed(2), str = num +'';
    var suffix = str.substring(str.indexOf('.')+1);
    var mod = pn % 100;

    if(pn < 10000){
      //1w以下显示
      return suffix ? pn.toFixed(0) + '元' : num + '元';
    }else if(pn >= 10000 && pn < 1000000){
      //1w-100w显示
      if(mod > 0){
        return num + '元';
      }else{
        return (pn / 10000) + '万元';
      }
    }else{
      //other
      return num + '元';
    }
  }else{
    return price + '元';
  }
});

/**
 * 根据日期毫秒数，获取友好的日期显示格式，如：一天前，一周前，1小时前
 */
Handlebars.registerHelper('timeAgo', function(time){
  var m,hour,day;
  var ms = parseInt(+new Date()/1000);
  var delta=ms-time/1000;

  week=parseInt(delta/604800);
  day=parseInt(delta/86400);
  hour=parseInt(delta/3600);
  m=parseInt(delta/60);

  if(week>0&&week<4){
    return week+'周前';
  }

  if(day>0&&day<7){
    return day+'天前';
  }

  if(day<=0&&hour>0){
    return hour+'小时前';
  }

  if(hour<=0&&m>0){
    return m+'分钟前';
  }

  if(hour<=0&&m===0){
    return '刚刚';
  }

  var today = new Date(time);
  var now = new Date();
  var s=(today.getMonth()+1)+'月'+today.getDate()+'日';
  if(now.getFullYear()-today.getFullYear()>=1){
    s=today.getFullYear()+'年'+s;
  }
  return s;
});

/**
 * 判断是否为当前登录用户
 */
Handlebars.registerHelper('ifyours',function(val,options){
  var user = Yihu.store.get('user');
  if(user && val == user.userId){
    //满足添加继续执行
    return options.fn(this);
  }else{
    //不满足条件执行{{else}}部分
    return options.inverse(this);
  }
});

/**
 * 隐藏手机号码关键部分，增加用户隐私保护
 */
Handlebars.registerHelper('phoneMix',function(val){
  if(val && val.length == 11){
    return val.substring(0, 3) + '****' + val.substring(7);
  }else{
    return val;
  }
});

/** 是否已加入待阅 */
Handlebars.registerHelper('isMarked',function(list, options){
  if(!list){
    return options.inverse(this);
  }

  var user = Yihu.store.get('user');
  if(!user){
    return options.inverse(this);
  }
  for(var i=0, len=list.length; i<len; i++){
    if(list[i] == user.userId){
      //满足添加继续执行
      return options.fn(this);
    }
  }
  //不满足条件执行{{else}}部分
  return options.inverse(this);
});

/**
 * 增强的if判断
 */
Handlebars.registerHelper('compare',function(v1, v2,options){
  if(v1 == v2){
    //满足添加继续执行
    return options.fn(this);
  }else{
    //不满足条件执行{{else}}部分
    return options.inverse(this);
  }
});

/**
 * list foreach
 */
Handlebars.registerHelper('iconlist',function(id, items, options){
  var out = '';
  if(!items){
    for(var i=0; i<2; i++){
      out += '<div class="half-thumbnail" style="' + (i==1 ? 'float: right' : '') + '"><a href="article.html?id={0}"><img src="images/transparent.png" alt="" width="100%" height="176" border="0"/></a><span class="cancel-pin">待阅已取消</span></div>'.format(id);
    }
    return out;
  }

  for(var j=0, l=items.length; j<l; j++) {
    var item = items[j];
    out += '<div class="half-thumbnail" style="' + (j==1 ? 'float: right' : '') + '"><a href="article.html?id={0}"><img src="images/transparent.png" alt="" width="100%" height="176" border="0" style="background:url({1}?h=176) no-repeat center center; background-size: cover;"/></a><span class="cancel-pin">待阅已取消</span></div>'.format(id, Yihu.constants.psCtx + '/download/' + item.id);
    if(l<2){
      out += '<div class="half-thumbnail" style="float:right"><a href="article.html?id={0}"><img src="images/transparent.png" alt="" width="100%" height="176" border="0"/></a><span class="cancel-pin">待阅已取消</span></div>'.format(id);
    }
  }
  return out;
});