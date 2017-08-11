/** 控制台console兼容IE */
if(!window.console){
  var console  = {};
  window.console = console;

  var fns = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group','groupCollapsed','groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
  for(var i=0, l=fns.length; i<l; i++){
    var fn = fns[i];
    if(!console[fn]){
      console[fn] = function(){};
    }
  }
  if(!console.memory){
    console.memory = {};
  }
}

var _browser = function() {
  var u = navigator.userAgent;
  return {
      ie: parseInt((u.match(/(msie\s|trident\/.*rv:)(\d{1,2})/i) || [])[2]),
      safari: /version\/([\d.]+).*safari/i.test(u),
      ff: /firefox/i.test(u),
      edge: /edge/i.test(u),
      opera: /opera|opr/i.test(u),
      chrome: /chrome/i.test(u),
      mobile: /android|mobile/i.test(u),
      weixin: /micromessenger/i.test(u),
      mqq: /mqqbrowser/i.test(u)
  };
}(),

//滚动事件
_winScroll = function(c) {
    var f = true;
    return _window.scroll(function() {
        if (f) {
            setTimeout(function() {
                c();
                f = true;
            }, 300);
            f = false;
        }
    });
},
_isWifi = (navigator.connection || navigator.mozConnection || navigator.webkitConnection || {
    type: 'unknown'
}).type.toString().replace('2', 'wifi') == 'wifi',

isMobile = function() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent) ||
    window.innerWidth < 500;
};

/**
 * 频率控制 返回函数连续调用时，fn执行频率限定为多少时间执行一次
 * @param  {function} fn        需要调用的函数
 * @param  {number}   delay     延迟时间，单位毫秒
 * @param  {bool}   immediate   false绑定函数先执行
 * @param  {function} debounce  实际调用函数
 */
var throttle = function(fn, delay, immediate, debounce){
  var curr = +new Date(),
      last_call = 0,
      last_exec = 0,
      timer = null,
      diff, //时间差
      context, //上下文
      args,
      exec = function(){
        last_exec = curr;
        fn.apply(context, args);
      };
  return function(){
    curr = +new Date();
    context = this,
    args = arguments,
    diff = curr - (debounce ? last_call : last_exec) - delay;
    clearTimeout(timer);
    if(debounce){
      if(immediate){
        timer = setTimeout(exec, delay);
      }else if(diff >= 0){
        exec();
      }
    }else{
      if(diff >= 0){
        exec();
      }else if(immediate){
        timer = setTimeout(exec, -diff);
      }
    }
    last_call = curr;
  };
};

var debounce = function(fn, delay, immediate){
  return throttle(fn, delay, immediate, true);
};

/**
 * Cookie工具类
 */
var Cookie = {
  add : function(name, value, expires, path){
    var opts = {
      name:name||'',
      value:value||'',
      expires:isNaN(expires) ? 0 : expires,
      path:path||'/'
    };

    var exp = new Date();
    exp.setTime(exp.getTime() + opts.expires);
    document.cookie = opts.name + 
      '=' + escape(opts.value) + 
      ';expires=' + exp.toGMTString() + 
      ';path=' + opts.path;
  },

  get : function(name){
    var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    if(arr) {
      return unescape(arr[2]);
    }
    return null;
  },

  remove : function(name, path){
    var opts = {
      name:name||'',
      path:path||'/'
    };

    var exp = new Date();
    exp.setTime(exp.getTime() - 1000);    
    document.cookie = opts.name + 
      '=;expires=' + exp.toGMTString() + 
      ';path=' + opts.path;
  }
};
window.Cookie = Cookie;

/** 字符串处理 */
String.prototype.trim = function(){
  return this.replace(/(^\s+)|(\s+$)/g, '');
};

String.prototype.trimLeft = function(){
  return this.replace(/(^\s+)/g,'');
};

String.prototype.trimRight = function(){
  return this.replace(/(\s+$)/g,'');
};

/**
 * 字符串格式化
 * 
 * 样例："http://{0}/{1}".format('www.yihuyixi.com', 'article');
 */
String.prototype.format = function(){
  var args = arguments;
  if(args.length===0){
    return this;
  }

  var self = this;
  for(var i=0, len = args.length; i < len; i++){
    self = self.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);
  }
  return self;
};

//首字母大写
String.prototype.caption = function(){
  if(this){
    return this.charAt(0).toUpperCase() + this.substr(1);
  }
  return this;
};

//字符左填充
String.prototype.padLeft = function(padChar, width){
  var self = this;
  var padLen = width - this.length;
  if(padLen <= 0){
    return self;
  }

  var s = '';
  for(var i=0; i<padLen; i++){
    s += padChar;
  }
  return s + self;
};

//字符串右填充
String.prototype.padRight = function(padChar, width){
  var self = this;
  var padLen = width - this.length;
  if(padLen <= 0){
    return self;
  }

  var s = '';
  for(var i=0; i<padLen; i++){
    s += padChar;
  }
  return self + s;
};

//encode编码
String.prototype.encode = function(){
  return encodeURI(this);
};

//获取字符占用长度
String.prototype.getCharLength = function() {
  var self = this;
  if (!self) {
    return 0;
  }

  for ( var i = 0, l = self.length, length = 0; i < l; i++) {
    if (/[\u4E00-\uFA29]/.test(self.charAt(i))) {
      length += 3;
    } else {
      length++;
    }
  }
  return length;
};

