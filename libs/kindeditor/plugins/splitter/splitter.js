/*******************************************************************************
* KindEditor - WYSIWYG HTML Editor for Internet
* Copyright (C) 2006-2011 kindsoft.net
*
* @author Roddy <luolonghao@gmail.com>
* @site http://www.kindsoft.net/
* @licence http://www.kindsoft.net/license.php
*******************************************************************************/

KindEditor.plugin('splitter', function(K) {
  var self = this, name = 'splitter',
    allowFileUpload = K.undef(self.allowFileUpload, true),
    allowFileManager = K.undef(self.allowFileManager, false),
    formatUploadUrl = K.undef(self.formatUploadUrl, true),
    uploadJson = K.undef(self.uploadJson, self.basePath + 'php/upload_json.php'),
    extraParams = K.undef(self.extraFileUploadParams, {}),
    filePostName = K.undef(self.filePostName, 'imgFile'),
    lang = self.lang(name + '.');

    // 设置颜色
  function _setColor(box, color) {
    color = color.toUpperCase();
    box.css('background-color', color);
    box.css('color', color === '#000000' ? '#FFFFFF' : '#000000');
    box.html(color);
  }

  // 初始化取色器
  var pickerList = [];
  function _initColorPicker(dialogDiv, colorBox) {
    colorBox.bind('click,mousedown', function(e){
      e.stopPropagation();
    });
    function removePicker() {
      K.each(pickerList, function() {
        this.remove();
      });
      pickerList = [];
      K(document).unbind('click,mousedown', removePicker);
      dialogDiv.unbind('click,mousedown', removePicker);
    }
    colorBox.click(function(e) {
      removePicker();
      var box = K(this),
        pos = box.pos();
      var picker = K.colorpicker({
        x : pos.x,
        y : pos.y + box.height(),
        z : 811214,
        selectedColor : K(this).html(),
        colors : self.colorTable,
        noColor : self.lang('noColor'),
        shadowMode : self.shadowMode,
        click : function(color) {
          _setColor(box, color);
          removePicker();
        }
      });
      pickerList.push(picker);
      K(document).bind('click,mousedown', removePicker);
      dialogDiv.bind('click,mousedown', removePicker);
    });
  }

  self.plugin.fileDialog = function(options) {
    var fileUrl = K.undef(options.fileUrl, ''),
      fileTitle = K.undef(options.fileTitle, ''),
      clickFn = options.clickFn;
    var html = [
      '<div style="padding:20px;">',
      '<div class="ke-dialog-row">',
      '<label for="keUrl" style="width:60px;">' + lang.url + '</label>',
      '<input type="text" id="keUrl" name="url" class="ke-input-text" style="width:160px;" /> &nbsp;',
      '<input type="button" class="ke-upload-button" value="' + lang.upload + '" /> &nbsp;',
      '<span class="ke-button-common ke-button-outer">',
      '<input type="button" class="ke-button-common ke-button" name="viewServer" value="' + lang.viewServer + '" />',
      '</span>',
      '</div>',
      //title
      '<div class="ke-dialog-row">',
      '<label for="keColor" style="width:60px;">' + lang.colorPicker + '</label>',
      '<span class="ke-inline-block ke-input-color"></span>',
      '</div>',
      '<div class="ke-dialog-row">',
      '<label for="keWidth" style="width:60px;">' + lang.size + '</label>',
      lang.width +
      '<input type="text" id="keWidth" class="ke-input-text ke-input-number" name="width" value="" maxlength="4"/> &nbsp; ',
      '<select name="widthType">',
      '<option value="px">px</option>',
      '<option value="%">%</option>',
      '</select>&nbsp;&nbsp;',
      lang.height +
      '<input type="text" id="keHeight" class="ke-input-text ke-input-number" name="height" value="" maxlength="4"/>px &nbsp; ',
      '</div>',

      '</div>',
      //form end
      '</form>',
      '</div>'
      ].join('');

    var dialog = self.createDialog({
      name : name,
      width : 450,
      title : self.lang(name),
      body : html,
      beforeRemove : function() {
        colorBox.unbind();
      },
      yesBtn : {
        name : self.lang('yes'),
        click : function(e) {
          var url = K.trim(urlBox.val()),
            title = titleBox.val();
          if (url && (url == 'http://' || K.invalidUrl(url))) {
            alert(self.lang('invalidUrl'));
            urlBox[0].focus();
            return;
          }

          var color = K(colorBox[0]).html() || '';
          var width = widthBox.val();
          if(width){
            width += widthTypeBox.val();
          }
          var height = heightBox.val() || '';
          clickFn.call(self, url, color, width, height + 'px');
        }
      }
    }),
    div = dialog.div;

    var urlBox = K('[name="url"]', div),
      viewServerBtn = K('[name="viewServer"]', div),
      titleBox = K('[name="title"]', div),
      widthBox = K('[name="width"]', div),
      heightBox = K('[name="height"]', div),
      widthTypeBox = K('[name="widthType"]', div),
      colorBox = K('.ke-input-color', div);
      
      _initColorPicker(div, colorBox.eq(0));
      _setColor(colorBox.eq(0), '#000000');

    if (allowFileUpload) {
      var uploadbutton = K.uploadbutton({
        button : K('.ke-upload-button', div)[0],
        fieldName : filePostName,
        url : K.addParam(uploadJson, 'dir=image'),
        extraParams : extraParams,
        afterUpload : function(data) {
          dialog.hideLoading();
          if (data.error === 0) {
            var url = data.url;
            if (formatUploadUrl) {
              url = K.formatUrl(url, 'absolute');
            }
            urlBox.val(url);
            if (self.afterUpload) {
              self.afterUpload.call(self, url, data, name);
            }
            alert(self.lang('uploadSuccess'));
          } else {
            alert(data.message);
          }
        },
        afterError : function(html) {
          dialog.hideLoading();
          self.errorDialog(html);
        }
      });
      uploadbutton.fileBox.change(function(e) {
        dialog.showLoading(self.lang('uploadLoading'));
        uploadbutton.submit();
      });
    } else {
      K('.ke-upload-button', div).hide();
    }
    if (allowFileManager) {
      viewServerBtn.click(function(e) {
        self.loadPlugin('filemanager', function() {
          self.plugin.filemanagerDialog({
            // viewType : 'LIST',
            dirName : 'image',
            clickFn : function(url) {
              if (self.dialogs.length > 1) {
                K('[name="url"]', div).val(url);
                if (self.afterSelectFile) {
                  self.afterSelectFile.call(self, url);
                }
                self.hideDialog();
              }
            }
          });
        });
      });
    } else {
      viewServerBtn.hide();
    }
    urlBox.val(fileUrl);
    titleBox.val(fileTitle);
    urlBox[0].focus();
    urlBox[0].select();
  };
  self.clickToolbar(name, function() {
    self.plugin.fileDialog({
      clickFn : function(url, color, width, height) {
        var colorCss = color;
        if(url){ 
          colorCss = "url('"+url+"')"; 
        }

        width = width || '100%';
        height = height || '2px';
        var html = '<div class="ke-splitter" style="background:'+colorCss+'; width:'+width+'; height:'+height+'; line-height:'+height+'"></div><br>';
        self.insertHtml(html).hideDialog().focus();
      }
    });
  });
});
