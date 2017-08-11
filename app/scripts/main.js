(function($) {
  var psCtx = Yihu.constants.psCtx + '/download', ctx = Yihu.constants.webCtx;

  var tips = {
    email:{
      tip: '请填写您经常使用的电子邮箱',
      required: '注册邮箱不能为空',
      error: '邮箱格式不正确',
      duplicated: '该邮箱已存在，不能重复注册，请您更换其他邮箱'
    },
    phone: {
      tip: '请填写您经常使用的手机号',
      required: '手机号码不能为空',
      error: '请填写有效的11位手机号',
      duplicated: '该手机号已经注册过'
    },
    mailPhone: {
      tip: '请使用注册的邮箱或手机号登录',
      required: '登录账号不能为空',
      notExist: '登录账号不存在，赶紧注册一个吧',
      error: '亲，请使用邮箱或手机号登录吧'
    },
    verifyCode: {
      tip: '请填写您收到的手机验证码',
      required: '验证码不能为空',
      error: '您输入的手机验证码错误，请重新获取'
    },
    username: {
      tip: '用户名长度为4-15位的中英文字符、数字和下划线',
      required: '用户名不能为空',
      error: '用户名长度为4-15位的中英文字符、数字和下划线',
      duplicated: '该用户名已存在'
    },
    password: {
      tip: '密码长度大于6位英文字符、数字和下划线',
      required: '密码不能为空',
      error: '密码长度大于6位英文字符、数字和下划线',
      notSame: '两次输入的密码不一致',
      fault: '密码错误，请重新输入'
    },
    captcha: {
      tip: '请填写验证码，不区分大小写',
      required: '验证码不能为空',
      error: '验证码错误'
    }
  };

  function checkEmail(email) {
    if (!email) {
      return -1;
    }
    if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
      return 0;
    } else {
      return 1;
    }
  }

  function checkPhone(phone) {
    if (!phone) {
      return -1;
    }
    if (/^1[358][0123456789]\d{8}$/.test(phone)) {
      return 0;
    } else {
      return 1;
    }
  }

  function checkMailPhone(mix){
    if(!mix){
      return -1;
    }
    if(mix.length == 11){
      return checkPhone(mix);
    }else{
      return checkEmail(mix);
    }
  }

  function checkUsername(username) {
    if (!username) {
      return -1;
    } else if (username.getCharLength() < 4 || username.getCharLength() > 15) {
      return 2;
    }
    if (/^[a-zA-Z0-9_\u4E00-\uFA29]*$/.test(username)) {
      return 0;
    }
    return 1;
  }

  function checkPassword(value, passwd) {
    if (!value) {
      return -1;
    } else if (value.length < 6) {
      return 3;
    }

    if (value && passwd) {
      if (/^[\w]{6,}$/.test(value) && value == passwd) {
        return 0;
      }else{
        return 1;
      }
    } else if (value) {
      if (/^[\w]{6,}$/.test(value)) {
        return 0;
      }
    } 
    return 2;
  }

  function checkCaptcha(captcha) {
    if (!captcha) {
      return -1;
    }

    if (/^[a-zA-Z0-9]{4}$/.test(captcha)) {
      return 0;
    } else {
      return 1;
    }
  }

  function checkVerifyCode(code){
    if(!code){
      return -1;
    }

    if(/^[0-9]{6}$/.test(code)){
      return 0;
    }
    return 1;
  }

  /** 手机验证码 */
  $(document).on('focus', '.verify-code', function(){
    $(this).siblings('.tip').html(tips.verifyCode.tip).removeClass('error').show();
  }).on('blur', '.verify-code', function() {
    var self = $(this),
      code = self.val().trim();
    var mobileEl = self.attr('check-mobile');
    var mobileNo = mobileEl ? $(mobileEl).val().replace(/\s/g,'') : '';

    switch(checkVerifyCode(code)){
      case -1:
        self.siblings('.tip').html(tips.verifyCode.required).addClass('error');
        break;
      case 0: 
        Yihu.doGet(ctx + '/user/verificationCodeByMobile?mobileNumber={0}&code={1}'.format(mobileNo, code), {}, function(data){
          if(data.result == 1){
            $(self).siblings('.tip').html(tips.verifyCode.error).addClass('error');
          }else{
            self.siblings('.tip').hide();
            self.next('.correctIco').show();
          }
        });
        break;
      case 1:
        $(self).siblings('.tip').html(tips.verifyCode.error).addClass('error');
        break;
      default:
        $(self).siblings('.tip').html(tips.verifyCode.error).addClass('error');
        break;
    }
  });

  /** 用户名 */
  // $(document).on('focus', '.vip-icon', function(){
  //   $(this).siblings('.tip').html(tips.username.tip).removeClass('error').show();
  // }).on('blur', '.vip-icon', function() {
  //   var self = $(this),
  //     username = self.val().trim();
  //   self.next('.correctIco').hide();

  //   switch(checkUsername(username)){
  //     case -1:
  //       self.siblings('.tip').html(tips.username.required).addClass('error');
  //       break;
  //     case 0: 
  //       //TODO: ajax检查用户名是否唯一
  //       // $(self).siblings(".tip").html(tips.username.duplicated).addClass("error");
  //       self.siblings('.tip').hide();
  //       self.next('.correctIco').show();
  //       break;
  //     case 1:
  //       $(self).siblings('.tip').html(tips.username.error).addClass('error');
  //       break;
  //     default:
  //       $(self).siblings('.tip').html(tips.username.error).addClass('error');
  //       break;
  //   }
  // });

  /** 用户密码 */
  $(document).on('focus', '.pass-icon', function(){
    $(this).siblings('.tip').html(tips.password.tip).removeClass('error').show();
  }).on('blur', '.pass-icon', function() {
    var self = $(this),
      comparePwd = self.attr('samePassword'),
      remoteCheck = self.attr('remote-check'),
      password = self.val().trim();
    self.next('.correctIco').hide();

    var samePassword = comparePwd ? $(comparePwd).val() : '';
    switch(checkPassword(password, samePassword)){
      case -1:
        self.siblings('.tip').html(tips.password.required).addClass('error');
        break;
      case 0: 
        self.siblings('.tip').hide();
        self.next('.correctIco').show();
        break;
      case 1:
        $(self).siblings('.tip').html(tips.password.notSame).addClass('error');
        break;
      default:
        $(self).siblings('.tip').html(tips.password.error).addClass('error');
        break;
    }
  });

  /** 邮箱 */
  $(document).on('focus', '.email', function(){
    $(this).siblings('.tip').html(tips.email.tip).removeClass('error').show();
  }).on('blur', '.email', function() {
    var self = this,
      email = $(this).val();
    $(this).next('.correctIco').hide();

    switch (checkEmail(email)) {
      case -1:
        $(self).siblings('.tip').html(tips.email.required).addClass('error');
        break;
      case 0:
        Yihu.doGet(ctx + '/user/checkEmailExist?emailAddress={0}'.format(email), {}, function(data){
          if(data.result === 0){
            $(self).siblings('.tip').html(tips.email.duplicated).addClass('error');
          }else{
            $(this).next('.correctIco').show();
            $(this).siblings('.tip').hide();
          }
        });
        break;
      case 1:
        $(self).siblings('.tip').html(tips.email.error).addClass('error');
        break;
      default:
        $(self).siblings('.tip').html(tips.email.tip);
        break;
    }
  });

  /** 手机或邮箱登录 */
  $(document).on('focus', '.user-icon', function(){
    $(this).siblings('.tip').html(tips.mailPhone.tip).removeClass('error').show();
  }).on('blur', '.user-icon', function() {
    var self = this,
      mix = $(this).val();
    $(this).next('.correctIco').hide();

    switch (checkMailPhone(mix)) {
      case -1:
        $(self).siblings('.tip').html(tips.mailPhone.required).addClass('error');
        break;
      case 0:
        $(this).next('.correctIco').show();
        $(this).siblings('.tip').hide();
        break;
      case 1:
        $(self).siblings('.tip').html(tips.mailPhone.error).addClass('error');
        break;
      default:
        $(self).siblings('.tip').html(tips.mailPhone.tip);
        break;
    }
  });

  /** 手机 */
  $(document).on('focus', '.phone', function() {
    $(this).siblings('.tip').html(tips.phone.tip).removeClass('error').show();
  }).on('blur', '.phone', function() {
    var self = this,
      phone = $(this).val().replace(/\s/g, '');

    switch(true){
      case phone.length > 7:
        $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3, 4) + ' ' + phone.substr(7));
        break;
      case phone.length > 3:
        $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3));
        break;
      default:
        $(this).val(phone);
        break;
    }

    $(this).next('.correctIco').hide();
    switch (checkPhone(phone)) {
      case -1:
        $(self).siblings('.tip').html(tips.phone.required).addClass('error');
        break;
      case 0:
        Yihu.doGet(ctx + '/user/checkMobileNumberExist?mobileNumber={0}'.format(phone), {}, function(data){
          if(data.result === 0){
            $(self).siblings('.tip').html(tips.phone.duplicated).addClass('error');
          }else{
            $(this).next('.correctIco').show();
            $(this).siblings('.tip').hide();
          }
        });
        break;
      case 1:
        $(self).siblings('.tip').html(tips.phone.error).addClass('error');
        break;
      default:
        $(self).siblings('.tip').html(tips.phone.tip);
    }
  }).on('keyup', '.phone', function(event){
    var phone = $(this).val().replace(/\s/g,''),
      phoneL = phone.length,
      keyCode = event.keyCode || event.charCode;

    switch(true){
      case phoneL > 7:
        $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3, 4) + ' ' + phone.substr(7));
        break;
      case phoneL == 7:
        if(keyCode != 8 && keyCode != 46){
          $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3, 4) + ' ' + phone.substr(7));
        } else {
          if(phoneL >= 3){
            $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3));
          } else {
            $(this).val(phone);
          }
        }
        break;
      case phoneL > 3:
        $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3));
        break;
      case phoneL == 3:
        if(keyCode != 8 && keyCode != 46){
          $(this).val(phone.substr(0, 3) + ' ' + phone.substr(3));
        } else {
          $(this).val(phone);
        }
        break;
      default:
        $(this).val(phone);
    }
  });

  $(document).ready(function(){
    if(Yihu.checkLogined()){
      $('.login-success').show().siblings().hide();
    }

    //加载轮播广告
    if($('.sliders').length){
      var bannerTpl = 
      '<div id="bannerSliders" class="slideBox">' + 
        '<ul class="items">{{#posters}}<li><a {{#if url}}href="{{url}}" target="_blank" {{else}}href="javascript:;"{{/if}} title="{{title}}"><img src="{{ps fileId}}" height="484" width="1210"></a></li>{{/posters}}</ul>' +
      '</div>' + 
      '<div class="slideBottom"><ul>{{#posters}}<li><a {{#if url}}href="{{url}}" target="_blank" {{else}}href="javascript:;"{{/if}} title="{{title}}"><i class="fa fa-dot-circle-o"></i> <span>{{title}}</span></a></li>{{/posters}}</ul></div>';
      Yihu.doGet(Yihu.constants.webCtx + '/poster/list', {}, function(data){
        var template = Handlebars.compile(bannerTpl);
        $('.sliders').html(template(data));
        
        //广告轮播
        $('#bannerSliders').slideBox({
          duration : 0.3,//滚动持续时间，单位：秒
          easing : 'linear',//swing,linear//滚动特效
          delay : 3,//滚动延迟时间，单位：秒
          hideClickBar : false,//不自动隐藏点选按键
          hideBottomBar: true,
          clickBarRadius : 10,
          height: 484
        });

      });
    }

    //获取手机验证码
    $('#btnVerifyCode').bind('touchstart click', function(e){
      e.preventDefault();
      var self = $(this);
      var mobileEl = self.attr('check-mobile');
      if(mobileEl){
        if($(mobileEl).val().trim().length === 0){
          layer.msg('请输入手机号码，再点击发送验证码！');
          return;
        }else if($(mobileEl).siblings('.tip.error').length){
          layer.msg('请输入正确的手机号码!');
          return;
        }
      }

      if(self.hasClass('btn-white')){
        return;
      }

      var phone = $(mobileEl).val().replace(/\s/g,'');
      Yihu.doGet(ctx + '/user/code?mobileNumber={0}'.format(phone), {}, function(data){
        if(data.result === 0){
          console.log('验证码下发成功！');
        }
      });

      var seconds = 60;
      self.removeClass('btn-primary').addClass('btn-white').html('<em>{0}</em>秒后重新发送'.format(seconds--));
      self.siblings('.tip').show();
      var timer = setInterval(function(){
        self.html('<em>{0}</em>秒后重新发送'.format(seconds--));
        if(seconds < 0){
          clearInterval(timer);
          self.addClass('btn-primary').removeClass('btn-white').html('获取手机验证码');
        }
      }, 1000);
    });

    //TAB标签卡切换
    $('.tab>li').bind('touchstart click', function(e){
      e.preventDefault();
      var self = $(this);
      if(self.hasClass('dropdown')){
        self.children('.dropdown-menu').toggle();
        return false;
      }

      self.addClass('active').siblings().removeClass('active');

      var selector = self.children('a').attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');

      var triggerEvent = $(this).data('trigger');
      if('waterfall'==triggerEvent){
        var prefix = selector.replace('#','');
        if(!prefix){
          return false;
        }
        var picasa = selector + ' .waterflow >.picasa';
        var panel = self.data('panel');
        if(panel && (!$(panel + '>.picasa').length)){
          var htm = '<div class="waterflow" id="{0}"><div class="picasa"></div></div>'.format(panel.replace('#',''));
          $('#'+prefix).append(htm);
          $(panel).addClass('active').siblings().removeClass('active');
          prefix = panel.replace('#','');
          picasa = panel + '>.picasa';
        }else if(!$(selector + ' .waterflow >.picasa').length){
          var html = '<div class="tab-pane" id="{0}"><div class="waterflow show"><div class="picasa"></div></div></div>'.format(prefix);
          self.closest('.mc').find('.tab-content').append(html);
          $(selector).addClass('active').siblings().removeClass('active');
        }

        var keyword = self.find('span').text();
        var category = self.data('cat');
        var time = self.data('time');

        var params = { pageSize: 10};
        if(category){
          params.categoryParentName = category;
        }else{
          params.keyword = keyword || '';
        }

        if(time){
          params.shelfTime = time;
        }
        $(picasa).waterflow({
          itemCls: 'block',
          prefix: prefix,
          maxPage: 3,
          params: params,
          path: function(page) {
            return ctx + '/artwork/list?currentPage='+page;
          }
        });
      }else if('article'==triggerEvent){
        var articleId = $(this).data('id');
        Yihu.doGet(ctx + '/article/{0}'.format(articleId), {}, function(data){
          var tpl = $('#article-tpl').html();
          var template = Handlebars.compile(tpl);
          $(selector).html(template(data));

          if($('.ke-article').length){
            $('.ke-article').find('.ke-article-header').hide().siblings('.ke-article-body').show();
            $('.ke-article').each(function(i, item){
              var self = $(item);
              var id = self.attr('id');
              if(id){
                Yihu.doGet(ctx + '/article/{0}'.format(self.attr('id')), {}, function(data){
                  self.find('.ke-article-body').html(data.content);
                  $('img.lazy').lazyload({
                    threshold : 200
                  });
                });
              }
            });
          }

          $('img.lazy').lazyload({
            threshold : 200
          });
        });
      }
    });

    //tab下拉菜单事件绑定
    $('.tab .dropdown-menu>li').on('touchstart click', function(e){
      e.preventDefault();

      var nodeA = $(this).children('a');
      var text = nodeA.text();
      $(this).parent().parent().addClass('active').siblings().removeClass('active');

      var selector = nodeA.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');
      
      var target = $(this).parent().siblings('a');
      target.children('span').text(text.substring(0, text.indexOf('(')));
      target.children('em').text('('+nodeA.data('count')+')');

      var triggerEvent = $(this).data('trigger');
      if('waterfall'==triggerEvent){
        var prefix = selector.replace('#','');
        if(!prefix){
          return false;
        }

        if(!$(selector + ' .waterflow >.picasa').length){
          var html = '<div class="tab-pane" id="{0}"><div class="waterflow show"><div class="picasa"></div></div></div>'.format(prefix);
          $(this).closest('.mc').find('.tab-content').append(html);
          $(selector).addClass('active').siblings().removeClass('active');
        }

        $(selector + ' .waterflow>.picasa').waterflow({
          itemCls: 'block',
          prefix: prefix,
          maxPage: 3,
          params: { pageSize: 10, keyword: '', query: nodeA.data('query') || '' },
          path: function(page) {
            return ctx + '/artwork/list?currentPage='+page;
          }
        });

      }
    });

    //TAB内部分类列表切换
    $('.tab-pane .category>li').bind('touchstart click', function(e){
      e.preventDefault();
      
      var self = $(this);
      self.addClass('active').siblings().removeClass('active');
      var selector = self.children('a').attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');

      //加载瀑布流数据
      var prefix = selector.replace('#','');
      if(!prefix){
        return false;
      }
      if(!$(selector + '>.picasa').length){
        var html = '<div class="waterflow" id="{0}"><div class="picasa"></div></div>'.format(prefix);
        self.closest('.tab-pane').append(html);
        $(selector).addClass('active').siblings().removeClass('active');
      }

      var keyword = self.find('span').text();
      var category = self.data('cat');
      var params = { pageSize: 10};
      if(category){
        params.categoryParentName = category || '';
      }else{
        params.keyword = keyword || '';
      }
      $(selector + '>.picasa').waterflow({
        itemCls: 'block',
        prefix: prefix,
        maxPage: 3,
        params: params,
        path: function(page) {
          return ctx + '/artwork/list?currentPage='+page;
        }
      });
    });

    // $('.bigPage').unbind('touchstart click').bind('touchstart click', function(e){
    //   e.preventDefault();

    //   $(this).toggleClass('on').children('i').toggleClass('fa-unlock-alt').toggleClass('fa-lock');
    // });

    //加载主人房
    if($('#masterRoom').length){
      var keyword = $('#indoor>ul.category>li.active span').text();
      //初始化瀑布流（价值->主人房）
      $('#masterRoom>.picasa').waterflow({
        itemCls: 'block',
        prefix: 'masterRoom',
        maxPage: 2,
        params: {pageSize: 10, keyword: keyword || ''},
        path: function(page) {
          return ctx + '/artwork/list?currentPage='+page;
        }
      });
    }

    //加载交易国画
    if($('#chinaPaint').length){
      var china = $('#today>ul.category>li.active').data('cat');
      //初始化瀑布流（交易->国画）
      $('#chinaPaint>.picasa').waterflow({
        itemCls: 'block',
        prefix: 'chinaPaint',
        maxPage: 3,
        params: {pageSize: 10, categoryParentName: china || ''},
        path: function(page) {
          return ctx + '/artwork/list?currentPage='+page;
        }
      });
    }

    //加载国画
    if($('#gh').length){
      var gh = $('#lab>li.active').data('cat');
      //加载国画交易数据
      $('#gh .waterflow > .picasa').waterflow({
        itemCls: 'block',
        prefix: 'gh',
        maxPage: 3,
        params: {pageSize: 10, categoryParentName: gh || ''},
        path: function(page) {
          return ctx + '/artwork/list?currentPage='+page;
        }
      });
    }

    //点击详情和收起按钮事件
    $('.tab-pane .btn-detail').unbind('touchstart click').bind('touchstart click', function(e){
      e.preventDefault();
      var that = $(this);
      that.toggleClass('expanded');

      if(that.hasClass('expanded')){
        that.text('收起');
        that.parent().siblings('.intro').css('height', 'auto');  
      }else{
        that.text('详情');
        that.parent().siblings('.intro').css('height', '20px');  
      }
    });

    Yihu.doGet(ctx + '/artwork/records', {}, function(data){
      if(data.result === 0){
        $('a[data-name=\'hall\']>em').text('('+ data.hall + ')');
        $('a[data-name=\'masterRoom\']>em').text('('+ data.masterRoom + ')');
        $('a[data-name=\'bookRoom\']>em').text('('+ data.bookRoom + ')');
        $('a[data-name=\'childrenRoom\']>em').text('('+ data.childrenRoom + ')');
        $('a[data-name=\'dinning\']>em').text('('+ data.dinning + ')');
        $('a[data-name=\'corridor\']>em').text('('+ data.corridor + ')');
        $('a[data-name=\'chinesePalonging\']>em').text('('+ data.chinesePalonging + ')');
        $('a[data-name=\'oilPalonging\']>em').text('('+ data.oilPalonging + ')');
        $('a[data-name=\'watercolor\']>em').text('('+ data.watercolor + ')');
        $('a[data-name=\'calligraphy\']>em').text('('+ data.calligraphy + ')');
        $('a[data-name=\'p1_99\']').data('count', data.p1_99);
        $('a[data-name=\'p100_999\']').data('count', data.p100_999);
        $('a[data-name=\'p1000_1999\']').data('count', data.p1000_1999);
        $('a[data-name=\'p2000up\']').data('count', data.p2000up);
        $('a[data-name=\'p1_99\']>em').text('('+ data.p1_99 + ')');
        $('a[data-name=\'p100_999\']>em').text('('+ data.p100_999 + ')');
        $('a[data-name=\'p1000_1999\']>em').text('('+ data.p1000_1999 + ')');
        $('a[data-name=\'p2000up\']>em').text('('+ data.p2000up + ')');

        var total = data.p1_99 + data.p100_999 + data.p1000_1999 + data.p2000up;
        $('a[data-name=\'p-all\']').data('count', total);
        $('a[data-name=\'p-all\']>em').text('('+ total + ')');
      }
    });

  });

  //关闭dropdown菜单
  // $(document).off("mousedown",closeDropdownMenu).on("mousedown",closeDropdownMenu);
  // $(window).off("resize",closeDropdownMenu).on("resize",closeDropdownMenu);
  // function closeDropdownMenu(){
  //   $(".dropdown-menu").hide();
  // }

})(jQuery);