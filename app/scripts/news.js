var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx;

(function($) {
  $(document).ready(function(){
    loadArticles();
  });
})(jQuery);

function loadArticles(){
  var pn = $('input[name=\'pageIndex\']').val();
  Yihu.doGet(ctx + '/article/list?currentPage={0}'.format(pn), {}, function(data){
    if(data.result === 0){
      var tpl = $('#article-tpl').html();
      var template = Handlebars.compile(tpl);
      $('#dailyNews>.articlelist').append(template(data));

      if(pn >= data.totalPages){
        $('.more .no-more').show();
        $('.more .load-more').hide();
      }
      $('input[name=\'pageIndex\']').val(++pn);
    }
  });
}