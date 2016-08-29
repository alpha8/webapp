define(['jquery', 'jqzoom'], function($){
  $(document.body).ready(function(){
    var li = $("#spec-list li");
    $("#spec-list>ul").css("width", li.length * (parseInt(li.css("width"))+4)+"px");

    var settings = {
      xzoom:540, 
      yzoom:540
    };
    $('#spec-n1').jqueryzoom(settings);

    $(".tab-header li").bind('touchstart click', function(e){
      e.preventDefault();

      $(this).addClass("current").siblings().removeClass("current");

      var items = $(".tab-header li").map(function(){ return $(this).data("toggle");}).get();
      var currentItem = $(this).data("toggle");

      var startShow = false;
      for(var i=0; i<items.length; i++){
        if(items[i]==currentItem){
          startShow = true;
        }

        if(startShow){
          $(items[i]).show();
        }else{
          $(items[i]).hide();
        }
      }
      
      // $(".tab-body .item").hide();
      // $($(this).data("toggle")).show();
    });
  });

  $(window).scroll(function(e){
    if($(window).scrollTop() >= $(".tab-main").offset().top){
      if(!$(".tab-main").hasClass("detail-top-fixed")){
        $(".tab-main").addClass("detail-top-fixed");
      }
    }

    if($(window).scrollTop() <= $(".tab-body").offset().top){
      if($(".tab-main").hasClass("detail-top-fixed")){
        $(".tab-main").removeClass("detail-top-fixed");
      }
    }
  });

  $("#choose-color .item").bind('touchstart click', function(e){
    e.preventDefault();

    $(this).addClass("selected").siblings().removeClass("selected");
  });

  $(".btn-reduce").bind('touchstart click', function(e){
    e.preventDefault();

    var buyNum = parseInt($("#buy-num").val());
    if(buyNum > 1){
      $("#buy-num").val(--buyNum);
      if(buyNum <= 1){
        $(this).addClass("disabled");
      }
    }
  });

  $(".btn-add").bind('touchstart click', function(e){
    e.preventDefault();

    var buyNum = parseInt($("#buy-num").val());
    if(buyNum >= 1){
      $(".btn-reduce").removeClass("disabled");
      $("#buy-num").val(++buyNum);
    }
  });

  $("#buy-num").keyup(function(){
    var buyNum = parseInt($("#buy-num").val());
    if(isNaN(buyNum) || buyNum<1){
      $("#buy-num").val(1);
    }
  });

  $("#spec-backward").bind('touchstart click', function(e){
    e.preventDefault();
    var ul = $("#spec-list>ul");
    var left = parseInt(ul.css("left"));

    var containerWidth = parseInt($("#spec-list").css("width"));
    var ulWidth = parseInt(ul.css("width"));
    if(containerWidth - ulWidth < left-4){
      ul.css("left", parseInt(left)-56+'px');
    }
  });

  $("#spec-forward").bind('touchstart click', function(e){
    e.preventDefault();

    var ul = $("#spec-list>ul");
    var left = parseInt(ul.css("left"));
    if(left<0){
      ul.css("left", left+56+'px');
    }
  });

  $("#spec-list li").bind('touchstart click', function(e){
    e.preventDefault();

    var img = $(this).find("img");
    var thumbnail = img.attr("src");
    var previewImg = thumbnail.substring(0, thumbnail.lastIndexOf('.')-4)+thumbnail.substring(thumbnail.lastIndexOf("."));
    $("#spec-img").attr("src", previewImg).attr("jqimg", img.data("url"));
  });

});