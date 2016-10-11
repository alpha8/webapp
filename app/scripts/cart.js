require.config({
  shim: {
    'toolbar': {
      deps: ['jquery']
    }
  },
  paths: {
    jquery: '/libs/jquery/dist/jquery.min',
    domReady: '/libs/domReady/domReady'
  }
});

define(['jquery', './toolbar'], function($){
  $('.item-amount .minus').bind('touchstart click', function(e){
    e.preventDefault();

    var quantity = $(this).siblings('input.text-amount');
    if(quantity.val() > 1){
      quantity.val(Number(quantity.val())-1);

      var totalPrice = $(this).parents('.p-amount').siblings('.p-sum').find('em.number');
      var unitPrice = $(this).parents('.p-amount').siblings('.p-price').find('span.number');
      totalPrice.text(Number(Number(unitPrice.text()) * quantity.val()).toFixed(2));
    }
  });

  $('.item-amount .plus').bind('touchstart click', function(e){
    e.preventDefault();

    var quantity = $(this).siblings('input.text-amount');
    quantity.val(Number(quantity.val())+1);

    var totalPrice = $(this).parents('.p-amount').siblings('.p-sum').find('em.number');
    var unitPrice = $(this).parents('.p-amount').siblings('.p-price').find('span.number');
    totalPrice.text(Number(Number(unitPrice.text()) * quantity.val()).toFixed(2));
  });
});