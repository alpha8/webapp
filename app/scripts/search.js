var ctx = Yihu.constants.webCtx, psCtx = Yihu.constants.psCtx, cmsCtx = Yihu.constants.cmsCtx, pivot = Yihu.constants.searchPivot.artwork;
var colWidth = window.innerWidth<= 768 ? 250 : window.innerWidth>= 1100 ? 375 : 320;

(function($) {
  $(document).ready(function(){
    var keyword = Yihu.getReqParams('keyword');
    $('#keyword').val(keyword);
    $('#txtKeyword').val(keyword);
    $('.breadcrumb .search-key').text(keyword);

    Yihu.doGet(cmsCtx + '/datadic/childrens?parentPath={0}'.format(pivot), {}, function(data){
      var tpl = $('#search-tpl').html();
      var template = Handlebars.compile(tpl);
      $('.placeholder').append(template(data));

      var len = $('.s-artist .valueList>li').length;
      var h = ($('.s-artist .valueList>li:eq('+(len-1)+')').get(0).offsetTop + 26)+'px';
      $('.s-artist .sl-scroll-list').css('height', h);

      len = $('.s-type .valueList>li').length;
      h = ($('.s-type .valueList>li:eq('+(len-1)+')').get(0).offsetTop + 26)+'px';
      $('.s-type .sl-scroll-list').css('height', h);

      //点击“多选”，进入多选模式
      $('.sl-e-multiple').bind('touchstart click', function(e){
        e.preventDefault();

        $(this).closest('.selectLine').find('.sl-value').addClass('multiple').siblings('.sl-ext').hide();
      });

      //点击“取消”， 取消多选模式
      $('.btn-dispose, .btn-success').bind('touchstart click', function(e){
        e.preventDefault();

        $(this).closest('.selectLine').find('.sl-value').removeClass('multiple').siblings('.sl-ext').show();
      });

      //复选框，选择
      $('.valueList li').bind('touchstart click', function(e){
        e.preventDefault();

        var self = $(this);
        if(self.closest('.multiple').length){
          self.toggleClass('selected');
        }else{
          if(self.attr('trigger') == 'toggle'){
            self.addClass('selected').siblings().removeClass('selected');
            var nodeA = self.children('a');
            var nodeI = nodeA.children('i');
            nodeI.toggleClass('fa-angle-down').toggleClass('fa-angle-up');

            var showId = nodeA.data('show');
            if(showId){
              $(showId).toggle();
            }
            //self.toggleClass('selected');
          }else{
            self.addClass('selected').siblings().removeClass('selected');
          }
        }

        if(!self.hasClass('selectAll')){
          self.siblings('.selectAll').removeClass('selected');
        }

        if(self.closest('.valueList').find('.selected').length){
          self.closest('.sl-value').find('.sl-btns a.btn-success').css('visibility', 'visible');
        }else{
          self.closest('.sl-value').find('.sl-btns a.btn-success').css('visibility', 'hidden');
        }
      });

      Yihu.doGet(ctx + '/artwork/search/records', {}, function(data){
        if(data){
          $('.valueList li>a').each(function(i, item){
            var value = $(item).data('value');
            if(value !== ''){
              $(item).children('em').text('(' + data[value] + ')');
            }
          });
        }
      });

    });


    //搜索商品列表
    Search.load();

    //搜索结果排序
    $('.f-sort>a').bind('touchstart click', function(e){
      e.preventDefault();
      var self = $(this);
      self.addClass('active').siblings().removeClass('active').children('i').addClass('hide');

      if(self.attr('sortable') == 'true'){
        var sort = self.children('i').removeClass('hide');
        if(sort.hasClass('fa fa-long-arrow-up')){
          sort.removeClass('fa fa-long-arrow-up').addClass('fa fa-long-arrow-down');
        }else{
          sort.removeClass('fa fa-long-arrow-down').addClass('fa fa-long-arrow-up');
        }
      }

    });

  });
})(jQuery);
// function loadProducts(){
  // var pn = $('input[name=\'pageIndex\']').val();
  // var type = $('input[name=\'type\']').val();
  // Yihu.doGet(ctx + '/artwork/list?currentPage={0}&artworkTypeName=artwork&categoryName={1}'.format(pn, type), {}, function(data){
  //   if(data.result === 0){
  //     var tpl = $('#goods-tpl').html();
  //     var template = Handlebars.compile(tpl);
  //     $('#goods-list>.gl-wrap').append(template(data));

  //     if(pn >= data.totalPages){
  //       $('.more .no-more').show();
  //       $('.more .load-more').hide();
  //     }
  //     $('#resultCount').text(data.totalRecords || 0);
  //     $('input[name=\'pageIndex\']').val(++pn);

  //   }
  // });
