var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx;

(function($) {
  $(document).ready(function(){
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

    var user = Yihu.store.get('user');
    var uid = (user && user.userId) || 0;
    Yihu.doGet(ctx + '/user/collects?userId={0}'.format(uid),{}, function(data){
      if(data && data.artwork){
        var tpl = $('#artwork-tpl').html();
        var template = Handlebars.compile(tpl);
        $('#artwork').html(template(data.artwork));
      }else{
        $('#artwork').html('<p>关注列表为空！</p>');
      }

      if(data && data.article){
        var articleTpl = $('#article-tpl').html();
        var tmpl = Handlebars.compile(articleTpl);
        $('#article').html(tmpl(data.article));
      }else{
        $('#article').html('<p>关注列表为空！</p>');
      }
    });
  });
})(jQuery);