var Yihu = Yihu || {};

Yihu.doPost = function(url, data, successFn, failFn){
  Yihu.doAjax(url, {type: 'POST'}, data, successFn, failFn);
};

Yihu.doGet = function(url, data, successFn, failFn){
  Yihu.doAjax(url, {type: 'GET'}, data, successFn, failFn);
};

Yihu.doPut = function(url, data, successFn, failFn){
  Yihu.doAjax(url, {type: 'PUT'}, data, successFn, failFn);
};

Yihu.doDelete = function(url, data, successFn, failFn){
  Yihu.doAjax(url, {type: 'DELETE'}, data, successFn, failFn);
};

Yihu.doAjax = function(url, options, data, successFn, failFn){
  var defaults = {
    dataType: 'json',
    contentType: 'application/json;charset=utf-8',
    successFn: successFn || function(res){
      console.log('Success, data=' + res);
    },
    failFn: failFn || function(err){
      console.log(err);
    }
  };
  var settings = $.extend(true, {}, defaults, options);
  var jsonData = (settings.dataType==='json' || settings.dataType === 'jsonp') ? JSON.stringify(data) : data;

  if(settings.type == 'DELETE' || settings.type == 'GET'){
    $.ajax({
      url: url,
      type: settings.type,
      dataType: settings.dataType,
      contentType: settings.contentType,
      success: settings.successFn,
      error: settings.failFn
    });
  }else{
    $.ajax({
      url: url,
      type: settings.type,
      dataType: settings.dataType,
      contentType: settings.contentType,
      data: jsonData || {}, 
      success: settings.successFn,
      error: settings.failFn
    });
  }
};