// }

var wf;
var Search = window.Search = {
  go: function(o){
    var self = $(o);
    if(self.closest('.multiple').length){
      return;
    }

    var key = self.data('name');
    var value = self.data('value');
    if(key == 'type'){
      $('input[type=\'hidden\']').val('');
      $('.valueList li').removeClass('selected');
      $('.valueList li.selectAll').addClass('selected');
    }
    if(key){
      $('#'+key).val(value);
    }
    Search.search();
  },

  multiGo:function(o){
    var self = $(o);
    var selectedNode = self.closest('.sl-value').find('.valueList li.selected>a');
    var key, values = [];
    selectedNode.map(function(){
      key = $(this).data('name');
      values.push($(this).data('value'));
    });
    if(key == 'type'){
      $('input[type=\'hidden\']').val('');
      // $(".valueList li").removeClass("selected");
      // $(".valueList li.selectAll").addClass("selected");
    }
    if(key){
      $('#'+key).val(values.join(','));
    }
    Search.search();
  },

  load: function(){
    wf = new Waterfall('#goods>.waterfall', {
      itemCls: 'box',
      prefix: 'goods',
      maxPage: 2,
      colWidth: colWidth,
      gutterWidth: 10,
      maxCol: 3,
      params: {pageSize: 10},
      path: function(page) {
        return ctx + '/artwork/list?currentPage='+page;
      }
    });
  },

  search: function(){
    var keyword = $('#txtKeyword').val() || '';
    var type = $('input[name=\'type\']').val() || '';
    var subType = $('input[name=\'calligraphy\']').val() || '';
    var theme = $('input[name=\'theme\']').val() || '';
    var price = $('input[name=\'price\']').val() || '';
    var artist = $('input[name=\'artist\']').val() || '';
    var scene = $('input[name=\'scene\']').val() || '';
    var duration = $('input[name=\'duration\']').val() || 0;
    $('#goods>.waterfall').html('');
    wf.option({
      params: { pageSize: 10, artworkTypeName: 'artwork', categoryParentName: type, categoryName: subType, sceneName: scene, subjectName: theme, authorName: artist, price: price, shelfTime: duration, keyword: keyword},
      state: { curPage:1, hasNext: true}
    });
  },

  moveUp: function(o){
    var sl = $(o).closest('.sl-v-list').find('.sl-scroll-list');
    var offset = parseInt(sl.css('margin-top').replace('px',''))+30;
    if(offset <= 0){
      sl.css('margin-top', offset);
    }
    $(o).siblings('i').css({
      'cursor': 'pointer',
      'color': '#666',
    });

    if(offset < 0){
      $(o).css({
        'cursor': 'pointer',
        'color': '#666',
      });
    }else{
      $(o).css({
        'cursor': 'not-allowed',
        'color': '#dedede',
      });
    }
  },
  moveDown: function(o){
    var sl = $(o).closest('.sl-v-list').find('.sl-scroll-list');
    var offset = parseInt(sl.css('margin-top').replace('px',''))-30;
    if(Math.abs(offset) < sl.height()){
      sl.css('margin-top', offset);
    }

    $(o).siblings('i').css({
      'cursor': 'pointer',
      'color': '#666',
    });
    if(Math.abs(offset)+30 < sl.height()){
      $(o).css({
        'cursor': 'pointer',
        'color': '#666',
      });
    }else{
      $(o).css({
        'cursor': 'not-allowed',
        'color': '#dedede',
      });
    }
  }
};