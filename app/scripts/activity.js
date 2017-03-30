var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx, cmsCtx = Yihu.constants.cmsCtx;
(function($) {
  $(document).ready(function(){
    Activity.loadList();

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

  });

})(jQuery);

var Activity = window.Activity = {
  //加载活动列表
  loadList: function(){
    var page = $('input[name=\'pageIndex\']');
    var tpl = $('#activity-tpl').html();
    var template = Handlebars.compile(tpl);

    Yihu.doGet(ctx + '/user/activity/list?currentPage={0}'.format(page.val()), {}, function(data){
      $('#activities').html(template(data));
    });
  },

  showDialog: function(o){
    $('input[name=\'aid\']').val($(o).data('id'));

    layer.open({
      type: 1,
      area: '800px',
      title: '活动报名表',
      shade: 0.6, //遮罩透明度
      content: $('#acti-apply')
    }); 
  },

  //提交表单
  saveForm: function(o){
    if(Activity.validForm()){
      return false;
    }
    var receiver = $('input[name="receiver"]').val();
    var mobilePhone = $('input[name="mobilePhone"]').val();
    var code = $('input[name="verifyCode"]').val();
    var address = $('input[name="address"]').val();
    var email = $('input[name="email"]').val();
    var user = Yihu.store.get('user');
    var aid = $('input[name="aid"]').val();

    var form = {
      aid: aid,
      name: receiver,
      mobile: mobilePhone, 
      address: address,
      email: email,
      code: code,
      userId: user && user.userId
    };
    Yihu.doPost(ctx + '/user/activity/signup', form, function(data){
      if(data.result === 0){
        layer.msg('活动登记成功！');
        $('#'+aid + ' .btn-applied').removeAttr('onclick').attr('disabled', 'disabled').addClass('disabled');
        $('.edit-addr-form')[0].reset();
      }else{
        layer.msg('活动报名失败或您已经参与过此活动!');
      }
      setTimeout(function(){
        layer.closeAll();
      }, 500);
    }, function(err){
      $(o).removeClass('disabled').removeAttr('disabled');
    });
  },

  //关闭表单
  closeDialog:function(dialogId){
    $(dialogId).hide();
  }, 

  //表单合法性验证
  validForm: function(){
    var flag = false;
    $('#acti-apply .required').each(function(i, item){
      if('' === $(item).val().trim()){
        flag = true;
      }
    });

    $('#btnSave').attr('disabled', 'disabled');
    if(!flag){
      $('#btnSave').removeAttr('disabled').removeClass('disabled');
    }
    return flag;
  }

};

(function($){
  $(document.body).ready(function(){
    $('#acti-apply .required').blur(function(e){
      e.preventDefault();
      var self = $(this);
      var tips = self.siblings('span.tips');

      var len = self.val().trim().length;
      var errorType = '';
      var error = false;
      if(self.val().trim() === ''){
        error = true;
      }else if(self.attr('length') && parseInt(self.attr('length')) != len){
        error = true;
        errorType = 'length';
      }else if(self.attr('min-length') && len < parseInt(self.attr('min-length'))){
        error = true;
        errorType = 'min-length';
      }else if(self.attr('max-length') && len > parseInt(self.attr('max-length'))){
        error = true;
        errorType = 'max-length';
      }

      if(error){
        self.addClass('form-error');
        if(errorType){
          tips.html(tips.attr(errorType + '-tips'));
        }else{
          tips.html(tips.data('tips'));
        }
      }else{
        self.removeClass('form-error');
        tips.html('');
      }

      Activity.validForm();
    });

  });
})(jQuery);