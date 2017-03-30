(function($) {
  document.body.addEventListener('touchmove', function (event) {
      event.preventDefault();
  }, false);

  var bottom = $('#bannerSliders').offset().top - 30;
  var initialY = 58;
  var ySpeed = initialY;   //Y轴位置
  var step = 2;     //步长
  var flag = true;

  var counter = 0;
  var timer;
  function flowDiv(){
    var t = $('.inviteDialog').offset().top;
    if(t <= initialY){
      flag = true;
    }

    if(t >= bottom){
      flag = false;
    }

    if(flag){
      ySpeed += step;
    }else{
      ySpeed -= step;
    }

    $('.inviteDialog').css({
      position: 'absolute',
      top: ySpeed
    });
    timer = setTimeout(flowDiv, 50);
  }
  flowDiv();

  $('.inviteDialog').bind('mouseover', function(e){
    e.preventDefault();
    if(timer){
      clearTimeout(timer);
      timer = null;
    }
  });

  $('.inviteDialog').bind('mouseout', function(e){
    e.preventDefault();

    timer = setTimeout(flowDiv, 50);
  });

  //广告轮播
  $('#bannerSliders').slideBox({
    duration : 0.3,//滚动持续时间，单位：秒
    easing : 'linear',//swing,linear//滚动特效
    delay : 3,//滚动延迟时间，单位：秒
    hideClickBar : false,//不自动隐藏点选按键
    hideBottomBar: true,
    clickBarRadius : 10,
    height: 680
  });

  $('#ad-sliders').slideBox({
    duration : 0.3,//滚动持续时间，单位：秒
    easing : 'linear',//swing,linear//滚动特效
    delay : 3,//滚动延迟时间，单位：秒
    hideClickBar : false,//不自动隐藏点选按键
    hideBottomBar: true,
    clickBarRadius : 10,
    height: 480
  });

  var tips = ["芝麻开门", "齐白石", "毛贞元", "王子武", "黄宾虹", "李可染", "毕加索"];
  $('.invite-code').attr('placeholder', tips[Math.round(Math.random()*(tips.length-1))]);
  
  $('.joinus').bind('touchstart click', function(e){
    e.preventDefault();

    var url = 'yihu/user/isValid/2222?r={1}'.format(Math.random());
    Yihu.doGet(url, {}, function(data){
      $('.invite-code').val('');
      $('.invite-code').attr('placeholder', '无效的邀请码');

      setTimeout(function(){
        $('.invite-code').attr('placeholder', tips[Math.round(Math.random()*(tips.length-1))]);
      }, 3000);
    }, function(res){
      $('.invite-code').val('');
      $('.invite-code').attr('placeholder', '无效的邀请码');

      setTimeout(function(){
        $('.invite-code').attr('placeholder', tips[Math.round(Math.random()*(tips.length-1))]);
      }, 3000);
    });
  });

})(jQuery);