require.config({
	shim: {
		'jqzoom': {
			deps: ['css!/libs/jqzoom/jqzoom.css', 'jquery']
		},
		'shop':{
			deps: ['css!../styles/shop.css','jquery', 'jqzoom']
		}
	},
  paths: {
    jquery: '/libs/jquery/dist/jquery',
    domReady: '/libs/domReady/domReady',
    jqzoom: '/libs/jqzoom/jquery.jqzoom.min',
    shop: 'shop'
  }
});

require(['shop'], function($){
});