var ctx = Yihu.constants.webCtx, cmsCtx = Yihu.constants.cmsCtx, psCtx = Yihu.constants.psCtx;
(function($) {
  $(document).ready(function(){
    var id = Yihu.getReqParams('id');
    if(id){
      //加载产品详情
      Yihu.doGet(ctx + '/artwork/{0}'.format(id), {}, function(data){
        var tpl = $('#product-tpl').html();
        var template = Handlebars.compile(tpl);
        $('#product-info').html(template(data));
        $('.productName').text(data.name);

        $('img.lazy').lazyload({
          threshold : 200
        });

        var settings = {
          xzoom:640, 
          yzoom:640
        };
        $('#spec-n1').jqueryzoom(settings);
        _doScroll();

        // var li = $('#spec-list li');
        // $('#spec-list>ul').css('width', li.length * 180+'px');

        //向下翻页商品缩略图列表
        $('#spec-backward').bind('touchstart click', function(e){
          e.preventDefault();
          var ul = $('#spec-list>ul');
          var top = parseInt(ul.css('top'));

          var height = parseInt($('.spec-list').css('height'));
          var h = parseInt(ul.css('height'));
          if(height - top <= h){
            ul.css('top', top-120+'px');
            $('#spec-forward').removeClass('disabled');
          }

          if(height - top >= h - 120){
            $(this).addClass('disabled');
          }
        });

        //向上翻页商品缩略图列表
        $('#spec-forward').bind('touchstart click', function(e){
          e.preventDefault();

          var ul = $('#spec-list>ul');
          var top = parseInt(ul.css('top'));
          if(top < 0){
            ul.css('top', top+120+'px');
            $('#spec-backward').removeClass('disabled');
          }

          if(top >= -120){
            $(this).addClass('disabled');
          }
        });

        //商品缩略图列表切换
        // $('#spec-list li').hover(function(e){
        //   e.preventDefault();
        //   var img = $(this).find('img');
        //   $('#spec-img').attr('src', img.data('preview')).attr('jqimg', img.data('url'));
        // });
        
        //颜色和款式选择
        $('#choose-color .item').bind('touchstart click', function(e){
          e.preventDefault();

          var self = $(this);
          if(!!self.hasClass('selected')){
            $('#spec-list>ul').html($('#product-icons').html());
            $('.summary-price .num').text(parseFloat($('#price').val()));
          }else{
            $('#spec-list>ul').html(self.find('.model-icons').html());
            $('.summary-price .num').text(parseFloat(self.find('a').data('price')));
          }
          self.toggleClass('selected').siblings().removeClass('selected');
          _doScroll();
        });

        //自减购买数量
        $('.btn-reduce').bind('touchstart click', function(e){
          e.preventDefault();

          var buyNum = parseInt($('#buy-num').val());
          if(buyNum > 1){
            $('#buy-num').val(--buyNum);
            if(buyNum <= 1){
              $(this).addClass('disabled');
            }
          }
        });

        //自增购买数量
        $('.btn-add').bind('touchstart click', function(e){
          e.preventDefault();

          var buyNum = parseInt($('#buy-num').val());
          if(buyNum >= 1){
            $('.btn-reduce').removeClass('disabled');
            $('#buy-num').val(++buyNum);
          }
        });

        //购买数量输入控制
        $('#buy-num').keyup(function(){
          var buyNum = parseInt($('#buy-num').val());
          if(isNaN(buyNum) || buyNum<1){
            $('#buy-num').val(1);
          }
        });

        //切换商品详情页TAB标签
        $('.tab-header li').bind('touchstart click', function(e){
          e.preventDefault();

          $(this).addClass('current').siblings().removeClass('current');

          var items = $('.tab-header li').map(function(){ return $(this).data('toggle');}).get();
          var currentItem = $(this).data('toggle');

          var startShow = false;
          for(var i=0; i<items.length; i++){
            if(items[i]==currentItem){
              startShow = true;
            }
            $(items[i]).show();
            $(window).scrollTop($(currentItem).offset().top);
          }
        });

        //加载评论列表
        Comment.loadCommentList();

        //plupload上传组件配置
        var uploader = new plupload.Uploader({ //实例化一个plupload上传对象
          browse_button: 'btnUpload',
          url: psCtx + '/upload.do',
          flash_swf_url: 'js/Moxie.swf',
          silverlight_xap_url: 'js/Moxie.xap',
          filters: {
            max_file_size : '10mb',
            mime_types: [ //只允许上传图片文件
              { title: '图片文件', extensions: 'jpg,gif,png,bmp' }
            ]
          },
          unique_names:true, //生成唯一的文件名
          file_data_name: 'imgFile',
          init:{
            FilesAdded: function(up, files){
              $('.upload-imglist').show();

              plupload.each(files, function(file) {
                var html = '<li id="{0}" title="文件名：{1}&#10;文件大小：{2}"><img alt="" src="{3}?h=80"  height="80" layer-src="{3}?h=420">' + 
                  '<div class="img-uploading">0%</div><span class="close" onclick="Comment.removePic(\'#{0}\')">&times;</span>' + '<div class="filename"></div></li>';
                html = html.format(file.id, file.name, plupload.formatSize(file.size), '/images/pic.bg.png');
                $('#img-list ul').append(html);
                $('#'+file.id+' .filename').text(file.name);

                previewImage(file, function (imgsrc) {
                  $('#'+file.id).find('img').attr('src', imgsrc).attr('layer-src', imgsrc);
                });

              });
              var lastWidth = $('#img-list ul').width();
              $('#img-list ul').width(lastWidth + (files.length * 180) + 'px');
              Yihu.playPhotos('#img-list');
              uploader.start();
              $('#postComment').hide();
            },
            UploadProgress: function(up, file) {
              $('#'+file.id).find('.img-uploading').text(file.percent + '%');
            },
            Error: function(up, err) {
              console.log('\nError #' + err.code + ': ' + err.message);

              var file = err && err.file;
              $('#'+file.id).find('.img-uploading').text('上传出错');
            },
            FileUploaded:function(up, file, responseObject){
              var response = JSON.parse(responseObject && responseObject.response);
              if(response.code === 0){
                $('#'+file.id).attr('data-pid', response.id).find('.img-uploading').text('上传成功').fadeOut('slow');
              }else{
                $('#'+file.id).find('.img-uploading').text('上传失败');
              }
            },
            UploadComplete:function(up, file){
              $('#postComment').show();
            }
          }
        });
        uploader.init();

      });
    }

    //页面滚动时，商品详情页TAB选项卡固定位置到页面顶部
    $(window).scroll(function(e){
      if($('.tab-main').length){
        if($(window).scrollTop() >= $('.tab-main').offset().top){
          if(!$('.tab-main').hasClass('detail-top-fixed')){
            $('.tab-main').addClass('detail-top-fixed');
            // $('.topbar').hide();
          }
        }

        if($(window).scrollTop() <= $('.tab-body').offset().top + 3){
          if($('.tab-main').hasClass('detail-top-fixed')){
            $('.tab-main').removeClass('detail-top-fixed');
            // $('.topbar').show();
          }
        }
      }
    });
  
    //生成上传中的图片预览图
    function previewImage(file, callback) {
      if (!file || !/image\//.test(file.type)) return; //确保文件是图片
      if (file.type == 'image/gif') {//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var fr = new mOxie.FileReader();
        fr.onload = function () {
          callback(fr.result);
          fr.destroy();
          fr = null;
        };
        fr.readAsDataURL(file.getSource());
      } else {
        var preloader = new mOxie.Image();
        preloader.onload = function () {
          //preloader.downsize(550, 400);//先压缩一下要预览的图片,宽300，高300
          var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
          callback && callback(imgsrc); //callback传入的参数为预览图片的url
          preloader.destroy();
          preloader = null;
        };
        preloader.load(file.getSource());
      }
    }

    //页面初始化
    setTimeout(function(){
      Shop.loadProductLikes();
      Shop.loadRecommendList();
      Shop.loadHistory();
      Shop.loadSysRecommendList();
    }, 500);
  });

  function _doScroll(){
    if($('#spec-list>ul').height() <= $('.spec-list').height()){
      $('#spec-forward').hide();
      $('#spec-backward').hide();
    }else{
      $('#spec-forward').show().addClass('disabled');
      $('#spec-backward').show();
    }
  }

})(jQuery);

var Shop = window.Shop = {
  //加载猜您喜好
  loadProductLikes: function(){
    $('#guess-like .picasa').waterflow({
      itemCls: 'block',
      prefix: 'guess-like',
      maxPage: 2,
      params: {pageSize: 10},
      path: function(page) {
        return ctx + '/artwork/list?currentPage='+page;
      }
    });
  },

  //加载相关推荐
  loadRecommendList: function(){
    $('#recommend .picasa').waterflow({
      itemCls: 'block',
      prefix: 'recommend',
      maxPage: 2,
      params: {pageSize: 10, recommend: 1},
      path: function(page) {
        return ctx + '/artwork/list?currentPage='+page;
      }
    });
  },

  //加载系统推荐
  loadSysRecommendList: function(){
    $('#sys_recommend .picasa').waterflow({
      itemCls: 'block',
      prefix: 'sys_recommend',
      maxPage: 2,
      params: {pageSize: 10, recommend: 1},
      path: function(page) {
        return ctx + '/artwork/list?currentPage='+page;
      }
    });
  },

  //加载我的足迹
  loadHistory: function(){
    $('#history-view .picasa').waterflow({
      itemCls: 'block',
      prefix: 'history-view',
      colHeight: 238,
      maxPage: 2,
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

  //商品缩略图列表切换
  showPic: function(o){
    var img = $(o).find('img');
    $('#spec-img').attr('src', img.data('preview')).attr('jqimg', img.data('url'));
  }        

};


//评论大图预览
var rotateDegree = 0;
var BigPic = window.BigPic = {
  //显示大图
  show: function(o){
    $(o).closest('li').addClass('selected').siblings().removeClass('selected');
    var bigSrc = $(o).data('big');
    $(o).closest('.preview-imglist').next('.big-photos').show().find('.photos-wrap>img.big-img').attr('src', bigSrc).css('transform','rotate(0deg)');
    rotateDegree = 0;
  },
  //隐藏评论区大图显示
  hide: function(o){
    $(o).closest('.big-photos').hide();
  },
  //上一张图片
  prev: function(o){
    var imglist = $(o).closest('.big-photos').siblings('.preview-imglist');
    var li = imglist.find('.imglist li.selected').removeClass('selected').prev().addClass('selected');
    if(li && li.length){
      var bigSrc = li.find('img').data('big');
      $(o).siblings('img.big-img').attr('src', bigSrc).css('transform','rotate(0deg)');
    }else{
      var src =imglist.find('.imglist li:last').addClass('selected').find('img').data('big');
      $(o).siblings('img.big-img').attr('src', src).css('transform','rotate(0deg)');

      $(o).hide();
      $(o).siblings('.photo-next').show();
    }
    rotateDegree = 0;
  },
  //下一张图片
  next: function(o){
    var imglist = $(o).closest('.big-photos').siblings('.preview-imglist');
    var li = imglist.find('.imglist li.selected').removeClass('selected').next().addClass('selected');
    if(li && li.length){
      var bigSrc = li.find('img').data('big');
      $(o).siblings('img.big-img').attr('src', bigSrc).css('transform','rotate(0deg)');
    }else{
      var src =imglist.find('.imglist li:first').addClass('selected').find('img').data('big');
      $(o).siblings('img.big-img').attr('src', src).css('transform','rotate(0deg)');

      $(o).hide();
      $(o).siblings('.photo-prev').show();
    }
    rotateDegree = 0;
  },
  //左右旋转，direction=left为向左，等于right向右
  rotate:function(direction, o){
    if('left' == direction){
      rotateDegree -= 90;
      $(o).closest('.big-photos').find('.photos-wrap>img').css('transform','rotate('+ rotateDegree +'deg)');
    }else if('right' == direction){
      rotateDegree += 90;
      $(o).closest('.big-photos').find('.photos-wrap>img').css('transform','rotate('+ rotateDegree +'deg)');
    }
  }
};

//评论组件
var Comment = window.Comment = {
  //删除添加评论时， 上传的图片
  removePic: function(pid){
    if(pid){
      var ul = $(pid).closest('ul');
      if(ul.children('li').size()===1){
        ul.closest('.upload-imglist').hide();
      }
      $(pid).remove();
    }
    return false;
  },

  //删除自己编写的评论
  removeComment: function(cid, replyId){
    if(cid){
      var url = ctx + '/comment?id={0}'.format(cid);
      if(replyId){
        url += '&count={0}'.format(replyId);
      }
      Yihu.doDelete(url, {}, function(data){
        if(data.result === 0){
          layer.msg('评论删除成功！');

          if(replyId){
            $('#'+cid + ' .comment[rid=\''+replyId+'\']').remove();
          }else{
            $('#'+cid).remove();
          }
        }else{
          layer.alert('评论删除失败，请稍候重试。', {
            skin: 'layui-layer-molv', //样式类名
            closeBtn: 0
          });
          return;
        }
      });
    }
  },

  //新增评论时， 字数检查
  checkContentLength: function(o){
    var self = $(o);
    var len = self.val().trim().length;
    var wc = self.parent().find('.wb_counter>.wordNum');
    if(300 - len < 0){
      return;
    }
    wc.text(300 - len);

    var btnComment = self.parent().find('.btn-comment');
    if(len){
      btnComment.removeClass('disabled');
    }else{
      btnComment.addClass('disabled');
    }
  },

  //回复评论，生成评论回复区HTML
  addComment: function(o){
    var replyObj = $(o).closest('.comment-body');

    if(!replyObj.find('.add-comment').length){
      var html = '<div class="add-comment clr">'+
                  '<div class="text">'+
                    '<textarea name="message" class="comment-msg" autocomplete="off" onkeyup="Comment.checkContentLength(this)" placeholder="回复{2}: "></textarea>'+
                    '<input type="hidden" name="id" value="{0}">' +
                    '<input type="hidden" name="userId" value="{1}">' +
                    '<input type="hidden" name="userName" value="{2}">' +
                    '<input type="hidden" name="replyCount" value="{3}">' +
                    '<div class="comment-toolbar">'+
                      '<div class="wb_counter">还可以输入<em class="wordNum">300</em>字</div>'+
                      '<a href="javascript:void(0)" class="btn14 disabled btn-comment" onclick="Comment.reply(this)">回复</a>'+
                    '</div>'+
                    '<span class="clr"></span>'+
                  '</div>'+
                '</div>';
      var id = $(o).data('id');
      var userId = $(o).data('uid');
      var userName = $(o).data('uname') || '匿名';
      var replyCount = $(o).data('rcount');
      replyObj.find('.comment-content:eq(0)').append(html.format(id, userId, userName, replyCount));
    }
  },

  //回复评论
  reply: function(o){
    var form = $(o).closest('.add-comment');
    var id = form.find('input[name=\'id\']').val();
    var replyCount = form.find('input[name=\'replyCount\']').val();
    var userId = form.find('input[name=\'userId\']').val();
    var userName = form.find('input[name=\'userName\']').val();
    var text = form.find('textarea[name=\'message\']').val();

    var artworkId = Yihu.getReqParams('id');
    var user = Yihu.store.get('user') || {userId: 0};
    var comment = {
      product: { pid: artworkId }, 
      reply: {
        from: { userId: user.userId, userName: user.emailAddress},
        to: {userId: userId, userName: userName},
        content: text
      },
      count: replyCount,
      id: id
    };

    var url = ctx + '/comment';
    Yihu.doPost(url, comment, function(data){
      if(data.result === 0){
        layer.msg('评论提交成功，待系统审核！');
        form.remove();
      }else{
        layer.alert('评论提交失败，请稍候重试。', {
          skin: 'layui-layer-molv', //样式类名
          closeBtn: 0
        });
        return;
      }
    });

  },

  //快速回复，查看对话时直接回复
  fastReply: function(o){
    var artworkId = Yihu.getReqParams('id');
    var id = $(o).data('id');
    var userName = $(o).data('uname');
    var userId = $(o).data('uid');
    var replyCount = $(o).data('rcount');
    var text = $(o).closest('.input-group').find('input.form-control').val();

    var user = Yihu.store.get('user') || {userId: 0};
    var comment = {
      product: { pid: artworkId }, 
      reply: {
        from: { userId: user.userId, userName: user.emailAddress},
        to: {userId: userId, userName: userName},
        content: text
      },
      count: replyCount,
      id: id
    };

    var url = ctx + '/comment';
    Yihu.doPost(url, comment, function(data){
      if(data.result === 0){
        layer.msg('评论提交成功，待系统审核！');
        form.remove();
      }else{
        layer.alert('评论提交失败，请稍候重试。', {
          skin: 'layui-layer-molv', //样式类名
          closeBtn: 0
        });
        return;
      }
    });

  },

  //查看对话
  viewTalk:function(o){
    var tpl = '<div class="chat-box">' +
            '<div class="chat-wrap">' +
              '<div class="content">{0}</div>' +
            '</div>' +
            '<div class="form-chat">' +
              '<div class="input-group">' +
                '<input type="text" class="form-control">' +
                '<span class="input-group-btn"><button class="btn btn-primary" onclick="Comment.fastReply(this)" data-id="{1}" data-uid="{2}" data-uname="{3}" data-rcount="{4}">回复</button></span>' +
              '</div>' +
            '</div>' +
          '</div>';
    var leftTpl = '<div class="left">' +
                    '<div class="author-name">{0} <span class="chat-date">{1}</span></div>' +
                    '<div class="chat-message {2}">{3}</div>' +
                  '</div>';
    var rightTpl = '<div class="right">' +
                    '<div class="author-name">{0} <span class="chat-date">{1}</span></div>' +
                    '<div class="chat-message {2}">{3}</div>' +
                  '</div>';
    var uid = $(o).data('uid');

    var comment = $(o).closest('li.comment');
    var list = comment.find('a.comment-reply');
    var listHtml = '';

    var isTopicOwner = false, ownerId = -1;
    list.each(function(i, item){
      var it = $(item);
      var time = new Date(it.data('time')).format('yyyy-MM-dd hh:mm:ss');
      var text = it.closest('.comment').find('.comment-content').text();
      var id = it.data('uid');

      if(i === 0){
        ownerId = id;
        isTopicOwner = id==uid;
        text = it.closest('.comment').find('.comment-content:eq(0)').text();
        listHtml += leftTpl.format(it.data('uname'), time, (isTopicOwner ? 'active': ''), text);
      }else if(i > 0 && (id == uid) || (id == ownerId)){
        if(id == ownerId){
          listHtml += leftTpl.format(it.data('uname'), time, (id==uid ? 'active': ''), text);
        }else{
          listHtml += rightTpl.format(it.data('uname'), time, (id==uid ? 'active': ''), text);
        }
      }
    });

    var id = $(o).data('id');
    var uname = $(o).data('uname');
    var replyCount = $(o).data('rcount');
    var html = tpl.format(listHtml, id, uid, uname, replyCount);
    layer.open({
      type: 1,
      title: '查看对话',
      area: '400px',
      content: html
    });
  },

  //加载最新评论列表
  loadCommentList: function(){
    var id = Yihu.getReqParams('id');
    Yihu.doGet(cmsCtx + '/comment/list?productId={0}'.format(id), {}, function(data){
      var tpl = $('#comments-tpl').html();
      var template = Handlebars.compile(tpl);
      $('.comments-list').html(template(data));

      $('img.lazy').lazyload({
        threshold : 200
      });

      $('.arrow-next').bind('touchstart click', function(e){
        e.preventDefault();
        var listNode = $(this).siblings('div.imglist');
        var ul = listNode.find('ul');
        var left = parseInt(ul.css('left'));

        var containerWidth = parseInt(listNode.css('width'));
        var ulWidth = parseInt(ul.css('width'));
        if(containerWidth - ulWidth < left-10){
          ul.css('left', parseInt(left)-60+'px');
        }
      });

      $('.arrow-prev').bind('touchstart click', function(e){
        e.preventDefault();
        
        var ul = $(this).siblings('div.imglist').find('ul');
        var left = parseInt(ul.css('left'));
        if(left<0){
          ul.css('left', left+60+'px');
        }
      });

    });
  },

  //提交评论
  postComment: function(){
    var id = Yihu.getReqParams('id');
    var text = $('#message').val();
    if(!text){
      return;
    }

    var user = Yihu.store.get('user') || {userId: 0};
    var pic = [];
    $('#img-list li').map(function(){
      var pid = $(this).data('pid');
      if(pid){
        pic.push({pid: pid});
      }
    });

    var comment = {
      product: { pid: id }, 
      from: {userId: user.userId, userName: user.emailAddress},
      content: text,
      pictures: pic
    };

    var url = ctx + '/comment';
    Yihu.doPost(url, comment, function(data){
      if(data.result === 0){
        layer.msg('评论提交成功，待系统审核！');
        $('#message').val('');
        $('.wb_counter>.wordNum').text(300);

        $('#img-list li').remove();
        $('.upload-imglist').hide();
        Comment.loadCommentList();

      }else{
        layer.alert('评论提交失败，请稍候重试。', {
          skin: 'layui-layer-molv', //样式类名
          closeBtn: 0
        });
        return;
      }
    });
  }

};