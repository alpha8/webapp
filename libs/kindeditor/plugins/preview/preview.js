/*******************************************************************************
* KindEditor - WYSIWYG HTML Editor for Internet
* Copyright (C) 2006-2011 kindsoft.net
*
* @author Roddy <luolonghao@gmail.com>
* @site http://www.kindsoft.net/
* @licence http://www.kindsoft.net/license.php
*******************************************************************************/

KindEditor.plugin('preview', function(K) {
	var self = this, name = 'preview', undefined;
	self.clickToolbar(name, function() {
		var lang = self.lang(name + '.'),
			html = '<div style="padding:10px 20px;">' +
				'<iframe class="ke-textarea" frameborder="0" style="width:708px;height:400px;"></iframe>' +
				'</div>',
			dialog = self.createDialog({
				name : name,
				width : 750,
				title : self.lang(name),
				body : html
			}),
			iframe = K('iframe', dialog.div),
			doc = K.iframeDoc(iframe);

		var fullHtml = self.fullHtml();

		//增加代码对图片做延迟加载处理j
		var htmlObj = $(self.html());
		htmlObj.find("img").each(function(i, item){
			var img = $(item);
			fullHtml = fullHtml.replace('<img src="'+img.attr("src")+'"', '<img class="lazy" data-original="'+img.attr("src")+'" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"');
		});
		//END
		
		doc.open();
		doc.write(fullHtml);
		doc.write('<script type="text/javascript" src="scripts/vendor.js"></script>');
		doc.write("<script type='text/javascript'>$('img.lazy').lazyload({effect:'fadeIn'})</script>");
		doc.close();
		K(doc.body).css('background-color', '#FFF');
		iframe[0].contentWindow.focus();
	});
});