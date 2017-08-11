var psCtx = Yihu.constants.psCtx + '/download', ctx = Yihu.constants.webCtx;
var Cart = window.Cart = {
  //选中商品
  check: function(tag, o){
    if(tag == 'all'){
      $('.cart .checkbox').prop('checked', $(o).prop('checked'));
    }else if(tag == 'shop'){
      $(o).closest('.cart-item-list').find('.checkbox').prop('checked', $(o).prop('checked'));
    }else{
      $(o).prop('checked', $(o).prop('checked'));
    }

    //商品项全部选中，修改商户状态
    var shop = $(o).closest('.cart-item-list');
    var checkedSize = shop.find('.checkbox:checked').size();
    var totalSize = shop.find('.checkbox').size();
    if(checkedSize == totalSize-1){
      shop.find('.shop .checkbox').prop('checked', $(o).prop('checked'));
    }

    //商户全部选中，修改全选状态
    var cart = $(o).closest('.cart');
    var checkeds = cart.find('.checkbox:checked').size();
    var total = cart.find('.checkbox').size();
    if(checkeds >= total-2){
      cart.find('input[name=\'selectAll\']').prop('checked', $(o).prop('checked'));
    }else{
      cart.find('input[name=\'selectAll\']').prop('checked', false);
    }
    Cart.calc();
  },

  //计算总价
  calc:function(){
    var productItem = $('.checkbox:checked').closest('.item-item');
    var products = productItem.find('.p-sum em.number');
    var totalObj = $('.totalPrice em.number');
    var totalPrice = 0;
    products.each(function(i, item){
      totalPrice = Number(Number(totalPrice) + Number($(item).text())).toFixed(2);
    });
    totalObj.text(totalPrice);

    var totalProducts = 0;
    productItem.find('input.text-amount').map(function(){
      totalProducts = Number(Number(totalProducts) + Number($(this).val()));
    });
    $('.amount-sum em.amount').text(totalProducts);
  },

  //修改商品数量
  changeAmount:function(o){
    var quantity = $(o).val();
    if(isNaN(quantity)){
      $(o).val(1);
      quantity = 1;
    }
    var totalPrice = $(o).parents('.p-amount').siblings('.p-sum').find('em.number');
    var unitPrice = $(o).parents('.p-amount').siblings('.p-price').find('span.number');
    totalPrice.text(Number(Number(unitPrice.text()) * quantity).toFixed(2));
    Cart.calc();
  },

  //商量数量+1
  minus:function(o){
    var quantity = $(o).siblings('input.text-amount');
    if(quantity.val() > 1){
      var id = $(o).closest('.item-form').find('input[name=\'id\']').val();
      Yihu.doGet(ctx + '/shoppingCart/reduce/{0}'.format(id), {}, function(data){
        if(data.result == 1){
          console.log('[Cart] Reducing operation is failed, caused by ' + data.message);
        }else{
          quantity.val(Number(quantity.val())-1);
          Cart.changeAmount(quantity);
        }
      });
    }
  },

  //商品数量-1
  plus: function(o){
    var id = $(o).closest('.item-form').find('input[name=\'id\']').val();
    Yihu.doGet(ctx + '/shoppingCart/plus/{0}'.format(id), {}, function(data){
      if(data.result == 1){
        console.log('[Cart] Adding operation is failed, caused by ' + data.message);
      }else{
        var quantity = $(o).siblings('input.text-amount');
        quantity.val(Number(quantity.val())+1);
        Cart.changeAmount(quantity);
      }
    });
  },

  //删除商品
  remove: function(id, o){
    if(id){
      Yihu.doDelete(ctx + '/shoppingCart?id={0}'.format(id), {}, function(data){
        if(data.result === 0){
          layer.msg('商品已删除！');

          var list = $(o).closest('.cart-item-list').find('.item-list');
          if(list && list.size()===1){
            $(o).closest('.cart-item-list').remove();
          }else{
            $(o).closest('.item-list').remove();
          }
          return;
        }else{
          layer.alert('删除失败，请稍候重试？', {
            skin: 'layui-layer-molv', //样式类名
            closeBtn: 0
          });
        }
      });
    }
  },

  //删除选中商品
  removeChecked: function(){
    var ids = $('.checkbox:checked').siblings('input[name=\'id\']').map(function(){ return $(this).val();}).get().join(',');
    if(ids){
      Yihu.doDelete(ctx + '/shoppingCart?id={0}'.format(ids), {}, function(data){
        if(data.result === 0){
          layer.msg('选中的商品已删除！');

          var o = $('.checkbox:checked').closest('.item-list').remove();
          var list = $('#cart-list .item-list');
          if(list && list.size()===0){
            $('#cart-list').remove();
          }
          return;
        }else{
          layer.alert('删除失败，请稍候重试？', {
            skin: 'layui-layer-molv', //样式类名
            closeBtn: 0
          });
        }
      });
    }
  },

  //移到我的待阅
  moveToFollow: function(id, o){
    if(id){
      Yihu.mark(id, Yihu.constants.like.artwork, '', true);

      var list = $(o).closest('.cart-item-list').find('.item-list');
      if(list && list.size()===1){
        $(o).closest('.cart-item-list').remove();
      }else{
        $(o).closest('.item-list').remove();
      }
      return;
    }
  },

  //选中的商品移到我的待阅
  moveCheckedFollow: function(){
    var ids = $('.checkbox:checked').siblings('input[name=\'pid\']').map(function(){ return $(this).val();}).get().join(',');

    if(ids){
      var user = Yihu.store.get('user') || {};
      var url = Yihu.constants.webCtx + '/user/collect';

      Yihu.doPost(url, {
        userId: user.userId,
        type: Yihu.constants.like.artwork,
        artworkId: ids,
        fromCart: true
      }, function(data){
        if(data.result === 0){
          layer.msg('选中的商品已移到待阅列表！');

          var o = $('.checkbox:checked').closest('.item-list').remove();
          var list = $('#cart-list .item-list');
          if(list && list.size()===0){
            $('#cart-list').remove();
          }
          return;
        }
      });

    }
  },

  //结算
  cashOut: function(o){
    var carts = [];
    $('.checkbox:checked').siblings('input[name=\'pid\']').map(function(){ 
      carts.push({id: $(this).val(), count: $(this).closest('.item-form').find('.text-amount').val() || 0 });
    });

    $(o).text('结 算 中...').addClass('disabled');
    var url = Yihu.constants.webCtx + '/shoppingCart/second';
    Yihu.doPost(url, { carts: carts }, function(data){
      $(o).text('结 算').removeClass('disabled');
      if(data.result != 1){
        location.href = location.href.replace('shop_cart.html', 'checkout.html');
      }
    });

  }
};

(function($) {
  $(document).ready(function(){
    var user = Yihu.store.get('user');
    var uid = (user && user.userId) || 0;

    Yihu.doGet(ctx + '/shoppingCart/list?userId={0}'.format(uid),{}, function(data){
      if(data && data.carts.length){
        var tpl = $('#cart-tpl').html();
        var template = Handlebars.compile(tpl);
        $('#cart-list').html(template(data));

        Cart.calc();
      }
    });
  });
})(jQuery);