/**
 * 时间对象的格式化;
 */
Date.prototype.format = function(format) {
  /*
   * eg:format="yyyy-MM-dd hh:mm:ss";
   */
  var o = {
    'M+' : this.getMonth() + 1, // month
    'd+' : this.getDate(), // day
    'h+' : this.getHours(), // hour
    'm+' : this.getMinutes(), // minute
    's+' : this.getSeconds(), // second
    'q+' : Math.floor((this.getMonth() + 3) / 3), // quarter
    'S' : this.getMilliseconds()
    // millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return format;
};

//数组功能扩展
Array.prototype.each = function(fn){
    fn = fn || Function.K;
     var a = [];
     var args = Array.prototype.slice.call(arguments, 1);
     for(var i = 0; i < this.length; i++){
         var res = fn.apply(this,[this[i],i].concat(args));
         if(res != null) a.push(res);
     }
     return a;
};

//数组是否包含指定元素
Array.prototype.contains = function(suArr){
    for(var i = 0; i < this.length; i ++){
        if(this[i] == suArr){
            return true;
        }
     }
     return false;
};
//不重复元素构成的数组
Array.prototype.uniquelize = function(){
     var ra = new Array();
     for(var i = 0; i < this.length; i ++){
        if(!ra.contains(this[i])){
            ra.push(this[i]);
        }
     }
     return ra;
};
//两个数组的补集
Array.complement = function(a, b){
     return Array.minus(Array.union(a, b),Array.intersect(a, b));
};
//两个数组的交集
Array.intersect = function(a, b){
     return a.uniquelize().each(function(o){return b.contains(o) ? o : null});
};
//两个数组的差集
Array.minus = function(a, b){
     return a.uniquelize().each(function(o){return b.contains(o) ? null : o});
};
//两个数组并集
Array.union = function(a, b){
     return a.concat(b).uniquelize();
};

//MD5
function md5(s){function L(k,d){return(k<<d)|(k>>>(32-d));}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H);}if(I|d){if(x&1073741824){return(x^3221225472^F^H);}else{return(x^1073741824^F^H);}}else{return(x^F^H);}}function r(d,F,k){return(d&F)|((~d)&k);}function q(d,F,k){return(d&k)|(F&(~k));}function p(d,F,k){return(d^F^k);}function n(d,F,k){return(F^(d|(~k)));}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F);}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F);}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F);}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F);}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++;}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa;}function B(x){var k='',F='',G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F='0'+G.toString(16);k=k+F.substr(F.length-2,2);}return k;}function J(k){k=k.replace(/rn/g,'n');var d='';for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x);}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128);}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128);}}}return d;}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g);}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase();}

//返回顶部
Yihu.goTop = function(){
  $('body,html').animate({ scrollTop: 0 }, 'fast');
  return false;
};

$(document).ready(function(){
  /*setTimeout(function(){
    if($('.bdsharebuttonbox').length === 0){
      window._bd_share_config={'common':{'bdSnsKey':{},'bdText':'','bdMini':'1','bdMiniList':['mshare','qzone','tsina','weixin','tqq','sqq','mail'],'bdPic':'','bdStyle':'0','bdSize':'16'},'slide':{'type':'slide','bdImg':'3','bdPos':'right','bdTop':'150'}};
      with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
    }
  }, 1000);*/

  //侧边栏事件
  $('.toolbar-wrap .toolbar-tab').hover(function(e){
    $(this).toggleClass('toolbar-tab-hover');
    return false;
  });

  //固定顶部导航栏
  if($('.top-navbar').length){
    $(window).scroll(function(e){
      if($(window).scrollTop() >= 215){
        if(!$('.top-navbar').hasClass('fixed-navbar')){
          $('.top-navbar').addClass('fixed-navbar').fadeIn();
        }
      }

      if($(window).scrollTop() <= 218){
        if($('.top-navbar').hasClass('fixed-navbar')){
          $('.top-navbar').removeClass('fixed-navbar');
        }
      }

    });
  }

  //更新顶部我的关注数量， 我的购物车数量
  /*
  var user = Yihu.store.get('user');
  var uid = (user && user.userId) || 0;
  Yihu.doGet(Yihu.constants.webCtx + '/user/collect/count?userId={0}'.format(uid), {}, function(data){
    if(data){
      $('.topbar .follow em.badge').text('('+ data +')');
    }
  });

  Yihu.doGet(Yihu.constants.webCtx + '/shoppingCart/count?userId={0}'.format(uid), {}, function(data){
    if(data){
      $('.settleup .shopping-amount').text(data);
    }
  });
  
  */
});  

//查询当前地址栏请求参数
Yihu.getReqParams = function(key){
  if(key){
    var query = location.search;
    var params = [], arr = query.replace('?','').split('&');
    for(var i=0, len = arr.length; i<len; i++){ 
      var item = arr[i];
      params.push({key: item.substring(0, item.indexOf('=')), val: item.substring(item.indexOf('=')+1)});
    }

    var val;
    for(var j in params){
      if(params[j].key == key){
        val = params[j].val;
        break;
      }
    }
    return val;
  }
};