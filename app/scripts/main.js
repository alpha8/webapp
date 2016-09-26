require.config({
  shim: {
    'toolbar': {
      deps: ['jquery']
    },
    'slideBox': {
      deps: ['css!../styles/jquery.slideBox.css', 'jquery']
    },
    'handlebars':{
      exports: 'Handlebars'
    },
    'waterfall':{
      deps: ['jquery', 'handlebars']
    }
  },
  paths: {
    jquery: '/libs/jquery/dist/jquery.min',
    domReady: '/libs/domReady/domReady',
    slideBox: 'jquery.slideBox',
    handlebars: '/libs/handlebars/handlebars',
    waterfall: 'waterfall.min'
  }
});

require(['jquery', 'domReady', 'slideBox', 'waterfall'], function($, domReady){
  domReady(function(){
    //广告轮播
    $("#bannerSlider").slideBox({
      duration : 0.3,//滚动持续时间，单位：秒
      easing : 'linear',//swing,linear//滚动特效
      delay : 5,//滚动延迟时间，单位：秒
      hideClickBar : false,//不自动隐藏点选按键
      clickBarRadius : 10,
      height: 300
    });

    //TAB标签卡切换
    $(".tab>li").bind('touchstart click', function(e){
      e.preventDefault();
      if($(this).hasClass("dropdown")){
        $(this).children(".dropdown-menu").toggleClass("show");
        return false;
      }

      $(this).addClass("active").siblings().removeClass("active");

      var selector = $(this).children("a").attr("href");
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass("active").siblings().removeClass("active");

      var triggerEvent = $(this).data("trigger");
      if("waterfall"==triggerEvent && !$(selector).hasClass("done")){
        var prefix = selector.replace('#','');

        $(selector + '>.waterfall').waterfall({
          itemCls: 'box',
          colWidth: 252,  
          gutterWidth: 10,
          gutterHeight: 10,
          checkImagesLoaded: false,
          align: 'left',
          prefix: prefix,
          maxPage: 1,
          path: function(page) {
            return '/mock/'+ prefix +'.json?page='+page;
          }
        });
      }
    });

    //tab下拉菜单事件绑定
    $(".tab .dropdown-menu>li").bind('touchstart click', function(e){
      e.preventDefault();

      var nodeA = $(this).children("a");
      var text = nodeA.text();
      var selector = nodeA.attr("href");

      var target = $(this).parent().siblings("a");
      target.children("span").text(text);
      target.children("em").text('('+nodeA.data("count")+')');
    });

    //TAB内部分类列表切换
    $(".tab-pane .category>li").bind('touchstart click', function(e){
      e.preventDefault();
      
      $(this).addClass("active").siblings().removeClass("active");
      var selector = $(this).children("a").attr("href");
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass("active").siblings().removeClass("active");

      //加载瀑布流数据
      if(!$(selector).hasClass("done")){
        var prefix = selector.replace('#','');

        $(selector + '>.waterfall').waterfall({
          itemCls: 'box',
          colWidth: 252,  
          gutterWidth: 10,
          gutterHeight: 10,
          checkImagesLoaded: false,
          align: 'left',
          prefix: prefix,
          maxPage: 1,
          path: function(page) {
            return '/mock/'+ prefix +'.json?page='+page;
          }
        });
      }
    });

    $(".bigPage").bind('touchstart click', function(e){
      e.preventDefault();

      $(this).toggleClass('on').children("i").toggleClass("fa-unlock-alt").toggleClass("fa-lock");
    });

    //初始化瀑布流（价值->主人房）
    $('#masterRoom>.waterfall').waterfall({
      itemCls: 'box',
      colWidth: 252,  
      gutterWidth: 10,
      gutterHeight: 10,
      checkImagesLoaded: false,
      align: 'left',
      prefix: 'masterRoom',
      maxPage: 1,
      path: function(page) {
        return '/mock/masterRoom.json?page='+page;
      },
      callbacks:{ 
        loadingFinished: function($loading, isBeyondMaxPage) {
          if (!isBeyondMaxPage ) {
             $loading.fadeOut();
           } else {
             $loading.hide();
             $('#masterRoom').addClass("done");
           }
        }
      }
    });

    //初始化瀑布流（交易->国画）
    $('#chinaPaint>.waterfall').waterfall({
      itemCls: 'box',
      colWidth: 252,  
      gutterWidth: 10,
      gutterHeight: 10,
      checkImagesLoaded: false,
      prefix: 'chinaPaint',
      align: 'left',
      maxPage: 1,
      path: function(page) {
        return '/mock/chinaPaint.json?page='+page;
      },
      callbacks:{ 
        loadingFinished: function($loading, isBeyondMaxPage) {
          if (!isBeyondMaxPage ) {
             $loading.fadeOut();
           } else {
             $loading.hide();
             $('#chinaPaint').addClass("done");
           }
        }
      }
    });

    //加载国画交易数据
    $('#gh>.waterfall').waterfall({
      itemCls: 'box',
      colWidth: 252,  
      gutterWidth: 10,
      gutterHeight: 10,
      checkImagesLoaded: false,
      prefix: 'gh',
      align: 'left',
      maxPage: 1,
      path: function(page) {
        return '/mock/gh.json?page='+page;
      },
      callbacks:{ 
        loadingFinished: function($loading, isBeyondMaxPage) {
          if (!isBeyondMaxPage ) {
             $loading.fadeOut();
           } else {
             $loading.hide();
             $('#gh').addClass("done");
           }
        }
      }
    });

    $("#btn-detail").bind('touchstart click', function(e){
      e.preventDefault();
      var that = $(this);
      that.toggleClass("expanded");

      if(that.hasClass("expanded")){
        that.text("收起");
        that.parent().siblings(".intro").css("height", "auto");  
      }else{
        that.text("详情");
        that.parent().siblings(".intro").css("height", "20px");  
      }
    });

  });

});
