/**
 * waterflow 等高瀑布流组件
 *
 * Author: Alpha Tan
 * Version: 1.0
 * @type {Number}
 */
;(function( $, window, document, undefined ) {
    'use strict';
    
    /*
     * defaults
     */
    var $window = $(window),
        pluginName = 'waterflow',
        defaults = {
        itemCls: 'block',  // the brick element class
        prefix: 'waterflow',
        path: undefined,
        params: {}, // params,{type: "popular", tags: "travel", format: "json"} => "type=popular&tags=travel&format=json"
        dataType: 'json', // json, jsonp, html
        maxPage: 10,

        loadingMsg: '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>', // loading html
        
        state: {
          isDuringAjax: false, 
          isProcessingData: false, 
          isResizing: false,
          isPause: false,
          curPage: 0 // cur page
        },

        // callbacks
        callbacks: {
          /*
           * loading start 
           * @param {Object} loading $('#waterfall-loading')
           */
          loadingStart: function($loading) {
            $loading.show();
            //console.log('loading', 'start');
          },
          
          /*
           * loading finished
           * @param {Object} loading $('#waterfall-loading')
           * @param {Boolean} isBeyondMaxPage
           */
          loadingFinished: function($loading, isBeyondMaxPage) {
            if ( !isBeyondMaxPage ) {
              $loading.fadeOut();
              //console.log('loading finished');
            } else {
              //console.log('loading isBeyondMaxPage');
              $loading.remove();
            }
          },
          
          /*
           * loading error
           * @param {String} xhr , "end" "error"
           */
          loadingError: function($message, xhr) {
            $message.html('Data load faild, please try again later.');
          },
          
          /*
           * render data
           * @param {String} data
           * @param {String} dataType , "json", "jsonp", "html"
           */
          renderData: function (data, dataType) {
            var tpl,
                template;
                
            if ( dataType === 'json' ||  dataType === 'jsonp'  ) { // json or jsonp format
                tpl = $('#waterflow-tpl').html();
                template = Handlebars.compile(tpl);
                
                return template(data);
            } else { // html format
                return data;
            }
          }
        }
    };

    function Waterflow(element, options) {
      this.$element = $(element);
      this.options = $.extend(true, {}, defaults, options);
      this._init();
    }
    
    
    Waterflow.prototype = {
      constructor: Waterflow,

      /*
       * init container
       */
      _initContainer: function() {
        var options = this.options,
            prefix = options.prefix;
        
        // fix fixMarginLeft bug
        $('body').css({
            overflow: 'scroll'
        });
        
        
        this.$element.css({"position": "relative"}).addClass(prefix + '-container');
        this.$element.after('<div id="' + prefix + '-loading">' +options.loadingMsg+ '</div><div id="' + prefix + '-message" style="text-align:center;color:#999;"></div>');
        
        this.$loading = $('#' + prefix + '-loading');
        this.$message = $('#' + prefix + '-message');
      },

      /*
       * _init 
       * @callback {Object Function } and when instance is triggered again -> $element.waterfall()
       */
      _init: function( callback ) {
        var options = this.options,
            path = options.path;
            
        this._initContainer(); 
        this.reLayout( callback );
        
        if ( !path ) { 
          // this._debug('Invalid path');
          return;
        }
        
        // bind resize
        if ( options.resizable ) {
          this._doResize();
        }

        this._scroll();

        //翻页
        // var that = this;
        // var picasa = this.$element.parent();
        // picasa.find(".next").bind('touchstart click', function(e){
        //   e.preventDefault();
        //   that._scroll('next');
        // });

        // picasa.find(".prev").bind('touchstart click', function(e){
        //   e.preventDefault();
        //   that._scroll('prev');
        // });
      },

      /*
       * layout
       */
      layout: function($content, callback) {
        var options = this.options,
        $items = this.options.isFadeIn ? this._getItems($content).css({ opacity: 0 }).animate({ opacity: 1 }) : this._getItems($content);

        // append $items
        this.$element.append($items);
        
        // update status
        this.options.state.isResizing = false;
        this.options.state.isProcessingData = false;
        
        // callback
        if ( callback ) {
          callback.call( $items );
        }
      },

      /*
       * relayout
       */
      reLayout: function( callback ) {
        var $content = this.$element.find('.' + this.options.itemCls);
        this.layout($content , callback );
      },

      /*
       * get items
       */
      _getItems: function( $content ) {
        var $items = $content.filter('.' + this.options.itemCls);
        return $items;
      },

      /*
       * append
       * @param {Object} $content
       * @param {Function} callback
       */
      append: function($content, callback) {
        this.$element.html($content);
        this.layout($content, callback);
      },

      /*
       * resize
       */
      _resize: function() {         
        this.options.state.isResizing = true;
        this.reLayout(); // relayout
      },

      _scroll: function(direction) {
          var options = this.options,
              state = options.state,
              self = this;

          if ( state.isProcessingData || state.isDuringAjax || state.isInvalidPage || state.isPause ) {
            return;
          }
          
          this._requestData(function() {
            // var timer = setTimeout(function() {
            //     self._scroll(direction);
            // }, 100);
          }, direction);
      },

      /*
       * do resize
       */
      _doResize: function() {
          var self = this,
              resizeTimer;

          $window.bind('resize', function() {
            if ( resizeTimer ) {
              clearTimeout(resizeTimer);
            }
            
            resizeTimer = setTimeout(function() {
              self._resize();
            }, 100); 
          });
      },

      /*
       * do scroll
       */
      _doScroll: function() {
          var self = this,
              scrollTimer;
          
          $window.bind('scroll', function() {
              if ( scrollTimer ) {
                  clearTimeout(scrollTimer);
              }

              scrollTimer = setTimeout(function() {
                  //self._debug('event', 'scrolling ...');
                  self._scroll();
              }, 100);
          });
      },

      /**
       * request data
       */
      _requestData: function(callback, direction) {
          var self = this,
              options = this.options,
              maxPage = options.maxPage,
              path = options.path,
              dataType = options.dataType,
              params = options.params,
              pageurl;

          var curPage = options.state.curPage;
          if('prev' == direction){
            curPage = --options.state.curPage; // cur page
          }else{
            curPage = ++options.state.curPage;
          }
          if(curPage < 1){
            options.state.curPage = 1;
            options.state.isBeyondMaxPage = true;
            options.callbacks.loadingFinished(this.$loading, options.state.isBeyondMaxPage);
            return;
          }

          if ( maxPage !== undefined && curPage > maxPage ){
            options.state.curPage = maxPage;
            options.state.isBeyondMaxPage = true;
            options.callbacks.loadingFinished(this.$loading, options.state.isBeyondMaxPage);
            return;
          }
          
          // get ajax url
          pageurl = (typeof path === 'function') ? path(curPage) : path.join(curPage);
          
          // this._debug('heading into ajax', pageurl+$.param(params));
          
          // loading start
          options.callbacks.loadingStart(this.$loading);
          
          // update state status
          options.state.isDuringAjax = true;
          options.state.isProcessingData = true;
          
          // ajax
          $.ajax({
            url: pageurl,
            data: params,
            dataType: dataType,
            success: function(data) {
              self._handleResponse(data, callback);
              self.options.state.isDuringAjax = false;
            },
            error: function(jqXHR) {
              self._responeseError('error');
            }
          });
      },
      
      
      /**
       * handle response
       * @param {Object} data
       * @param {Function} callback
       */
      _handleResponse: function(data, callback) {
        var self = this,
            options = this.options,
            content = $.trim(options.callbacks.renderData(data, options.dataType)),
            $content = $(content);
        
        //计算并设置等高瀑布流的宽度
        if(options.dataType === 'json' || options.dataType === 'jsonp'){
          var maxWidth = 0, totalWidth = 0;
          $.each((data && data.result) || [], function(i, item){
            if(item.width > maxWidth){
              maxWidth = item.width;
            }
            totalWidth += item.width;
          });
          self.$element.css("width", totalWidth / 2 + maxWidth);
        }

        self.append($content, callback);
        self.options.callbacks.loadingFinished(self.$loading, self.options.state.isBeyondMaxPage);      
      },
      
      /*
       * reponse error
       */
      _responeseError: function(xhr) {
        this.$loading.hide();
        this.options.callbacks.loadingError(this.$message, xhr);
        
        if ( xhr !== 'end' && xhr !== 'error' ) {
          xhr = 'unknown';
        }
      }
    };

    $.fn[pluginName] = function(options) {
      if ( typeof options === 'string' ) { // plugin method
        var args = Array.prototype.slice.call( arguments, 1 );
        
        this.each(function() {
          var instance = $.data( this, 'plugin_' + pluginName );
          if ( !instance ) {
            // instance._debug('instance is not initialization');
            return;
          }

          if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) { //
              // instance._debug( 'no such method "' + options + '"' );
              return;
          }
          
          //  apply method
          instance[options].apply( instance, args );
        });
      } else { // new plugin
        this.each(function() {
          if ( !$.data(this, 'plugin_' + pluginName) ) {
            $.data(this, 'plugin_' + pluginName, new Waterflow(this, options));
          }
        });
      }  
      return this;
    };
        
}( jQuery, window, document ));