require.config({
	shim: {
		'jqzoom': {
			deps: ['css!/libs/jqzoom/jqzoom.css', 'jquery']
		},
		'shop':{
			deps: ['css!../styles/shop.css','jquery', 'jqzoom']
		}, 
    'toolbar': {
      deps: ['jquery']
    }
	},
  paths: {
    jquery: '/libs/jquery/dist/jquery.min',
    domReady: '/libs/domReady/domReady',
    jqzoom: '/libs/jqzoom/jquery.jqzoom.min'
  }
});

require(['shop', './toolbar'], function($){
});