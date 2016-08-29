require.config({
  shim: {
    'toolbar': {
      deps: ['jquery']
    }
  },
  paths: {
    jquery: '/libs/jquery/dist/jquery.min',
    domReady: '/libs/domReady/domReady'
  }
});

define(['jquery', './toolbar'], function($){

});