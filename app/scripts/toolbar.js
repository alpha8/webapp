define(['jquery', 'domReady'], function($, domReady){
  domReady(function(){
    $('.toolbar-wrap .toolbar-tab').hover(function(){
      $(this).toggleClass('toolbar-tab-hover');
    });

    $('#goTop').click(function(){
      $('body,html').animate({ scrollTop: 0 }, 'fast');
      return false;
    });
  });
});