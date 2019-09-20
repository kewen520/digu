/**
 * 创建一个contenteditable富文本编辑器
 */

/**
 * 构造富文本编辑器对象
 * 
 * @param id 容器Id
 * @param style 样式名称
 * @param content 内容(HTML片段)
 * @param isDisabled 禁用标识(true-禁用,false-可用)
 * 
 */
function richEditor(containerId, style, content, isDisabled) {
	this.containerId = containerId
	this.style = (style != null) ? style : 'rich-editor';
	this.content = content;
	this.isDisabled = isDisabled;
	$('#' + this.containerId).empty();
	if (content.indexOf('<div contenteditable="true" class="' + this.style + '">') == -1) {
		$('#' + this.containerId).append(this.createEditor());		
	} else {
		$('#' + this.containerId).append(content);
		if (isDisabled) {
			$('#' + this.containerId + '>div').attr('contenteditable', !isDisabled)
			$('#' + this.containerId + '>div').addClass(style + '-disabled')
		}
	}
	richEditor.bindEvent(this.style, this.isDisabled);
}

/**
 * 创建编辑器
 */
richEditor.prototype.createEditor = function() {
	this.div = document.createElement('div');
	this.div.setAttribute('contenteditable', !this.isDisabled);
	this.div.className = this.style;
	if (this.isDisabled) {
		this.div.className += ' ' + this.style + '-disabled';
	}
	this.div.innerHTML = this.content;
	return this.div;
}

/**
 * 绑定事件
 * 
 * @param style 样式名称
 * @param isDisabled 禁用标识(true-禁用,false-可用)
 */
richEditor.bindEvent = function(style,isDisabled) {
	// 知识库设置
	if ($.utils._dialogVue.knowledgeVisible) {
		$('#hungup-speechcraft-content>.' + style).on('DOMNodeInserted DOMNodeRemoved input propertychange',
				function(e) {
					setTimeout(() => {
						$.utils._dialogVue.knowledgeForm.hungupSpeechcraftContent = e.currentTarget.outerHTML;
					}, 500);
				});
		$('#hungup-speechcraft-content>.' + style + '>span').on('click', 'i', function(e) {
			e.delegateTarget.remove();
			
		});			
	} 
	// 话术编辑器
	else {
		if (!isDisabled) {
			$('.' + style).on('DOMNodeInserted DOMNodeRemoved input propertychange',
					function(e) {
						$.utils._speechcraftContent[$.utils._flowTypeName].forEach((elem) => {
							if(elem.name === $.utils._speechcraftContentVue.editableTabsName){
								setTimeout(() => {
									elem.content =  e.currentTarget.outerHTML;
								}, 500);
							} 
						});	
					});
			$('.' + style + '>span').on('click', 'i', function(e) {
				e.delegateTarget.remove();
			});		
		}		
	}
}

/**
 * 解绑事件
 * 
 * @param style 样式名称
 */
richEditor.unbindEvent = function(style) {
	let $editor = $('.' + style);
	$editor.unbind('DOMNodeInserted DOMNodeRemoved input propertychange');
	$editor.off('click', 'span');
}