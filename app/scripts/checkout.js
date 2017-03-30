var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx;

var Checkout = window.Checkout = {
  //显示或展开更多地址
  toggleAddr: function(o){
    $(o).toggleClass('hide').siblings('.addr-switch').toggleClass('hide');
    if($('.expandAddr').hasClass('hide')){
      //展开
      var wrap = $(o).siblings('.consignee-content').find('.ui-scrollbar-wrap');
      if(wrap.height() >= 80){
        $(o).siblings('.consignee-content').css({height: '168px'}).find('.ui-scrollbar-wrap').css({height: '168px'});
      }
    }else{
      //收起
      $(o).siblings('.consignee-content').css({height: '50px'}).find('.ui-scrollbar-wrap').css({height: 'auto'});

      var consignee = $('.consignee-list .consignee-item.item-selected').closest('li').clone(true);
      $('.consignee-list .consignee-item.item-selected').closest('li').remove();
      $('.consignee-list').prepend(consignee);
    }
  },

  //设为默认地址
  setDefaultAddr: function(o){
    var parentNode = $(o).closest('li');
    parentNode.find('.addr-detail').append('<span class="addr-default">默认地址</span>');

    var brotherNodes = parentNode.find('.consignee-item').addClass('item-selected').closest('li').siblings('li');
    brotherNodes.find('.consignee-item').removeClass('item-selected');
    brotherNodes.find('.addr-detail span.addr-default').remove();
    $('.consignee-list .op-btns a.defaultAddr').show();
    $(o).hide();

    Yihu.doPost(ctx + '/user/address/default', {
      id: parentNode.attr('id'),
      default: true
    }, function(data){
      if(data.result !== 0){
        console.log(data);
      }
    });
  },

  //添加收货人
  addReceive: function(){
    $('#editAddr').show();
  },

  //编辑收货人
  editReceive: function(o){
    $('#editAddr').show();
    var itemNode = $(o).closest('li');
    var id = itemNode.attr('id') || '';
    $('input[name="receiver"]').val(itemNode.data('name'));
    $('input[name="id"]').val(id);
    $('input[name="mobilePhone"]').val(itemNode.data('mobile'));
    $('input[name="address"]').val(itemNode.data('address'));
    $('input[name="postcode"]').val(itemNode.data('postcode'));
    $('input[name="email"]').val(itemNode.data('email'));
    $('input[name="tag"]').val(itemNode.data('tag'));
  },

  //提交收货人表单
  saveReceive: function(o){
    if(Checkout.validForm()){
      return false;
    }
    var id = $('input[name="id"]').val();
    var receiver = $('input[name="receiver"]').val();
    var mobilePhone = $('input[name="mobilePhone"]').val();
    var address = $('input[name="address"]').val();
    var postcode = $('input[name="postcode"]').val();
    var email = $('input[name="email"]').val();
    var tag = $('input[name="tag"]').val();
    var province = $('#s_province').val();
    var city = $('#s_city').val();
    var country = $('#s_county').val();
    var user = Yihu.store.get('user');

    if(id){
      var editForm = {
        id: id,
        name: receiver,
        mobile: mobilePhone, 
        address: province + city + country + address,
        postcode: postcode,
        email: email,
        userId: user && user.userId,
        tag: tag 
      };
      Yihu.doPut(ctx + '/user/address', editForm, function(data){
        if(data.result === 0){
          layer.msg('更新收货地址成功！');
        }
        $('input[name="id"]').val('');
        $('.edit-addr-form')[0].reset();
        Checkout.loadAddressList();
      }, function(err){
        $(o).removeClass('disabled').removeAttr('disabled');
      });
    }else{
      var form = {
        name: receiver,
        mobile: mobilePhone, 
        address: province + city + country + address,
        postcode: postcode,
        email: email,
        userId: user && user.userId,
        tag: tag 
      };
      Yihu.doPost(ctx + '/user/address', form, function(data){
        if(data.result === 0){
          layer.msg('新增收货地址成功！');
        }
        Checkout.loadAddressList();
      }, function(err){
        $(o).removeClass('disabled').removeAttr('disabled');
      });
    }
  },

  //关闭添加收货人表单
  closeDialog:function(dialogId){
    $(dialogId).hide();
  }, 

  //表单合法性验证
  validForm: function(){
    var flag = false;
    $('#editAddr .form-control[required]').each(function(i, item){
      var self = $(item), len = self.val().length;
      if('' === self.val().trim()){
        flag = true;
      }else if(self.attr('length') && parseInt(self.attr('length')) != len){
        flag = true;
      }else if(self.attr('min-length') && len < parseInt(self.attr('min-length'))){
        flag = true;
      }else if(self.attr('max-length') && len > parseInt(self.attr('max-length'))){
        flag = true;
      }
    });

    $('#btnSaveReceive').attr('disabled', 'disabled');
    if(!flag){
      $('#btnSaveReceive').removeAttr('disabled').removeClass('disabled');
    }
    return flag;
  },

  //加载地址列表
  loadAddressList: function(){
    var user = Yihu.store.get('user');
    var userId = (user && user.userId) || 0;
    Yihu.doGet(ctx + '/user/addressList?userId={0}'.format(userId), {}, function(data){
      var tpl = $('#consignee-tpl').html();
      var template = Handlebars.compile(tpl);
      $('#consignee-list').html(template(data));
    });
  },

  //加载商品清单
  loadProductList: function(){
    var user = Yihu.store.get('user');
    var uid = (user && user.userId) || 0;

    Yihu.doGet(ctx + '/shoppingCart/list?userId={0}'.format(uid),{}, function(data){
      if(data && data.carts.length){
        var tpl = $('#goods-tpl').html();
        var template = Handlebars.compile(tpl);
        $('.goods-list').html(template(data));
      }
    });
  },

  //选择收件人
  chooseConsignee: function(o){
    $(o).addClass('item-selected').closest('li').siblings('li').find('.consignee-item').removeClass('item-selected');
  },

  //删除收件人
  removeReceive: function(o){
    var itemNode = $(o).closest('li');
    var id = itemNode.attr('id');
    Yihu.doDelete(ctx + '/user/address?id={0}'.format(id), {}, function(data){
      if(data.result === 0){
        layer.msg('此收货人信息删除成功！');
        itemNode.remove();
      }
    });
  }
};

(function($){
  $(document.body).ready(function(){
    // $(".consignee-list .consignee-item").bind("touchstart click", function(e){
    //   e.preventDefault();
    //   $(this).addClass("item-selected").closest("li").siblings("li").find(".consignee-item").removeClass("item-selected");
    // });

    $('#payment-list .payment-item').bind('touchstart click', function(e){
      e.preventDefault();
      $(this).addClass('item-selected').closest('li').siblings('li').find('.payment-item').removeClass('item-selected');
    });

    _init_area();

    $('#editAddr .form-control[required]').blur(function(e){
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

      Checkout.validForm();
    });

    Checkout.loadProductList();
    Checkout.loadAddressList();
  });
})(jQuery);