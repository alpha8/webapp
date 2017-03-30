var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx;
(function($){
  $(document.body).ready(function(){
    $('#collapseDetail').bind('touchstart click', function(e){
      e.preventDefault();

      var o = $(this);
      o.toggleClass('opened');
      $('.orderList').toggle();
      if(o.hasClass('opened')){
        o.html('收起详情 <i class="fa fa-caret-up"></i>');
      }else{
        o.html('展开详情 <i class="fa fa-caret-down"></i>');
      }
    });
  });
})(jQuery);