/**
 * waterflow 等高瀑布流组件
 *
 * Author: Alpha Tan
 * Version: 1.1
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
        fitHeight: true, // fit the parent element height
        colHeight: 338,  // row width
        gutterWidth: 15, // the brick element horizontal gutter
        gutterHeight: 15, // the brick element vertical gutter
        minRow: 1,  // min columns
        maxRow: undefined, // max columns, if undefined,max columns is infinite
        maxPage: 10, // max page, if undefined,max page is infinite
        pageSize: 10, 
        step: 2,    //resize page step length
        hasMore: false,   //has more pages, total pages > maxPage
        bufferPixel: -300, // decrease this number if you want scroll to fire quicker
        containerStyle: { // the waterfall container style
          position: 'relative'
        },
        isAutoPrefill: true,  // When the document is smaller than the window, load data until the document is larger
        path: undefined,
        params: {}, // params,{type: "popular", tags: "travel", format: "json"} => "type=popular&tags=travel&format=json"
        dataType: 'json', // json, jsonp, html
        dataWatcher: '',

        loadingMsg: '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>', // loading html
        
        state: {
          isDuringAjax: false, 
          isProcessingData: false, 
          isResizing: false,
          isPause: false,
          curPage: 0, // cur page
          hasNext: true
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
      this.rowWidthArray = []; // row width array 

      this._init();
    }
    window.Waterflow = Waterflow;
    
    Waterflow.prototype = {
      constructor: Waterflow,

      /*
       * init container
       */
      _initContainer: function() {
        var options = this.options,
            prefix = options.prefix;
        
        // fix fixMarginLeft bug
        // $('body').css({
        //     overflow: 'auto'
        // });
                
        this.$element.css(this.options.containerStyle).addClass(prefix + '-container');
        this.$element.after('<div id="' + prefix + '-loading" style="position: absolute;top: 50%;left: 50%;">' +options.loadingMsg+ '</div><div id="' + prefix + '-message" style="text-align:center;color:#999; position: absolute; top:0px; left:50%; margin-left:-106px;"></div>');
        
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
            
        this._setRows();    
        this._initContainer(); 
        this._resetRowsWidthArray(); 
        this.reLayout( callback );
        
        if ( !path ) { 
          // this._debug('Invalid path');
          return;
        }

        // auto prefill
        if ( options.isAutoPrefill ) {
          this._prefill();
        }
        
        // bind resize
        // if ( options.resizable ) {
        //   this._doResize();
        // }

        //bind scroll
        this._doScroll();
      },

      /*
       * opts
       * @param {Object} opts
       * @param {Function} callback
       */
      option: function( opts, callback ){
        if ( $.isPlainObject( opts ) ){
          this.options = $.extend(true, this.options, opts);
          this.rowWidthArray = []; // columns height array 
          
          if ( typeof callback === 'function' ) {
            callback();
          }
          
          // re init
          this._init();
        } 
      },

      /*
       * reset columns width array
       */
      _resetRowsWidthArray: function() {
          var rows = this.rows;
          
          this.rowWidthArray.length = rows;
          
          for (var i = 0; i < rows; i++) {
            this.rowWidthArray[i] = 0;
          }
      },

      /*
       * layout
       */
      layout: function($content, callback) {
        var options = this.options,
        $items = this.options.isFadeIn ? this._getItems($content).css({ opacity: 0 }).animate({ opacity: 1 }) : this._getItems($content);

        // append $items
        this.$element.append($items);

        // place items
        for (var i = 0, itemsLen = $items.length; i < itemsLen; i++) {
          this._placeItems($items[i]);
        }

        // update waterfall container width
        this.$element.width(Math.max.apply({}, this.rowWidthArray)); 
        
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

      /**
       * set rows
       */
      _setRows: function() {
          this.rows = this._getRows();
      },

      /**
       * get rows
       */
      _getRows : function() {
        var options = this.options,
            $container = options.fitHeight ?  this.$element.parent() : this.$element,
            containerHeight = $container[0].tagName === 'BODY' ? $container.height() - 20 : $container.height(), 
            colHeight = options.colHeight,
            gutterHeight = options.gutterHeight,
            minRow = options.minRow,
            maxRow = options.maxRow,
            rows = Math.floor(containerHeight / (colHeight + gutterHeight)),
            row = Math.max(rows, minRow );          
        return !maxRow ? row : (row > maxRow ? maxRow : row);
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
        this.$element.append($content);
        this.layout($content, callback);
      },

      /*
       * place items
       */
      _placeItems: function( item) {
        var $item = $(item),
            options = this.options,
            colHeight = options.colHeight,
            gutterWidth = options.gutterWidth,
            gutterHeight = options.gutterHeight,
            rowWidthArray = this.rowWidthArray,
            len = rowWidthArray.length,
            minRowWidth = Math.min.apply({}, rowWidthArray), 
            minRowIndex = $.inArray(minRowWidth, rowWidthArray), 
            rowIndex, //cur row index
            position;
         
        if ( $item.hasClass(options.prefix + '-item-fixed-left')) {
          rowIndex = 0;
        } else if ( $item.hasClass(options.prefix + '-item-fixed-right') ) {
          rowIndex = ( len > 1 ) ? ( len - 1) : 0;
        } else {
          rowIndex = minRowIndex;
        }
        
        position = {
          left: rowWidthArray[rowIndex],
          top: (colHeight + gutterHeight) * rowIndex
        };
        $item.css(position);
        
        // update rows width
        rowWidthArray[rowIndex] += $item.outerWidth() + gutterWidth;
        options.rowIndex = rowIndex;

        //item add attr data-col
        //$item.attr('data-col', rowIndex);
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

        if ( state.isProcessingData || state.isDuringAjax || state.isInvalidPage || state.isPause || !state.hasNext) {
          return;
        }

        if ( !this._nearbottom()) {
          return;
        }
        
        this._requestData(function() {
          var timer = setTimeout(function() {
            self._scroll(direction);
          }, 100);
        }, direction);
      },

      _nearbottom: function() {
        var parent = this.$element.parent();
        var options = this.options,
            minRowWidth = Math.min.apply({}, this.rowWidthArray);
            // delta = parent.scrollLeft() + parent.width() - this.$element.offset().left - minRowWidth;
        // return ( delta > options.bufferPixel );
        return (parent.scrollLeft() + parent.width()) > (minRowWidth/2);
      },

      /*
       * prefill
       */
      _prefill: function() {
        if ( this.$element.width() <= this.$element.parent().width() ) {
          this._scroll();
        }
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
        self.$element.parent().bind('scroll', function() {
          if ( scrollTimer ) {
            clearTimeout(scrollTimer);
          }

          scrollTimer = setTimeout(function() {
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
          if(options.hasMore){
            options.state.curPage--;
            options.state.isPause = true;
            var step = options.step,
                prefix = options.prefix;

            var btnMore = self._buildMoreBtn(false);
            btnMore.bind('click touchstart', function(e){
              e.preventDefault();
              options.state.isPause = false;

              options.maxPage += step;
              options.state.isBeyondMaxPage = false;
              if(self.$loading.length===0){
                self.$element.after('<div id="' + prefix + '-loading">' +options.loadingMsg+ '</div>');
                self.$loading = $('#' + prefix + '-loading');
              }
              $(this).remove();
              self.rowWidthArray[options.rowIndex] -= 200;

              self._scroll();
            });
            self.append(btnMore);
            return;
          }else{
            options.state.curPage = maxPage;
            options.state.isBeyondMaxPage = true;
            options.callbacks.loadingFinished(this.$loading, options.state.isBeyondMaxPage);
            return;
          }
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
       * 构建加载更多和结束按钮
       */
      _buildMoreBtn: function(isEnd, style){
        var box = '<div class="{0} loadingMore">加载更多...</div>'.format(this.options.itemCls);
        if(isEnd){
          box = '<div class="{0} loadingEnd">没有了!</div>'.format(this.options.itemCls);
        }
        return $(box);
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

        var d = data;
        var watcher = options.dataWatcher;
        if(watcher){
          d = data[watcher];
        }
        if(d.totalPages && d.totalPages > options.maxPage){
          options.hasMore = true;
        }else{
          options.hasMore = false;
        }
        self.append($content, callback);
        self.options.callbacks.loadingFinished(self.$loading, self.options.state.isBeyondMaxPage);      

        if(d.totalPages && options.state.curPage >= d.totalPages){
          options.state.hasNext = false;
          self.append(self._buildMoreBtn(true));

          options.callbacks.loadingFinished(this.$loading, true);
          return;
        }
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