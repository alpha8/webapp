(function() {
    // 配置
    var envir = 'online';
    var configMap = {
        test: {
            appkey: 'af1edc0739d6187cecffd39b751d284f',
            url:'https://apptest.netease.im'
        },
        pre:{
    		appkey: 'af1edc0739d6187cecffd39b751d284f',
    		url:'http://preapp.netease.im:8184'
        },
        online: {
           appkey: 'af1edc0739d6187cecffd39b751d284f',
           url:'https://app.netease.im'
        }
    };
    window.CONFIG = configMap[envir];
}())