var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx, cmsCtx = Yihu.constants.cmsCtx;

(function($) {
  $(document).ready(function(){
    var user = Yihu.store.get('user');
    var uid = (user && user.userId) || 0;

    var editor;
    KindEditor.ready(function(K) {
      editor = K.create('textarea[name="content"]', {
        uploadJson: psCtx+'/upload.do',
        fileManagerJson: cmsCtx + '/editor/filemanager?path={0}'.format(uid),
        allowFileManager: true,
        width:'80%',
        height:'480px',
        items : [
          'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'code', 'cut', 'copy', 'paste',
          'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
          'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
          'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
          'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
          'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
          'media', 'table', 'splitter', 'emoticons', 'baidumap', 'pagebreak',
          'anchor', 'link', 'unlink', '|'
        ],
        afterUpload: function (url, data, name) {  
          if(url && data.code===0){
            var form = {
              filetype: 'image', 
              filename: data.fileName,
              fileid: data.id,
              filesize: data.fileSize,
              parentFolder: uid
            };
            Yihu.doPost(cmsCtx + '/richText/upload', form, function(data){
              if(data.result !== 0){
                layer.msg('图片被怪兽吃掉了，请稍候再试');
              }
            });
            // RichTextService.uploadCallback({}, form);
          }
        },
        afterChange: function(){
          var html = this.html();
          if(html){
            $('#editor').html(html).trigger('editor.update', [html]);
          }
        }
      });
    });

    var id = Yihu.getReqParams('id');
    if(id){
      saveId = id;
      $('#autoSaver').attr('saveid', id);

      Yihu.doGet(cmsCtx + '/article/{0}'.format(id), {}, function(data){
        if(data && data.id){
          $('input[name=\'id\']').val(data.id);
          $('input[name=\'contentId\']').val(data.contentId);
          $('#editor').html(Yihu.restoreRawHtml(data.content));
          $('input[name=\'summary\']').val(data.summary);
          $('input[name=\'title\']').val(data.title);
          $('input[name=\'isPublic\'][value='+ data.public+']').prop('checked', true);
          if(data.icon){
            var html = '<div class="upload-box" id="{0}">'+
                          '<img src="{1}?w=346&h=196" alt="" layer-src="{1}" />'+
                        '</div>';
            html = html.format(data.id, psCtx + '/download/' + data.icon);
            $('.uploadlist').html(html).show();
          }
        }
      });
    }
    setTimeout(function(){
      var saveKey = prefix + (saveId || 'new');
      var dbKey = Yihu.store.get(saveKey);

      Yihu.doPost(cmsCtx + '/article/getAutoContent', { autoKey: dbKey }, function(data){
        var unsaved = data.content;
        if(unsaved){
          $('#editor').html(Yihu.restoreRawHtml(unsaved));
        }
      });
    }, 500);

    $('#editor').on('editor.update', function(event, data){
      if(data){
        save(data);
      }
    }).on('clean.autosave', function(event, data){
      var saveKey = prefix + (saveId || 'new');
      Yihu.store.remove(saveKey);
    });
    
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
      multi_selection: false,
      unique_names:true, //生成唯一的文件名
      file_data_name: 'imgFile',
      init:{
        FilesAdded: function(up, files){
          $('.uploadlist').show();

          plupload.each(files, function(file) {
            var html = '<div class="upload-box" id="{0}">'+
                          '<img src="{1}?w=346&h=196" alt="" layer-src="{1}" />'+
                          '<div class="img-uploading">0%</div>'+
                        '</div>';
            html = html.format(file.id, 'images/transparent.png');
            $('.uploadlist').html(html);
            previewImage(file, function (imgsrc) {
              $('#'+file.id).find('img').attr('src', imgsrc).attr('layer-src', imgsrc);
            });

          });
          Yihu.playPhotos('.uploadlist');
          uploader.start();
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
        }
      }
    });
    uploader.init();

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

    //提交表单，发布文章
    $('#btnPublish').bind('touchstart click', function(e){
      e.preventDefault();

      var user = Yihu.store.get('user');
      var userName = user.userName || user.emailAddress;
      var articleForm = {
        title:$('input[name=\'title\']').val(),
        author: userName,
        content: Yihu.replaceLazyHtml($('#editor').val()),
        keyword: [],
        summary:$('input[name=\'summary\']').val(),
        public:$('input[name=\'isPublic\']').prop('checked'),
        status: 1,
        icon: $('.uploadlist').data('pid') || '',
        createBy: (user && user.userId) || 'anonymous'
      };
      var id = $('input[name=\'id\']').val();
      if(id){
        articleForm.contentId = $('input[name=\'contentId\']').val();
        //更新文章
        Yihu.doPut(cmsCtx + '/article/{0}'.format(id), articleForm, function(data){
          layer.msg('美篇发布成功！');
          $('#editor').trigger('clean.autosave');
          // location.href="home.html";
        }, function(err){
          layer.msg('美篇掉到宇宙黑洞了，请稍候再试');
        });
      }else{
        //创建新文章
        Yihu.doPost(ctx + '/article', articleForm, function(data){
          layer.msg('美篇发布成功！');
          $('#editor').trigger('clean.autosave');
          // location.href="home.html";
        }, function(err){
          layer.msg('美篇掉到宇宙黑洞了，请稍候再试');
        });
      }
    });

    var tips = {
      title:{
        tip: '文章要吸精，标题要清新！',
        required: '亲，忘记写文章标题了'
      },
      content:{
        tip: '文章的品质来源于内容！',
        required: '文艺小青年，文章内容别忘记了！'
      },
      summary:{
        tip: '请填写文章摘要',
        required: '文章摘要不能为空哦！'
      }
    };
    //验证
    $(document).on('focus', '.required', function(){
      $(this).siblings('.tip').html(tips[$(this).attr('name')].tip).removeClass('error').show();
    }).on('blur', '.required', function() {
      var self = $(this),
        value = self.val().trim();
      if(value.length === 0){
        $(this).siblings('.tip').html(tips[$(this).attr('name')].required).addClass('error');
      }else{
        $(this).siblings('.tip').hide();
      }
    });
    
  });
})(jQuery);

var timer, lastContent,
    lastSaveTime = new Date(), 
    intervalTime = 10000, 
    format = 'yyyy-MM-dd hh:mm:ss',
    prefix = 'autosave-article-',
    ts = +new Date(),
    saveId = $('#autoSaver').attr('saveid');

function save(contents){
  if(lastContent == contents){
    return;
  }

  if(new Date() - lastSaveTime < intervalTime){
    return;
  }
  if(timer){
    clearTimeout(timer);
  }
  saveKey = prefix + (saveId || 'new');
  dbKey = prefix + (saveId || ts);

  lastContent = contents;
  lastSaveTime = new Date();
  timer = setTimeout(function(){
    Yihu.store.set(saveKey, dbKey, 24*3600000);

    var form = {
      autoKey: dbKey,
      content: contents
    };
    Yihu.doPost(cmsCtx + '/article/autoSave', form, function(res){
      if(res.result === 0){
        $('#autoSaver').html('内容已自动保存，上一次保存时间：'+ new Date().format(format));
      }else{
        $('#autoSaver').html('自动保存失败, 等待下次执行！');
      }
    });
  }, 2000);
}