// mx的基础路径
const mxBasePath = 'mxGraph/src';

// mx的资源扩展名
const mxResourceExtension = '.properties';

// 帮助文档地址
const _helpUrl = frontHost + '/index.html#/help';

// 话术内容库地址
const _speechUrl = frontHost + '/index.html#/speech';

// 富文本编辑器class名称
var _style = 'rich-editor';

// 查看类型
var viewType = '0';

// mx的编辑器
var mxEditor;

var speechcraftId,speechcraftStatus,speechcraftName,flowType,flowId,industryType,templateType,industryStatus;

// 话术编辑url
var _editUrl = '';

//flow内容
var _flowContent = '';

var _lastTouchCellId = []
// 流程是否变化
var isChange = false;
// 自动保存时间间隔10分钟 （单位毫秒）
var auto_save_interval = 1000*60*10;
//var auto_save_interval = 1000*20;
// 是否在线
var isOnline = true;
// 淡入淡出动画速度 毫秒
var speed = 3000;
// 是否全局转人工
var _isArtificial = true;

$( document ).ready(function() {
    window.addEventListener('online',  function(){
    	$("#saveBtn").removeClass("grayBtn");
    	$("#statusText").text("保存话术");
    	isOnline = true;
    	var hides = ["successStatus","offlineStatus","errorStatus"];
    	hideStatus(hides);
    	$("#errorInfo").hide();
    	$("#offlineInfo").hide();
    	if(isChange){
    		save(false);
    		isChange = false;
    	}
	});
    
	window.addEventListener('offline', function(){
		isOnline = false;
		$("#successStatus").hide();
		$("#errorStatus").hide();
    	$("#offlineStatus").show();
	    showInfo("offlineInfo");
	});

   var timerId = setInterval(function() {
  //  alert(isChange);
      if(isChange && window.location.hash !== '#listViewType'){
          if(isOnline){
               save(false);
                  isChange = false;
          }else{
                   showInfo("errorInfo");
           }
       }
   }, auto_save_interval);

    if (window.location.hash === '#listViewType') {
        $(window).on('load', () => {
            window.MessageBridgeUtils.showListViewType();
		});
    }

    $('#viewSwitch .icon-list').on('click', () => {
        window.MessageBridgeUtils.showListViewType();
    });

    const vType = $.utils.getUrlParam("viewType");
    if (vType === '0') {
    	$('#viewSwitch').hide();
	}
});
/**
 * 状态流程
 * 初始化参数
 *
 * @returns
 */
function onload(){
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

	if(flowId != null && typeof(flowId) != "undefined" && flowId != ""){
		_editUrl = baseHost +'/services/speechcraft/querySpeechcraftFlow.json?flowId=' + flowId;
	} else if (speechcraftId != null && typeof (speechcraftId) != "undefined" && speechcraftId != ""
				&& flowType != null && typeof (flowType) != "undefined" && flowType != "") {
		_editUrl = baseHost +'/services/speechcraft/querySpeechcraftFlowByFlowType.json?speechcraftId=' + speechcraftId + '&flowType=' + flowType;
	}
	// 实例化对话Vue对象
	$('#_dialog').html($.utils.loadHTML('dialog.html'));
	$.utils._dialogVue = $.utils.createDialogVue();
    $.utils.queryCurrentSpeechcraftDetail()
	edit();

	graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){
		isChange = true;
	});

    //加载完毕之后，给answerforwrd 加上跳转标示
    graph.getModel().beginUpdate();
    try {
        let _cells =  graph.getModel().cells
        for (let  i in _cells){
            let _overlay = new mxCellOverlay(
                new mxImage('images/undo.gif', 16, 16),
                '','right',"top");
            if (_cells[i].style == "answerforwrd"){
                graph.addCellOverlay(_cells[i],_overlay)
            }else if (_cells[i].value.nodeName == "End" || _cells[i].value.nodeName == "Robot"){
                if (_cells[i].edges != null && _cells[i].edges.length > 0){
                    for (let x in _cells[i].edges){
                        let it = _cells[i].edges[x]
                        if (it.style == "redEdge"){
                            if (graph.getCellOverlays(it.source) == null){
                                graph.addCellOverlay(it.source,_overlay)
                            }
                            if (graph.getCellOverlays(it.target) == null){
                                graph.addCellOverlay(it.target,_overlay)
                            }
                        }
                    }
                }
            }else if (_cells[i].style == "redEdge"){
                //初始化的时候redEdge设置为不可见
                let state = graph.view.getState(_cells[i])
				state.shape.node.getElementsByTagName('path')[0].setAttribute("display","none")
				state.shape.node.getElementsByTagName('path')[1].setAttribute("display","none")
				state.shape.node.getElementsByTagName('path')[2].setAttribute("display","none")
			}
        }
	}finally {
        graph.getModel().endUpdate();
	}
}

