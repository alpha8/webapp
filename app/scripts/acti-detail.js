var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx, cmsCtx = Yihu.constants.cmsCtx;
(function($) {
  $(document).ready(function(){
    var id = Yihu.getReqParams('id');
    if(id){
      //加载当前预览文章
      Yihu.doGet(cmsCtx + '/activity/{0}'.format(id), {}, function(data){
        var tpl = $('#activity-tpl').html();
        var template = Handlebars.compile(tpl);
        $('#activity-detail').html(template(data));
        $('#catName').text(data.subject);

        $('img.lazy').lazyload({
          threshold : 200
        });
      });
    }

  });
})(jQuery);