// mx的基础路径
const mxBasePath = 'mxGraph/src';

// mx的资源扩展名
const mxResourceExtension = '.properties';

// checkbox属性数组
const _checkboxNames = ['isRequired','isIntention','isAllow','isSendMessage','isEnd'];

// 禁用的checkbox属性数组
const _disableCheckboxNames = ['isIntention','isSendMessage'];

// 查看类型
var viewType = '0';

// mx的编辑器
var mxEditor;

var speechcraftId,speechcraftName,flowType,flowId,manage;

// 话术编辑url
var _editUrl = '';

//flow内容
var _flowContent = '';

// 基础url
var _baseUrl = '';

$(function(){
	_baseUrl = window.location.protocol + '//' + window.location.host;
	$.utils._dialogVue = $.utils.createDialogVue();
	$('#approve').hide();
})

/**
 * 加载工作流(查看和修改)
 * 
 * @returns
 */
function loadWorkFlowEditor(){
	// 得到超链接参数。0=查看，1=修改
	viewType = $.utils.getUrlParam("viewType");
	// 得到话术Id
	speechcraftId = $.utils.getUrlParam("speechcraftId");
	// 得到话术名称
	speechcraftName = $.utils.getUrlParam("speechcraftName");
	// 得到流程类型
	flowType = $.utils.getUrlParam("flowType");
	// 得到流程Id
	flowId = $.utils.getUrlParam("flowId");
	// 得到后台管理标识
	manage = $.utils.getUrlParam("m");
	
	if(manage == "1"){
		$('#exit').hide();
	}
	
	if(flowId != null && typeof(flowId) != "undefined" && flowId != ""){
		_editUrl = '/services/speechcraft/querySpeechcraftFlow.json?flowId=' + flowId;
	} else if (speechcraftId != null && typeof (speechcraftId) != "undefined" && speechcraftId != "" 
				&& flowType != null && typeof (flowType) != "undefined" && flowType != "") {
		_editUrl = '/services/speechcraft/querySpeechcraftFlowByFlowType.json?speechcraftId=' + speechcraftId + '&flowType=' + flowType;
	}	
	edit();
}

/**
 * 编辑流程
 * 
 * @param flowId
 * @returns
 */

function edit(){
	$.ajax({
		type : "GET",
		url : _editUrl,
		dataType : "json",
		contentType : "application/json",
		async:false,
		success : function(data) {
			if (data.resultMessageEnum == "0000") {
				var returnObject = data.returnObject;
				if (typeof(returnObject) != "undefined") {
					$('#head').html(returnObject.speechcraftName);
					if(viewType == "1"){
						if (returnObject.copyOperationType === 2){
							if(manage == null || manage == "" || manage == "0"){
								$('#approve').show();
							}
							mxEditor = createEditor('config/workfloweditor.xml');
							mxEditor.graph.enabled = true;
						} else if (returnObject.copyOperationType === 1){
							mxEditor = createEditor('config/workfloweditor-edit.xml');
						}
					} else if(viewType == null || viewType == "" || viewType == "0"){
						if(manage == "1"){
							mxEditor = createEditor('config/workfloweditor-manage.xml');
						} else {
							mxEditor = createEditor('config/workfloweditor-view.xml');
						}
					}
					showFlowDiagram(returnObject.flowContent);				
				}

				_flowContent = getFlowContent();

			} else if(data.resultMessageEnum == "0001"){
				$.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
			}
		}
	});
}

/**
 * 保存流程
 * 
 * @returns
 */
function save() {
	var speechcraftFlowPO = {
		"speechcraftId" : speechcraftId,
		"speechcraftName" : speechcraftName,
		"flowType" : flowType,
		"flowContent":getFlowContent()
	};
	if(flowId != null){
		speechcraftFlowPO.id = flowId;
	}
	$.ajax({
		type : "POST",
		url : "/services/speechcraft/saveSpeechcraftFlow.json",
		dataType : "json",
		contentType : "application/json",
		data : JSON.stringify(speechcraftFlowPO),
		success : function(data) {
			if (data.resultMessageEnum == "0000") {
				$.utils.tooltip('保存成功','success');
				_flowContent = getFlowContent();
			} else if(data.resultMessageEnum == "0001"){
				$.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
			}
		}		
	});
}

/**
 * 显示流程图
 * 
 * @param xml
 * @returns
 */
function showFlowDiagram(xml){
	var xmlDoc = mxUtils.parseXml(xml);
	mxEditor.readGraphModel(xmlDoc.documentElement);
}

/**
 * 获得流程内容
 * 
 * @returns XML content
 */
function getFlowContent() {
	var codec = new mxCodec();
	var node = codec.encode(mxEditor.graph.getModel());
	var xml = mxUtils.getXml(node);
	xml = $.utils.parseXML(xml,'mxGraphModel root Start');
	xml = $.utils.parseXML(xml,'mxGraphModel root Robot');
	xml = $.utils.parseXML(xml,'mxGraphModel root End');
	return xml;
}

/**
 * 显示上传录音对话
 * @returns
 */
function showUploadRecordDialog(){
	$.utils._dialogVue.editRecordTabs = $.utils._editableTabs;
	
	// 处理recordData
	$.utils._editableTabs.forEach((elem,index) => {
		let recordData = [];
		let arr = $.utils.handleSpeech(elem.content);
	
		arr.forEach((item,i) => {
			let data = {
					'id':i+1,
					'title':item,
					'url':getRecordUrl(item)
			};		
			recordData.push(data);
		})
		elem.recordData = recordData;
	})
	
	// 更新_dialogVue的recordData
	$.utils._editableTabs.forEach((elem,index) => {
		if(elem.name === $.utils._dialogVue.editRecordTabsValue){
			$.utils._dialogVue.recordData = elem.recordData;
		} 
	})
        	    		
	$.utils._dialogVue.dialogRecordVisible = true;
}
/**
 * 获取录音文件URL
 * @param {*} title 
 */
function getRecordUrl(title){
	var sReturn = '';

	$.utils._editableTabs.forEach((elem,index) => {
		if(elem.name === $.utils._dialogVue.editRecordTabsValue){
			let recordData = elem.recordData;
			recordData.forEach((item) => {
				if(item.title === title){
					sReturn = item.url;
				}
			})
		} 
	});	

	return sReturn;
}
/**
 * 显示退出对话框
 */
function showExitDialog(){
	if(viewType === '1' && _flowContent !== getFlowContent()){
		$.utils._dialogVue.exitText = '您还没有保存话术，确定要退出吗？';			
		$.utils._dialogVue.exitVisible = true;			
	} else {
		$.utils._dialogVue.exitText = '您确定退出当前话术编辑吗？';	
		$.utils._dialogVue.exitVisible = true;
	}	
}

/**
 * 提交审批
 */
function approve(){
	$.utils.tooltip('提交审批','info');
}

function addZero(val){
	return val = val <10?`0${val}`:val;
}

$('html').niceScroll({cursorcolor: '#CCC',cursorborder:'0px',zindex:999});