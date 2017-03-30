var psCtx = Yihu.constants.psCtx + '/download', ctx = Yihu.constants.webCtx, cmsCtx = Yihu.constants.cmsCtx;
(function($) {
  $(document).ready(function(){
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
    
    var user = Yihu.store.get('user');
    var uid = (user && user.userId) || 0;
    var reqUid = Yihu.getReqParams('uid');
    if(reqUid){
      uid = reqUid;
    }else{
      if(!Yihu.checkLogined()){
        $('#paint').closest('.w').hide();
        $('#art').closest('.w').hide();
        $('#userArt').closest('.w').hide();
        $('#collectArt').closest('.w').hide();
      }
    }


    //TAB标签卡切换
    $('.tab>li').bind('touchstart click', function(e){
      e.preventDefault();
      if($(this).hasClass('dropdown')){
        $(this).children('.dropdown-menu').toggle();
        return false;
      }

      $(this).addClass('active').siblings().removeClass('active');

      var selector = $(this).children('a').attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');

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

      }
    });

    //小分类列表切换
    $('.category>li').bind('touchstart click', function(e){
      var self = $(this);
      if(self.attr('type') == 'link'){
        return;
      }
      e.preventDefault();
      
      self.addClass('active').siblings().removeClass('active');
      var selector = $(this).children('a').attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
      $(selector).addClass('active').siblings().removeClass('active');

      //加载瀑布流数据
      var prefix = selector.replace('#','');
      if(!prefix){
        return false;
      }

    });

    //加载用户艺术类藏品
    if($('#art-gallery').length){
      $('#art-gallery>.picasa').waterflow({
        itemCls: 'block',
        prefix: 'art',
        maxPage: 2,
        params: {pageSize: 10},
        path: function(page) {
          return ctx + '/user/artwork/collects?currentPage='+page;
        }
      });
    }

    //美术投稿
    var colHeight = 291; //window.innerWidth<= 768 ? 110 : 186;
    $('#postArt>.picasa').waterflow({
      itemCls: 'article2017-box',
      prefix: 'userArticle',
      colHeight: colHeight, 
      maxPage: 2,
      params: {pageSize: 10, userId: uid},
      path: function(page) {
        return ctx + '/article/list?currentPage='+page;
      },
      callbacks:{
        renderData: function (data, dataType) {
          var tpl,
              template;
          if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
            tpl = $('#article-tpl').html();
            template = Handlebars.compile(tpl);
            return template(data);
          } else { // html format
            return data;
          }
        }
      }
    });
    
    //加载用户书画藏品
    if($('#paint-gallery').length){
      $('#paint-gallery>.picasa').waterflow({
        itemCls: 'block',
        prefix: 'paint',
        maxPage: 2,
        params: {pageSize: 10, categoryId: 1},
        path: function(page) {
          return ctx + '/artwork/list?currentPage='+page;
        }
      });
    }

    //大页面按钮事件绑定
    $('.bigPage').unbind('touchstart click').bind('touchstart click', function(e){
      e.preventDefault();

      $(this).toggleClass('on').children('i').toggleClass('fa-unlock-alt').toggleClass('fa-lock');
    });

    //详情/收起按钮事件绑定
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

    //我的待阅商品
    $('#artwork .picasa').waterflow({
      itemCls: 'block',
      prefix: 'artwork',
      maxPage: 2,
      params: {pageSize: 5, userId: uid, type:1},
      path: function(page) {
        return ctx + '/user/collects?currentPage='+page;
      },
      callbacks:{
        renderData: function (data, dataType) {
          var tpl,
              template;
          if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
            tpl = $('#artwork-follow').html();
            template = Handlebars.compile(tpl);
            return template(data);
          } else { // html format
            return data;
          }
        }
      }
    });

    //我的待阅文章
    $('#article .picasa').waterflow({
      itemCls: 'article2017-box',
      prefix: 'article',
      maxPage: 2,
      colHeight: colHeight, 
      params: {pageSize: 5, userId: uid, type:2},
      path: function(page) {
        return ctx + '/user/collects?currentPage='+page;
      },
      callbacks:{
        renderData: function (data, dataType) {
          var tpl,
              template;
          if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
            tpl = $('#article-follow').html();
            template = Handlebars.compile(tpl);
            return template(data);
          } else { // html format
            return data;
          }
        }
      }
    });

    //用户收藏排行榜
    $('#usersRank .picasa').waterflow({
      itemCls: 'rank-item',
      prefix: 'user-rank',
      maxPage: 2,
      params: {pageSize: 10},
      colHeight: 135,
      path: function(page) {
        return ctx + '/user/publishs?currentPage='+page;
      },
      callbacks:{
        renderData: function (data, dataType) {
          var tpl,
              template;
          if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
            tpl = $('#user-artwork').html();
            template = Handlebars.compile(tpl);
            return template(data);
          } else { // html format
            return data;
          }
        }
      }
    });

    Home.loadHistory();
  });
})(jQuery);


var Home = window.Home = {
  //加载我的足迹
  loadHistory: function(pageIndex){
    $('#history-view .picasa').waterflow({
      itemCls: 'block',
      prefix: 'history-view',
      maxPage: 2,
      colHeight: 238,
      params: {pageSize: 10},
      path: function(page) {
        return ctx + '/history/list?currentPage='+page;
      },
      callbacks:{
        renderData: function (data, dataType) {
          var tpl,
              template;
          if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
            tpl = $('#history-tpl').html();
            template = Handlebars.compile(tpl);
            return template(data);
          } else { // html format
            return data;
          }
        }
      }
    });
  },

  //删除艺术投稿
  removeArticle: function(id){
    if(id){
      layer.confirm('删除不可恢复哦！确认要删除吗？', {
        btn: ['确定','取消'] //按钮
      }, function(){
        Yihu.doDelete(cmsCtx + '/article/' + id, {}, function(data){
          if(data.result === 0){
            layer.msg('文章删除成功', {icon: 1});
          }else{
            layer.msg('删除失败，请稍候重试');
          }
        });
      }, function(){
        return;
      });
    }
  }

};