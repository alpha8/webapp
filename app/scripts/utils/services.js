var Yihu = Yihu || {};
var timer;

Yihu.store = {
  set: function(key ,value, expires){
    if(window.localStorage){
      //h5
      window.localStorage.setItem(key, JSON.stringify(value));
    }else{
      //cookie
      Cookie.add(key, JSON.stringify(value), expires || 60000*60*24*30);
    }
  },

  get: function(key){
    var val;
    if(window.localStorage){
      val = window.localStorage.getItem(key);
    }else{
      val = Cookie.get(key);
    }
    return val && JSON.parse(val);
  },

  remove: function(key){
    if(window.localStorage){
      window.localStorage.removeItem(key);
    }else{
      Cookie.remove(key);
    }
  }

};

//登录
Yihu.login = function(email, passwd){
  if(!email || email.trim().length === 0){
    layer.alert('请输入正确的邮箱或手机号', {
      skin: 'layui-layer-molv', //样式类名
      closeBtn: 0
    });
    $('#userName').focus();
    return;
  }

  if(!passwd || passwd.trim().length === 0){
    layer.alert('请输入密码', {
      skin: 'layui-layer-molv', //样式类名
      closeBtn: 0
    });
    $('#password').focus();
    return;
  }

  var user = {
    emailAddress: email,
    password: md5(passwd)
  };
  var url = Yihu.constants.webCtx + '/user/login';
  Yihu.doPost(url, user, function(data){
    if(data.result === 1){
      layer.alert('登录失败，登录信息不正确！', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }else{
      layer.msg('登录成功');
      Yihu.store.set('user', data.user);
      Yihu.launchSSOTimer();
      Yihu.closeDialog();

      $('.login-success').show().siblings().hide();
    }
  });
};

//注册
Yihu.signUp = function(email, passwd, rePasswd, type){
  var tip = '电子邮箱', isPhone = false;
  if(type == 'phone'){
    tip = '手机号码';
    isPhone = true;
  }

  if(isPhone){
    if($('#mobileReg .tip.error').length){
      return;
    }
  }else{
     if($('#emailReg .tip.error').length){
      return;
    }
  }

  // if(!email || email.trim().length === 0){
  //   layer.alert('请输入正确的' + tip, {
  //     skin: 'layui-layer-molv', 
  //     closeBtn: 0
  //   });
  //   return;
  // }
  // var verifyCode = $('#btnVerifyCode').val();
  // if(isPhone && verifyCode.trim().length === 0){
  //   layer.alert('请输入正确的手机验证码', {
  //     skin: 'layui-layer-molv',
  //     closeBtn: 0
  //   });
  //   return;
  // }

  // if(!passwd || passwd.trim().length === 0){
  //   layer.alert('请输入密码', {
  //     skin: 'layui-layer-molv',
  //     closeBtn: 0
  //   });
  //   return;
  // }

  // if(!rePasswd || rePasswd !== passwd){
  //   layer.alert('两次输入的密码不一致', {
  //     skin: 'layui-layer-molv',
  //     closeBtn: 0
  //   });
  //   return;
  // }

  var url = Yihu.constants.webCtx + '/user/regist';
  var user = {
    emailAddress: email,
    password: passwd
  };
  if(isPhone){
    url = Yihu.constants.webCtx + '/user/registByMobile';
    user.code = $('#verifycode').val();
    user.mobileNumber = email.replace(/\s/g,'');
    user.emailAddress = '';
  }
  Yihu.doPost(url, user, function(data){
    if(data.result === 1){
      layer.alert('注册失败，请稍候重试。', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }

    layer.msg('用户注册成功！');
    if(isPhone){
      Yihu.closeDialog();
    }else{
      $('.signup-form').hide();
      $('.signup-success span.email').text(email);
      $('.signup-success').show();
    }
  });
};

//忘记密码
Yihu.forgetPwd = function(email){
  if(!email || email.trim().length === 0){
    layer.alert('请输入正确的邮箱或手机号', {
      skin: 'layui-layer-molv', 
      closeBtn: 0
    });
    return;
  }

  var url = Yihu.constants.webCtx + '/user/reset/email?emailAddress={0}'.format(email);
  Yihu.doGet(url, {}, function(data){
    if(data.result === 1){
      layer.alert('找回密码失败，请确认邮箱是否正确？', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }else{
      layer.alert('重置请求已提交，请查收您的邮箱并确认！', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
    }
  });
};

//修改密码
Yihu.changePwd = function(pwd, newPwd, confirmPwd){
  var user = Yihu.store.get('user');
  if(!user){
    layer.msg('您还未登录！');
    return;
  }

  if(!pwd || pwd.trim().length === 0){
    layer.alert('请输入原始密码', {
      skin: 'layui-layer-molv',
      closeBtn: 0
    });
    return;
  }

  if(!newPwd || newPwd.trim().length === 0){
    layer.alert('请输入新密码', {
      skin: 'layui-layer-molv',
      closeBtn: 0
    });
    return;
  }

  if(!confirmPwd || confirmPwd !== newPwd){
    layer.alert('两次输入的密码不一致', {
      skin: 'layui-layer-molv',
      closeBtn: 0
    });
    return;
  }
  var userId = user.userId;
  var userObj = {
    userId: userId,
    password: pwd,
    newPassword: newPwd
  };
  var url = Yihu.constants.webCtx + '/user/changePassword';
  Yihu.doPost(url, userObj, function(data){
    if(data.result === 1){
      layer.alert('密码修改失败，请确认旧密码是否正确？', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }else{
      layer.msg('密码修改成功！');
      Yihu.closeDialog();
      return;
    }
  });
};

//用户注销
Yihu.logout = function(){
  var user = Yihu.store.get('user');
  if(!user){
    layer.msg('您还未登录！');
    return;
  }
  var userId = user.userId;
  var url = Yihu.constants.webCtx + '/user/logout/{0}'.format(userId);
  Yihu.doGet(url, {}, function(data){
    if(data.result === 1){
      layer.alert('注销失败，请稍候重试。', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }else{
      layer.msg('安全退出成功！');
      Yihu.store.remove('user');
      $('.login-success').hide().siblings().show();
      Yihu.stopSSOTimer();
    }
  });
};

//检查邮箱是否注册
Yihu.checkEmail = function(email, forget){
  var mail = email.val().trim();
  if(mail.length===0){
    email.addClass('invalid');
    return;
  }
  if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(mail)){
    email.removeClass('invalid');
  }else{
    layer.msg('请输入正确的电子邮箱地址！');
    email.addClass('invalid');
    return;
  }
  var url = Yihu.constants.webCtx + '/user/checkEmailExist?emailAddress={0}'.format(email.val().trim());
  Yihu.doGet(url, {}, function(data){
    if(!forget && data.result === 0){
      layer.alert('邮箱已注册，请直接登录！', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }

    if(!!forget && data.result === 1){
      layer.alert('邮箱未注册，请确认？', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }

  });
};

//关闭登录，注册模态框
Yihu.closeDialog = function(){
  $('#login_frame').hide();
  $('.black-overlay').hide();
};

//打开注册对话框
Yihu.openSignUpDialog = function(){
  $('.black-overlay').show();
  $('#login_frame').show();
  $('.email-signup').show().siblings('div').not('.close').hide();
  $('.signup-success').hide();
  $('.signup-form').show();
};

//切换登录，注册，忘记密码
Yihu.switchLogin = function(id){
  $('.black-overlay').show();
  $('#login_frame').addClass('switching').show().delay(800).queue(function() {
    $(this).removeClass('switching');
    $(this).dequeue();
  });
  $(id).show().siblings('div').not('.close').hide();
};

//加入我的待阅
Yihu.mark = function(id, module, o, fromCart, cancel){
  var self = o ? $(o) : $(this);
  if(self.hasClass('selected')){
    return;
  }

  var top = $(window).scrollTop();
  var flyer = $('<img class="u-flyer" src="images/sprite/logo.jpg">'); 
  flyer.fly({ 
    start: { 
      left: self.offset().left, //开始位置（必填）#fly元素会被设置成position: fixed 
      top: self.offset().top - top //开始位置（必填） 
    }, 
    end: { 
      left: $('.top-navbar').offset().left + 695, //结束位置（必填） 
      top: 25, //结束位置（必填） 
      width: 0, //结束时宽度 
      height: 0 //结束时高度 
    }, 
    autoPlay: true, //是否直接运动,默认true
    speed: 1.0, //越大越快，默认1.2
    onEnd: function(){ //结束回调 
      //$("#msg").show().animate({width: '250px'}, 200).fadeOut(1000); //提示信息 
      //addcar.css("cursor","default").removeClass('orange').unbind('click'); 
      this.destroy(); //移除dom 
    } 
  }); 

  var user = Yihu.store.get('user') || {};
  var url = Yihu.constants.webCtx + '/user/collect';

  var artId, articleId;
  if(module == Yihu.constants.like.artwork){
    artId = id;
  }else if(module == Yihu.constants.like.article){
    articleId = id;
  }
  Yihu.doPost(url, {
    userId: user.userId,
    type: module,
    artworkId: artId,
    articleId: articleId,
    fromCart: fromCart || false
  }, function(data){
    layer.msg('加入我的待阅成功！');
    if(o && !cancel){
      $(o).addClass('selected').html('已关注');
    }
    return;
  });
};

//取消待阅
Yihu.unFollow = function(id, module, o){
  var user = Yihu.store.get('user') || {userId: 0};
  var url = Yihu.constants.webCtx + '/user/collect?userId={0}&type={1}&artworkId={2}&articleId={3}';

  if(module == Yihu.constants.like.artwork){
    url = url.format(user.userId, module, id, '');
  }else if(module == Yihu.constants.like.article){
    url = url.format(user.userId, module, '', id);
  }
  Yihu.doDelete(url, {}, function(data){
    if(data.result === 0){
      layer.msg('取消待阅成功！');
      if(o){
        if(module == Yihu.constants.like.article){
          $(o).closest('.article2017-box').addClass('locked').find('.cancel-pin').fadeIn();
        }else{
          $(o).closest('.block').addClass('locked').find('.cancel-pin').fadeIn();
        }
        $(o).removeClass('selected').html('重新待阅').unbind().removeAttr('onclick').bind('click touchstart', function(e){
          e.preventDefault();
          Yihu.mark(id, module, o, false, true);

          $(o).addClass('selected').html('取消待阅').unbind().bind('click touchstart', function(e1){
            e1.preventDefault();
            Yihu.unFollow(id, module, o);
          });
          
          if(module == Yihu.constants.like.article){
            $(o).closest('.article2017-box').removeClass('locked').find('.cancel-pin').fadeOut();
          }else{
            $(o).closest('.block').removeClass('locked').find('.cancel-pin').fadeOut();
          }
        });
      }
      return;
    }
  });
};

//刷新SSO
Yihu.refreshSSO = function(){
  var user = Yihu.store.get('user');
  if(!user){
    Yihu.stopSSOTimer();
    return;
  }

  var userId = user.userId;
  var url = Yihu.constants.webCtx + '/user/isValid/{0}?r={1}'.format(userId, Math.random());
  Yihu.doGet(url, {}, function(data){
    if(data.result === 1){
      window.location.href = 'main.html';
      return;
    }  
  });
};

Yihu.checkLogined = function(){
  var user = Yihu.store.get('user');
  if(!!user){
    Yihu.launchSSOTimer();
  }else{
    var val = parseInt(+new Date() + Math.random()*10000);
    Cookie.add('nologin', val, 60000*60*24*5);
  }
  return !!user;
};

Yihu.launchSSOTimer = function(){
  Yihu.stopSSOTimer();
  timer = setInterval(function(){
    Yihu.refreshSSO();
  }, 19*60000);
};

Yihu.stopSSOTimer = function(){
  if(timer){
    clearInterval(timer);
  }
};

//图片预览
Yihu.playPhotos = function(elemId){
  layer.ready(function(){ //为了layer.ext.js加载完毕再执行
    layer.photos({
      photos: elemId,
      anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
    });
  });
};

//添加购物车
Yihu.addCart = function(pid, name, count, icon){
  var user = Yihu.store.get('user');
  var cart = {
    userId: user && user.userId,
    pid: pid,
    pName: name,
    pIcon: icon,
    count: count || 1
  };
  var url = Yihu.constants.webCtx  + '/shoppingCart';
  Yihu.doPost(url, cart, function(data){
    if(data.result === 0){
      layer.msg('加入购物车成功！');
      return;
    }else{
      layer.alert('加入购物车失败，请稍候再试？', {
        skin: 'layui-layer-molv', //样式类名
        closeBtn: 0
      });
      return;
    }
  });
};

//替换成图片延迟HTML
Yihu.replaceLazyHtml = function(html){
  if(!html){
    return '';
  }
  var regex = new RegExp('(img src=")(\\S)*(")','g'); 
  var array = html.match(regex); 
  if(!array){
    return html;
  }

  for(var i=0; i<array.length;i++){
    var str = array[i]; 
    var src = str.substring(str.indexOf('src')+5, str.length-1);
    html = html.replace(str, 'img class="lazy" data-original="'+src+'" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"') ;
  }
  return html;
};

Yihu.restoreRawHtml = function(html){
  if(!html){
    return '';
  }
  var regex = new RegExp('(img class="lazy" data-original=")(\\S)*(")','g'); 
  var array = html.match(regex); 
  if(!array){
    return html;
  }
  for(var i=0; i<array.length;i++){
    var str = array[i]; 
    var src = str.substring(str.indexOf('data-original')+'data-original'.length+2, str.length-1);
    html = html.replace('src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"', '').replace(str, 'img src="'+src+'"');
  }
  return html;
};

Yihu.launchIM = function(){
  layer.msg('咨询模块还在开发中！', { icon: 4, time: 1500 });
};