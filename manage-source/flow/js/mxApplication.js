{
	// cell属性对象列表
	var attrs = [];
	// 页面元素对象列表
	var elements = {};	
	// mxGraph Object
	var graph;	
	// mxGraphModel Object
	var model;	
	// mxModel更新监听函数
	var _modelUpdateListenerFunct;
	// 节点类型
	var _nodeType = '';
	// 当前cell
	var currentCell;

	/**
	 * 应用构造函数 (返回mxEditor实例)
	 */
	function createEditor(config)
	{
		var editor = null;
		
		var hideSplash = function()
		{
			// Fades-out the splash screen
			var splash = document.getElementById('splash');
			
			if (splash != null)
			{
				try
				{
					mxEvent.release(splash);
					mxEffects.fadeOut(splash, 100, true);
				}
				catch (e)
				{
					splash.parentNode.removeChild(splash);
				}
			}
		};
		
		try
		{
			if (!mxClient.isBrowserSupported())
			{
				mxUtils.error('Browser is not supported!', 200, false);
			}
			else
			{
				mxObjectCodec.allowEval = true;
				var node = mxUtils.load(config).getDocumentElement();
				editor = new mxEditor(node);
				mxObjectCodec.allowEval = false;
				
				// Adds active border for panning inside the container
				editor.graph.createPanningManager = function()
				{
					var pm = new mxPanningManager(this);
					pm.border = 30;
					
					return pm;
				};
				
				editor.graph.allowAutoPanning = true;
				editor.graph.timerAutoScroll = true;
				
				// Updates the window title after opening new files
				var title = document.title;
				var funct = function(sender)
				{
//					document.title = title + ' - ' + sender.getTitle();
					document.title = title;
				};
				
				editor.addListener(mxEvent.OPEN, funct);
				
				// Prints the current root in the window title if the
				// current root of the graph changes (drilling).
				editor.addListener(mxEvent.ROOT, funct);
				funct(editor);
				
				// Displays version in statusbar
				editor.setStatus('mxGraph '+mxClient.VERSION);

				// Shows the application
				hideSplash();
			}
			
			graph = editor.graph;	
			model = editor.graph.getModel();

			customize(editor);
		}
		catch (e)
		{
			hideSplash();

			// Shows an error message if the editor cannot start
			mxUtils.alert('Cannot start application: ' + e.message);
			throw e; // for debugging
		}
		
		return editor;
	}

	/**
	 * 更新mxModel
	 */
	function updateModel(cell)
	{
		// 开始更新cell数据
		model.beginUpdate();
		try {
			if (_nodeType !== '') {
				switch(_nodeType)
				{
				case 'answer':
					// 意图编辑器
					for (var i = 0; i < attrs.length; i++) {
						let nodeName = attrs[i].nodeName;
						let val;
						if (nodeName != 'nodeType') {
							switch(nodeName)
							{
							case 'label':
								val = $.utils._intentLabel;
							  break;
							case 'keywords':
								val = $.utils._intentKeywords;
							  break;
							case 'intentionId':
								val = $.utils._intentId;
								break;
							case 'level':
								val = $.utils._intentLevel;
								break;
							case 'jumpType':
                                val = $.utils._jumpType;
								break;
							case 'jumpItemType':
								val = $.utils._jumpItemType;
								break;

							}
							// 更新数据到mxModel
							let edit = new mxCellAttributeChange(cell, nodeName, val);	
							model.execute(edit);									
						}
					}
				  break;
				default:
					// 话术编辑器
					elements['speechcraft'] = JSON.stringify($.utils._speechcraftContent);
					for (var i = 0; i < attrs.length; i++) {
						let nodeName = attrs[i].nodeName;
						let val;
						if(nodeName != 'nodeType' && nodeName != 'artificialIntention'){
							if(nodeName == 'speechcraft'){
								val = elements[nodeName];
							} 
							else if(nodeName == 'intentionLevel'){
								val = $.utils._intentionLevel;
							}
							else if(nodeName == 'excSkipNode'){
								val = $.utils._speechcraftContentVue.excSkipNode;
							}
							else if ($.inArray(nodeName,$.utils._checkList) >= 0) {
								val = false;
								if($.inArray(nodeName,$.utils._checkedList) >= 0){
									val = true;
								} 
							} else {
								val = elements[nodeName].value;
							}
							// 更新数据到mxModel
							var edit = new mxCellAttributeChange(cell, nodeName, val);	
							model.execute(edit);
						}
					}
					break;
				}				
			}

			if (graph.isAutoSizeCell(cell)) {
				graph.updateCellSize(cell);
			}
			
		} finally {
			// 结束更新
			model.endUpdate();
		}
	};
	
	/**
	 * 客制化方法
	 */
	function customize(mxEditor){
		// 样式或样式前缀
		const style = 'myWindow';
		// 属性窗口宽度
		mxEditor.propertiesWidth = 480;
		// 节点文字左外边距
		mxSvgCanvas2D.prototype.marginLeft = 10;
		// 禁止Cell可编辑
		mxGraph.prototype.cellsEditable = false;
		// 禁止自动滚动
		mxGraph.prototype.autoScroll = false;
		// 禁止自动扩展
		mxGraph.prototype.autoExtend = false;
		// 禁止双击事件
		mxGraph.prototype.nativeDblClickEnabled = false;
        // 禁止右键菜单
        mxPopupMenu.prototype.enabled = false;
        // 禁止手动改变cell大小
        mxGraph.prototype.cellsResizable = false;
        // 自动改变cell大小
        mxGraph.prototype.autoSizeCells = true;
        // 禁止鼠标移动到cell上时显示提示,默认显示cell的名称
		mxEditor.graph.setTooltips(false);
		// 禁止画布编辑	
		mxGraph.prototype.enabled = false;
		// 连线鼠标形状
		mxConstants.CURSOR_CONNECT = 'crosshair';		
		// 节点被选边框宽度
		mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
		// 连线被选边框宽度
		mxConstants.EDGE_SELECTION_STROKEWIDTH = 2;
		// 控键大小
		mxConstants.HANDLE_SIZE = 10;
		
		/**
		 * mxGraph单击事件
		 */
		mxEditor.graph.addListener(mxEvent.CLICK, function(sender, evt) {

			//去掉敏感词框
			for (var i in $.utils.highlight){
				if (sender.lastTouchCell != null && sender.lastTouchCell.id == i){
					$.utils.highlight[i].hide()
				}
			}

			var event = evt.getProperty('event');
			var cell = evt.getProperty('cell');
			updateModel(currentCell); // 更新mxModel
			if (typeof cell != 'undefined' && cell.isVertex() && !event.isConsumed) {
				currentCell = cell;
				mxEditor.execute("showProperties", cell);
                /***
				 *  需求2.3点击按钮时候
                 */
                if (cell.edges != null && cell.edges.length > 0 ){
					for (let i in cell.edges){
						let _edge = cell.edges[i]
						if (_edge.getStyle() == "redEdge"){
							let state = graph.view.getState(_edge)
                            state.shape.node.getElementsByTagName('path')[0].removeAttribute("display")
                            state.shape.node.getElementsByTagName('path')[1].removeAttribute("display")
                            state.shape.node.getElementsByTagName('path')[2].removeAttribute("display")
                            state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow')
                            _lastTouchCellId.push(_edge)
						}
					}
				}

                /**
				 * 需求2.3 ------end----
                 */
                evt.consume();
			} else {
				mxEditor.hideProperties();
				if (typeof cell == 'undefined') {
					mxEditor.graph.clearSelection();
				}
				$.utils._dialogVue.dialogSpeechContLibVisible = false;
                //需求2.3 ------start----
				if (_lastTouchCellId.length > 0){
					for (let i in _lastTouchCellId){
                        let state = graph.view.getState(_lastTouchCellId[i])
						if (typeof state != 'undefined') {
							state.shape.node.getElementsByTagName('path')[0].setAttribute("display","none")
							state.shape.node.getElementsByTagName('path')[1].setAttribute("display","none")
							state.shape.node.getElementsByTagName('path')[2].setAttribute("display","none")
							state.shape.node.getElementsByTagName('path')[1].removeAttribute('class', 'flow')
						}
					}
                    _lastTouchCellId = []
				}
				//需求2.3 ------end----
				evt.consume();
			}

		});

		/**
		 * 添加呼叫Action
		 */
		mxEditor.addAction('call', function(mxEditor){
			// $.utils._dialogVue.dialogOnlineVisible = true;
		});		
		
		/**
		 * 重构创建属性
		 */
		mxEditor.createProperties = function(cell) {
			var value = model.getValue(cell);
			if (mxUtils.isNode(value)) {
				// cell属性对象列表
				attrs = value.attributes;
				// html页面元素对象列表
				elements = {};
				// checkBox元素map name:obj
				var checkboxs = {};
				var form = new mxForm('speechcraft');
				// 清空已选列表
				$.utils._checkedList = [];
				$.utils._checkList = [];
				// 初始化异常跳转
				$.utils._EXCSkipVisible = false; 	
				$.utils._EXCSkipOptions = [];  	
				$.utils._excSkipNode = '';
                $.utils._jumpType = ""
                $.utils._jumpItemType = ""
				_nodeType= cell.getAttribute('nodeType','');
				switch(_nodeType)
				{
				case 'answer':
					// 意图编辑器
					for (var i = 0; i < attrs.length; i++) {
						let val = attrs[i].value;
						let nodeName = attrs[i].nodeName;
						if (nodeName != 'nodeType') {
							switch(nodeName)
							{
							case 'label':
								$.utils._intentLabel = val;
							  break;
							case 'keywords':
								$.utils._intentKeywords = val;
							  break;
							case 'intentionId':
								$.utils._intentId = val;
								break;
							case 'level':
								$.utils._intentLevel = val;
								break;
							case 'jumpType':
								$.utils._jumpType = val;
								break;
							case 'jumpItemType':
								$.utils._jumpItemType = val;
								break;
							}
						}
					}
					// 创建话术编辑器DOM元素
					form.addIntentionEditorElement();
				  break;
				default:
					// 话术编辑器
					for (var i = 0; i < attrs.length; i++) {
						let val = attrs[i].value;
						let nodeName = attrs[i].nodeName;
						let nodeNameValue = mxResources.get(nodeName);
						if (nodeName.indexOf('is') === 0) {
							$.utils._checkList.push(nodeName);
						}
						if (nodeName != 'nodeType' && nodeName != 'artificialIntention') {
							// 标题
							if (nodeName == 'label') {
								elements[nodeName] = form.addText(nodeNameValue, val);
							} 
							// 内容
							else if(nodeName == 'speechcraft'){
								if(val !== ""){
									$.utils._speechcraftContent = $.utils.parseJSON(val);
								} else {
									$.utils._speechcraftContent = {
											'main':[{
												'title':'首轮话术',
												'name':1,
												'content':'',
												'isLocked':false,
												'recordData':[],
												'viewCont':''
											}],
											'quiet':[{
												'title':'首轮话术',
												'name':1,
												'content':'',
												'isLocked':false,
												'recordData':[],
												'viewCont':''
											}],
											'exception':[{
												'title':'首轮话术',
												'name':1,
												'content':'',
												'isLocked':false,
												'recordData':[],
												'viewCont':''
											}],
											'retell':[{
												'title':'首轮话术',
												'name':1,
												'content':'',
												'isLocked':false,
												'recordData':[],
												'viewCont':''
											}]
										};
								}
								// 添加话术内容
								form.addSpeechcraftContentElement();
							} 
							// 意图分类级别
							else if(nodeName == 'intentionLevel') {
								$.utils._intentionLevel = val;
								if (_nodeType != 'start' && _nodeType != 'answer') {
									// 获取意图分类级别
									$.utils._intentionLevel = $.utils.getIntentionLevel(getFlowContent(), cell.id, value.tagName);
								}
							}
							// 异常跳转
							else if(nodeName == 'isEXCSkip') {
								$.utils._EXCSkipOptions = $.utils.getNextAnswerNode(getFlowContent(), cell.id);  	
								if($.utils.convertStr2Bool(val)){
									$.utils._EXCSkipVisible = true; 	
								}
							}
							// 异常跳转节点
							else if(nodeName == 'excSkipNode') {
								$.utils._excSkipNode = val;									
							}
							// 被选复选框
							if ($.inArray(nodeName, $.utils._checkList) >= 0 && $.utils.convertStr2Bool(val)) {
								$.utils._checkedList.push(nodeName);
							}
						}
					}
					break;
				}
				return form.table;
			}

			return null;
		};		
		
		/**
		 * 重构显示属性
		 */
		mxEditor.showProperties = function(cell) {
			cell = cell || this.graph.getSelectionCell();

			if (cell == null) {
				cell = this.graph.getCurrentRoot();
				if (cell == null) {
					cell = this.graph.getModel().getRoot();
				}
			}

			if (cell != null) {
				this.graph.stopEditing(true);

				var offset = mxUtils.getOffset(this.graph.container);
				var x = offset.x + 10;
				var y = offset.y;

				if (this.properties != null && !this.movePropertiesDialog) {
					x = this.properties.getX();
					y = this.properties.getY();
				} else {
					var bounds = this.graph.getCellBounds(cell);

					if (bounds != null) {
						x += bounds.x + Math.min(200, bounds.width);
						y += bounds.y;
					}
				}

				this.hideProperties();
				var node = this.createProperties(cell);
				if (node != null) {
					switch(_nodeType)
					{
					case 'answer':
						// 意图编辑器
						this.propertiesResource = 'intentionEditor';
						break;
					default:
						// 话术编辑器
						this.propertiesResource = 'speechcraftEditor';
						break;
					}	
				
					x = document.getElementById('graph').offsetWidth - this.propertiesWidth;
					y = document.getElementById('toolbar').offsetHeight;
					this.properties = new mxWindow(mxResources.get(this.propertiesResource), node, x - 2, y + 40,
							this.propertiesWidth, this.propertiesHeight, false,
							null, null, style);						
	
					switch(_nodeType)
					{
					case 'answer':
						// 意图编辑器
						$.utils._intentionEditorVue = $.utils.createIntentionEditorVue();
						break;
					default:
						// 话术编辑器
						$.utils._speechcraftContentVue = $.utils.createSpeechcraftContentVue();
						break;
					}
					this.properties.setVisible(true);

					// 添加鼠标移动监听 	
//					 mxEvent.addListener(window.document.getElementById(style), 'mousemove', function(){ 
//					/*mxEvent.addListener(window.document.body, 'mousemove', function(){*/
//						_modelUpdateListenerFunct();
//					});	
				}
			}
		};

		/**
		 * 重构更新cell大小
		 */
		mxGraph.prototype.cellSizeUpdated = function(cell, ignoreChildren)
		{
			if (cell != null)
			{
				this.model.beginUpdate();				
				try
				{
					var size = this.getPreferredSizeForCell(cell);
					var geo = this.model.getGeometry(cell);
					
					if (size != null && geo != null)
					{
						var collapsed = this.isCellCollapsed(cell);
						geo = geo.clone();

						if (this.isSwimlane(cell))
						{
							var state = this.view.getState(cell);
							var style = (state != null) ? state.style : this.getCellStyle(cell);
							var cellStyle = this.model.getStyle(cell);

							if (cellStyle == null)
							{
								cellStyle = '';
							}

							if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true))
							{
								cellStyle = mxUtils.setStyle(cellStyle,
										mxConstants.STYLE_STARTSIZE, size.height + 8);

								if (collapsed)
								{
									geo.height = size.height + 8;
								}

								geo.width = size.width;
							}
							else
							{
								cellStyle = mxUtils.setStyle(cellStyle,
										mxConstants.STYLE_STARTSIZE, size.width + 8);

								if (collapsed)
								{
									geo.width = size.width + 8;
								}

								geo.height = size.height;
							}

							this.model.setStyle(cell, cellStyle);
						}
						else
						{
							// 原始配置
							/*geo.width = size.width;
							geo.height = size.height;*/	
													
							geo.width = (size.width > 130 ? 130 : size.width) + 10;
							geo.height = size.height + 10;
						}

						if (!ignoreChildren && !collapsed)
						{
							var bounds = this.view.getBounds(this.model.getChildren(cell));

							if (bounds != null)
							{
								var tr = this.view.translate;
								var scale = this.view.scale;

								var width = (bounds.x + bounds.width) / scale - geo.x - tr.x;
								var height = (bounds.y + bounds.height) / scale - geo.y - tr.y;

								geo.width = Math.max(geo.width, width);
								geo.height = Math.max(geo.height, height);
							}
						}

						this.cellsResized([cell], [geo], false);
					}
				}
				finally
				{
					this.model.endUpdate();
				}
			}
		};

		/**
		 *  重构 createDiv方法  
		 * @param {*} str 
		 * @param {*} align 
		 * @param {*} valign 
		 * @param {*} style 
		 * @param {*} overflow 
		 */
		mxSvgCanvas2D.prototype.createDiv = function(str, align, valign, style, overflow)
		{
			var s = this.state;

			// Inline block for rendering HTML background over SVG in Safari
			var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (s.fontSize * mxConstants.LINE_HEIGHT) + 'px' :
				(mxConstants.LINE_HEIGHT * this.lineHeightCorrection);
			
			style = 'display:inline-block;font-size:' + s.fontSize + 'px;font-family:' + s.fontFamily +
				';color:' + s.fontColor + ';line-height:' + lh + ';margin-left:' + this.marginLeft + 'px;' + style;

			if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD)
			{
				style += 'font-weight:bold;';
			}

			if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC)
			{
				style += 'font-style:italic;';
			}
			
			if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE)
			{
				style += 'text-decoration:underline;';
			}
			
			if (align == mxConstants.ALIGN_CENTER)
			{
				style += 'text-align:center;';
			}
			else if (align == mxConstants.ALIGN_RIGHT)
			{
				style += 'text-align:right;';
			}

			var css = '';
			
			if (s.fontBackgroundColor != null)
			{
				css += 'background-color:' + s.fontBackgroundColor + ';';
			}
			
			if (s.fontBorderColor != null)
			{
				css += 'border:1px solid ' + s.fontBorderColor + ';';
			}
			
			var val = str;
			
			if (!mxUtils.isNode(val))
			{
				val = this.convertHtml(val);
				
				if (overflow != 'fill' && overflow != 'width')
				{
					// Inner div always needed to measure wrapped text
					val = $.utils.getByteLen(val) > 14 ? str.substr(0,7)+'...' : val;
					val = '<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;' + css + '">' + val + '</div>';
				}
				else
				{
					style += css;
				}
			}

			// Uses DOM API where available. This cannot be used in IE to avoid
			// an opening and two (!) closing TBODY tags being added to tables.
			if (!mxClient.IS_IE && document.createElementNS)
			{
				var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
				div.setAttribute('style', style);
				
				if (mxUtils.isNode(val))
				{
					// Creates a copy for export
					if (this.root.ownerDocument != document)
					{
						div.appendChild(val.cloneNode(true));
					}
					else
					{
						div.appendChild(val);
					}
				}
				else
				{
					div.innerHTML = val;
				}
				
				return div;
			}
			else
			{
				// Serializes for export
				if (mxUtils.isNode(val) && this.root.ownerDocument != document)
				{
					val = val.outerHTML;
				}

				// NOTE: FF 3.6 crashes if content CSS contains "height:100%"
				return mxUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml" style="' + style + 
					'">' + val + '</div>').documentElement;
			}
		};		
		
		/**
		 * 重构隐藏属性对话框
		 */
		mxEditor.hideProperties = function ()
		{
			if (this.properties != null)
			{
				this.properties.destroy();
				$('.el-select-dropdown').remove();
				this.properties = null;
			}
		};
		
		/**
		 * 重构设置模式方法
		 */
		/*mxEditor.setMode = function(modename)
		{
			if (modename == 'select')
			{
				$('#graph').css('cursor','default');
				this.graph.panningHandler.useLeftButtonForPanning = false;
				this.graph.setConnectable(false);
			}
			else if (modename == 'connect')
			{
				$('#graph').css('cursor','default');
				this.graph.panningHandler.useLeftButtonForPanning = false;
				this.graph.setConnectable(true);
			}
			else if (modename == 'pan')
			{
				$('#graph').css('cursor','move');
				this.graph.panningHandler.useLeftButtonForPanning = true;
				this.graph.setConnectable(false);
			}
		};*/

		/**
		 * 重构cell是否可删除方法
		 */
		mxGraph.prototype.isCellDeletable = function(cell)
		{
			var state = this.view.getState(cell);
			var style = (state != null) ? state.style : this.getCellStyle(cell);
			let selectionCell = this.getSelectionCell();;
			if (cell.getAttribute('nodeType', '') !== 'start' && typeof selectionCell != 'undefined' && selectionCell.getStyle() !== 'redEdge') {
				return this.isCellsDeletable() && style[mxConstants.STYLE_DELETABLE] != 0;
			}
			else {
				return false;
			}
		};
		
		/**
		 * 重构cell是否可被复制到剪切板方法
		 */
		mxGraph.prototype.canExportCell = function(cell)
		{
			if (cell.getAttribute('nodeType','') !== 'start') {
				return this.exportEnabled;
			}
			else {
				return false;
			}
		};	
		
		/**
		 * 重构cell是否可从剪切板复制到graph方法
		 */
		mxGraph.prototype.canImportCell = function(cell)
		{
			if (cell.getAttribute('nodeType','') !== 'start') {
				return this.importEnabled;
			}
			else {
				return false;
			}
		};

		/**
		 * 重构cell是否可移动
		 */
		mxGraph.prototype.isCellMovable = function(cell)
		{
			var state = this.view.getState(cell);
			var style = (state != null) ? state.style : this.getCellStyle(cell);
			if (!cell.isEdge()) {
				return this.isCellsMovable() && !this.isCellLocked(cell) && style[mxConstants.STYLE_MOVABLE] != 0;
			}
			else {
				return false;
			}
			
		};
        /**
		 * 重写insert方法 （v1.1 2.1. P0 话术流程设计中的交互细化 需求）
         * @param vertex
         * @param evt
         * @param target
         */
        mxDefaultToolbar.prototype.insert = function(vertex, evt, target){
            var graph = this.editor.graph;

            if (graph.canImportCell(vertex))
            {
                var x = mxEvent.getClientX(evt);
                var y = mxEvent.getClientY(evt);
                var pt = mxUtils.convertPoint(graph.container, x, y);

                // Splits the target edge or inserts into target group
                if (graph.isSplitEnabled() &&
                    graph.isSplitTarget(target, [vertex], evt))
                {
                    return graph.splitEdge(target, [vertex], null, pt.x, pt.y);
                }
                else
                {
					//意图模块特殊处理 添加意图模块的时候还要添加一个robot模块
					if (vertex.value.nodeName == "Answer"){

						parent =  graph.getDefaultParent()
                        var doc = mxUtils.createXmlDocument();
                        var node = doc.createElement('Robot')
                        node.setAttribute('label', '机器人话术');
                        node.setAttribute('nodeType', 'robot');
                        node.setAttribute('speechcraft', '');
                        node.setAttribute('intentionLevel', '');
                        node.setAttribute('isAllow', 'false');
                        node.setAttribute('isInterrupt', 'true');
                        node.setAttribute('isSkip', 'false');
                        node.setAttribute('isEnd', 'false');
                        node.setAttribute('isEXCSkip', 'false');
                        node.setAttribute('artificialIntention', '');
                        node.setAttribute('excSkipNode', '');
						let v1 = this.editor.graph.insertVertex(parent,null,node,x-30,y+100,100,30,"robot");
						this.editor.graph.insertEdge(parent,null,mxEditor.templates.edge.value,vertex,v1,"straightEdge")
					}
                    return this.editor.addVertex(target, vertex, pt.x, pt.y);
                }
            }


            return null;
        }

        // //重写插入edge的方法（v2.1 话术流程设计中的交互细化）
        mxConnectionHandler.prototype.insertEdge = function(parent, id, value, source, target, style)
        {
        	//当edges 是插入的动作的时候
        	let edge;
        	let sourceId = source.id;
            let soruceCount = 0
            if (source != null){
                if (source.value.nodeName == "Answer"){
                    if (source.edges != null && source.edges.length > 0){
                        for (let i in source.edges){
                            if (sourceId == source.edges[i].source.id){
                                soruceCount += 1;
                            }
                        }
                    }
                    //如果当前source大于0 ，说明她下面已经有了一条线，直接返回
                    if (soruceCount > 0){
                        return
                    }
                }
            }
            //------------------
            if (this.factoryMethod == null)
            {
                edge =  this.graph.insertEdge(parent, id, value, source, target, style);
            }
            else
            {
                edge = this.createEdge(value, source, target, style);
                edge = this.graph.addEdge(edge, parent, source, target);
            }
            return edge
        };

		mxGraph.prototype.htmlLabels = true;

		mxGraph.prototype.isWrapping = function(cell)
		{
			return true;
		};

		mxConstants.DEFAULT_HOTSPOT = 1;

		// Enables guides
		mxGraphHandler.prototype.guidesEnabled = true;

		// Alt disables guides
		mxGuide.prototype.isEnabledForEvent = function(evt)
		{
			return !mxEvent.isAltDown(evt);
		};

		// Enables snapping waypoints to terminals
		mxEdgeHandler.prototype.snapToTerminals = true;

		// 退出浏览器时提示保存
		// window.onbeforeunload = function() { return mxResources.get('changesLost'); };

        /**
         * 加强删除方法
         * @param cells
         * @param includeEdges
         * @returns {*}
         */
        mxGraph.prototype.removeCells = function(cells, includeEdges)
        {
            includeEdges = (includeEdges != null) ? includeEdges : true;

            if (cells == null)
            {
                cells = this.getDeletableCells(this.getSelectionCells());
            }

            //目标删除 -----2019-07-24
            for (var i in  cells){
                for (var j in cells[i].edges){
                    if (cells[i].edges[j].target != null){
                        let target = cells[i].edges[j].target;
                        let redLineCount = 0
                        for (var t in target.edges){
                            if (target.edges[t].style=="redEdge"){
                                redLineCount = redLineCount +1
                            }
                        }
                        if (redLineCount == 1){
                            this.removeCellOverlays(target);
                        }
                    }

                    if (cells[i].edges[j].source != null){
                    	let source = cells[i].edges[j].source;
						if (cells[i].style == "robot" || cells[i].style == "end"){
							if (source.style == "answerforwrd"){
								let sRedcount = 0
                                for (var t in source.edges){
                                    if (source.edges[t].style=="redEdge"){
                                        sRedcount = sRedcount +1
                                    }
                                }
                                if (sRedcount == 1){
                                    this.removeCellOverlays(source);
                                    this.getModel().setStyle(source,"answer")
                                    source.value.attributes[5].value = ""
                                    source.value.attributes[6].value = ""
                                }
							}
						}
					}
                }
            }

            //目标删除-----
            // Adds all edges to the cells
            if (includeEdges)
            {
                // FIXME: Remove duplicate cells in result or do not add if
                // in cells or descendant of cells
                cells = this.getDeletableCells(this.addAllEdges(cells));
            }

            this.model.beginUpdate();
            try
            {
                this.cellsRemoved(cells);
                this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS,
                    'cells', cells, 'includeEdges', includeEdges));
            }
            finally
            {
                this.model.endUpdate();
            }


            return cells;
        };
	}
}