/**
 * 编辑流程
 *
 * @param flowId
 * @returns
 */

function edit(){
	// 隐藏审批按钮
	$('#approve').hide();

	// 查询话术流程
	$.ajax({
		type : "GET",
		url : _editUrl,
		dataType : "json",
		contentType : "application/json",
		async:false,
		success : function(data) {
			if (data.resultMessageEnum === "0000") {
				var returnObject = data.returnObject;
				if (typeof(returnObject) !== "undefined") {
					templateType = returnObject.templateType;
					speechcraftName = returnObject.speechcraftName;
					industryType = returnObject.industryType;
					$.utils._dialogVue.speechForm.speechcraftName = speechcraftName;
					$.utils._dialogVue.speechForm.isInterrupt = returnObject.isInterrupt == 1 ? true : false;
					$.utils._dialogVue.speechForm.isArtificial = returnObject.isArtificial == 1 ? true : false;
					$.utils._dialogVue.speechForm.artificialIntention = returnObject.artificialIntention != '' ? returnObject.artificialIntention.split(',') : [];
					$('#head .head-title').html(speechcraftName);
					speechcraftStatus = returnObject.speechcraftStatus;
					industryStatus = returnObject.industryStatus;
					if(viewType == "1"){
						$('#approve').show();
						if (returnObject.copyOperationType === 2){
							mxEditor = createEditor('config/workfloweditor.xml');
							mxEditor.graph.enabled = true;
						} else if (returnObject.copyOperationType === 1){
							mxEditor = createEditor('config/workfloweditor-edit.xml');
						}
					} else if(viewType == null || viewType == "" || viewType == "0"){
						$('#save').hide();
						$('#exit').hide();
						mxEditor = createEditor('config/workfloweditor-view.xml');
					}
					if (industryStatus != 2) {
						$('#approve>button').addClass('is-disabled');
						$('#approve>button').attr('disabled','disabled');
						$('#industryOfflineInfo').show();
					}
					if (templateType === 1) {
						$('#knowledge').hide();
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
 * @param {*} isApprove 审批保存标识
 */
function save(isApprove, successCallback, failCallback) {
	if (this.hasSensitiveWord()){
		return false;
	}
	let fullScreenLoadingText = '';
	if(isApprove){
		fullScreenLoadingText = '提交审核中';
	} else {
		fullScreenLoadingText = '保存中';
	}
	$.utils._dialogVue.openFullScreenLoading(fullScreenLoadingText);
	if(!isOnline){
		$("#saveBtn").addClass("grayBtn");
		$("#statusText").text("保存中...");
		var hides = ["offlineStatus", "successStatus"];
		hideStatus(hides);
		showInfo("errorInfo");
		return;
	}
	var speechcraftFlowPO = {
		"speechcraftId" : speechcraftId,
		"speechcraftName" : speechcraftName,
		"flowType" : flowType,
		"flowContent":$.utils.inheritIntentionLevel(getFlowContent())
	};

	if(flowId != null){
		speechcraftFlowPO.id = flowId;
	}
	$.ajax({
		type : "POST",
		url : baseHost +"/services/speechcraft/saveSpeechcraftFlow.json",
		dataType : "json",
		contentType : "application/json",
		data : JSON.stringify(speechcraftFlowPO),
		success : function(data) {
			if(!isApprove){
				$.utils._dialogVue.fullScreenLoading.close();
			}
			if (data.resultMessageEnum == "0000") {
				_flowContent = getFlowContent();
				if(isApprove){
					approve();
				} else {
					$.utils.tooltip('保存成功','success');
				}
				// 显示保存成功信息（保存于 XXX时间）
				showSuccessInfo();
				if (successCallback) {
                    successCallback();
				}
			} else if(data.resultMessageEnum == "0001"){
				$.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
				/*showErrorInfo();*/
				if (failCallback) {
                    failCallback();
				}
			}
		},
		error: function(){
			showInfo("errorInfo");
		}
	});
}
/**
 * 显示保存成功信息：保存于 XX：XX：XX
 * @returns
 */
function showSuccessInfo(){
	var now = new Date();
	var hours = now.getHours();
	hours = hours < 10 ? "0"+hours : hours;
	var minutes = now.getMinutes();
	minutes = minutes < 10 ? "0"+minutes : minutes;
	var seconds = now.getSeconds();
	seconds = seconds < 10 ? "0"+seconds : seconds;
	var timeStr = hours+":"+minutes+":"+ seconds;
	$("#saveTime").text("保存于 "+timeStr);
	$("#successStatus").show();
	isChange = false;
}
/**
 * 显示错误信息
 * @returns
 */
function showInfo(eId){
	if(eId === 'errorInfo'){
		var hides = ["successStatus", "offlineStatus"];
		hideStatus(hides);
		$("#errorStatus").show();
	}
	$("#"+eId).fadeIn(speed);
	$("#"+eId).fadeOut(speed);
}
/**
 * 隐藏指定的元素列表
 * @param eIds 元素id列表
 * @returns
 */
function hideStatus(eIds){
	if(eIds && eIds.length > 0){
		for(var i=0; i < eIds.length; i++){
			$("#"+eIds[i]).hide();
		}
	}
}
/**
 * 显示流程图
 *
 * @param xml
 * @returns
 */
function showFlowDiagram(xml){
	var xmlDoc = mxUtils.parseXml(xml);
	if (typeof xml === 'undefined' || xml === '') {
		xmlDoc = mxUtils.parseXml(_defaultFlowDiagram);
	}
	else {
		xmlDoc = mxUtils.parseXml(xml);
	}
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
	return xml;
}

/**
 * 显示使用音频对话
 * @returns
 */
function showUploadRecordDialog(){
	window.open(baseHost + '/flow/sound.html','_blank');
}
/**
 * 获取录音文件URL
 * @param {*} title
 */
function getRecordUrl(title){
	var sReturn = '';
	$.utils._speechcraftContent[$.utils._flowTypeName].forEach((elem,index) => {
		if(elem.name === $.utils._dialogVue.editRecordTabsName){
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
	updateModel(currentCell); // 更新mxModel
	if(viewType === '1' && _flowContent !== getFlowContent()){
		$.utils._dialogVue.exitText = '您还没有保存话术，确定要退出吗？';
		$.utils._dialogVue.exitVisible = true;
	} else {
		//$.utils._dialogVue.exitText = '您确定退出当前话术编辑吗？';
		//$.utils._dialogVue.exitVisible = true;
		window.location.href = frontHost + '/index.html#/speech';
	}
}
/**
 * 显示提交审批对话框
 */
function showApproveDialog(){
	updateModel(currentCell); // 更新mxModel

    const flowContent = window.getFlowContent();
    const x2js = new X2JS();
    const jsonObj = x2js.xml_str2json(flowContent);

    if (
        jsonObj.mxGraphModel &&
        jsonObj.mxGraphModel.root &&
        jsonObj.mxGraphModel.root.Answer
    ) {
    	let Answer = jsonObj.mxGraphModel.root.Answer;
        let errorMessage = '';
        if (!Array.isArray(Answer)) {
            Answer = [Answer];
		}

        Answer.forEach(answer => {
            if (!answer._intentionId && !answer._keywords) {
                console.log(answer);
                errorMessage += `[${answer._label || '客户意图'}] 必须要有意图模板或意图预料<br>`;
            }
        });

        if (errorMessage) {
            let _vue = new Vue({});
            _vue.$message.error({
                dangerouslyUseHTMLString: true,
                message: errorMessage,
            });
            return;
        }
    }

	if(_flowContent !== flowContent){
		$.utils._dialogVue.approveVisible = true;
	} else {
		approve();
	}
}

/**
 * 提交审批
 */
function approve(){
	if (this.hasSensitiveWord()){
		return false;
	}
	$.utils._dialogVue.openFullScreenLoading('提交审核中');
	let data = {
		speechcraftId : speechcraftId,
		flowType: flowType
	};
	$.ajax({
		type : "POST",
		url : baseHost + "/services/speechcraft/applySpeechcraft.json?speechcraftId="+speechcraftId+"&flowType="+flowType,
		dataType : "json",
		contentType : 'application/json'
	}).then((res) => {
			$.utils._dialogVue.fullScreenLoading.close();
			if (res.resultMessageEnum == "0000") {
				$.utils.tooltip('提交成功','success');
				setTimeout(() => {
					window.location.href = frontHost + '/index.html#/speech';
				}, 1*1000);
			} else if(res.resultMessageEnum == "0001"){
				$.utils.tooltip($.utils.getErrorMessage(res.errorInfoList),'error');
			}
	});
}

function addZero(val){
	if(val){
		return val = val <10?`0${val}`:val;
	}else{
		return '00';
	}
}

/**
 * 显示知识库设置对话框
 */
function showKnowledgeDialog(){
	updateModel(currentCell); // 更新mxModel
	$.utils._dialogVue.queryKnowledgeGroupList();
	$.utils._dialogVue.querySpeechcraftDetail();
	$.utils._dialogVue.knowledgeVisible = true;
}

/**
 * 显示意图分级对话框
 */
function showLevelDialog(){
	updateModel(currentCell); // 更新mxModel
	// 初始化意图分级
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
					if (typeof returnObject.intentionLevelDescription != 'undefined' && returnObject.intentionLevelDescription != null && returnObject.intentionLevelDescription != '') {
						$.utils._dialogVue.intentLevelForm = JSON.parse(returnObject.intentionLevelDescription);
					}
				}
			}
		}
	});
	$.utils._dialogVue.intentLevelVisible = true;
}

/**
 * 显示话术设置对话框
 */
function showSettingDialog(){
	updateModel(currentCell); // 更新mxModel
	$.utils._dialogVue.speechForm.speechcraftName = speechcraftName;
	$.utils._dialogVue.querySpeechcraftDetail();
	$.utils._dialogVue.dialogSpeechSettingVisible = true;
}

/**
 * 显示保存话术对话框
 */
function showSaveDialog(){
	updateModel(currentCell); // 更新mxModel
	if(speechcraftStatus === 5){
		$.utils._dialogVue.saveVisible = true;
	} else {
		save(false);
	}
}

//是否有非法敏感词
function hasSensitiveWord() {
    var highlight  = new mxCellHighlight(graph, '#ff0000', 2);
   	$.utils.highlight = highlight;
	let ishassensitiveWord = false;
    $.ajax({
        type : "POST",
        url : baseHost +"/services/sensitive/getSensitiveWordList.json",
        dataType : "json",
        contentType : "application/json",
		async:false,
        success : function(data) {
            if (data.resultMessageEnum == "0000") {
            	var sensitiveWordList = data.returnObject;
                var allCells = mxEditor.graph.getModel().cells
                var sensitiveWordArr = []
				var highlightArr = []
				for(var i in allCells){
                	let content = allCells[i].value.outerHTML
					for (var j in sensitiveWordList){
                		let words = sensitiveWordList[j];
                        if (content.indexOf(words)!= -1){
                            ishassensitiveWord = true
                            highlightArr.push(allCells[i].id)
                            sensitiveWordArr.push(words)
						}
					}
				}
                highlightArr = highlightArr.filter(function(element,index,self){
                    return self.indexOf(element) === index;
                })

				for (var i in allCells){
					if (highlightArr.indexOf(allCells[i].id) >=0){
                        var highlight  = new mxCellHighlight(graph, '#ff0000', 2);
                        $.utils.highlight[allCells[i].id] = highlight
                        highlight.highlight(graph.view.getState(allCells[i]));
					}
				}
				console.log( $.utils.highlight)
                sensitiveWordArr = sensitiveWordArr.filter(function(element,index,self){
                    return self.indexOf(element) === index;
                })
				if (ishassensitiveWord){
                    $.utils._dialogVue.sensitiveWord = sensitiveWordArr.join();
                    $.utils._dialogVue.dialogSensitiveWordVisible = true;
				}else {
                    /*approve();*/
				}
            }else {
                $.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
			}
        },
        error: function(){
            showInfo("errorInfo");
        }
    });
    return ishassensitiveWord;
}

$('html').niceScroll({cursorcolor: '#CCC',cursorborder:'0px',zindex:999});