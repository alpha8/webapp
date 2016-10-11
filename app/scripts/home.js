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
    },
    'waterflow':{
      deps: ['jquery', 'handlebars']
    }
  },
  paths: {
    jquery: '/libs/jquery/dist/jquery.min',
    domReady: '/libs/domReady/domReady',
    slideBox: 'jquery.slideBox',
    handlebars: '/libs/handlebars/handlebars',
    waterfall: 'waterfall.min',
    waterflow: 'waterflow'
  }
});

require(['jquery', 'domReady', 'slideBox', 'waterfall', 'waterflow'], function($, domReady){
  domReady(function(){
    //广告轮播
    $('#bannerSlider').slideBox({
      duration : 0.3,//滚动持续时间，单位：秒
      easing : 'linear',//swing,linear//滚动特效
      delay : 5,//滚动延迟时间，单位：秒
      hideClickBar : false,//不自动隐藏点选按键
      clickBarRadius : 10,
      height: 300
    });

    //TAB标签卡切换
    $('.tab>li').bind('touchstart click', function(e){
      e.preventDefault();
      if($(this).hasClass('dropdown')){
        $(this).children('.dropdown-menu').toggleClass('show');
        return false;
      }

      $(this).addClass('active').siblings().removeClass('active');

      var selector = $(this).children('a').attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');

      var triggerEvent = $(this).data('trigger');
      if('waterfall'==triggerEvent){// && !$(selector).hasClass("done")){
        var prefix = selector.replace('#','');
        if(!prefix){
          return false;
        }

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
    $('.tab .dropdown-menu>li').bind('touchstart click', function(e){
      e.preventDefault();

      var nodeA = $(this).children('a');
      var text = nodeA.text();
      $(this).parent().parent().addClass('active').siblings().removeClass('active');

      var selector = nodeA.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');
      
      var target = $(this).parent().siblings('a');
      target.children('span').text(text);
      target.children('em').text('('+nodeA.data('count')+')');

      var triggerEvent = $(this).data('trigger');
      if('waterfall'==triggerEvent){
        var prefix = selector.replace('#','');
        if(!prefix){
          return false;
        }

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
          },
          params:{
            query: nodeA.data('query') || ''
          }
        });
      }
    });

    //小分类列表切换
    $('.category>li').bind('touchstart click', function(e){
      e.preventDefault();
      
      $(this).addClass('active').siblings().removeClass('active');
      var selector = $(this).children('a').attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');

      //加载瀑布流数据
      var prefix = selector.replace('#','');
      if(!prefix){
        return false;
      }

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
    });

    //加载用户书画藏品
    $('#paint-gallery>.picasa').waterflow({
      itemCls: 'block',
      gutterWidth: 10,
      gutterHeight: 10,
      prefix: 'paint',
      maxPage: 2,
      path: function(page) {
        return '/mock/usercollect.json?page='+page;
      }
    });

    //加载用户艺术类藏品
    $('#art-gallery>.waterfall').waterfall({
      itemCls: 'box',
      // colWidth: 252,  
      gutterWidth: 10,
      gutterHeight: 10,
      checkImagesLoaded: false,
      align: 'left',
      prefix: 'art',
      maxPage: 1,
      path: function(page) {
        return '/mock/sf.json?page='+page;
      }
    });

    //加载用户美术稿文章列表
    $.ajax({
      url: '/mock/article/list.json',
      dataType: 'json',
      cache: true,
      async: true,
      success:function(data){
        var tpl = $('#article-tpl').html();
        var template = Handlebars.compile(tpl);
        $('#postArt>.articlelist').html(template(data));
      }
    });

    //加载用户收藏品排行榜
    $.ajax({
      url: '/mock/article/rank.json',
      dataType: 'json',
      cache: true,
      async: true,
      success:function(data){
        var tpl = $('#article-tpl').html();
        var template = Handlebars.compile(tpl);
        $('#artRank>.articlelist').html(template(data));
      }
    });

    //大页面按钮事件绑定
    $('.bigPage').bind('touchstart click', function(e){
      e.preventDefault();

      $(this).toggleClass('on').children('i').toggleClass('fa-unlock-alt').toggleClass('fa-lock');
    });

    //详情/收起按钮事件绑定
    $('.tab-pane .btn-detail').bind('touchstart click', function(e){
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

  });

});
