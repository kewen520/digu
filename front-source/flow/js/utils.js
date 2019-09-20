// 默认流程图
const _defaultFlowDiagram = "<mxGraphModel><root><Workflow label='MyWorkflow' description='' href='' flowId='' id='0'><mxCell/></Workflow><Layer label='Default Layer' id='1'><mxCell parent='0'/></Layer><Start label='开场白' nodeType='start' speechcraft='' intentionLevel='F' isAllow='false' artificialIntention='' isSkip='false' isEXCSkip='false' excSkipNode='' id='2'><mxCell style='start;' vertex='1' parent='1'><mxGeometry x='680' y='20' width='70' height='30' as='geometry'/></mxCell></Start></root></mxGraphModel>";
// 话术轮数
const _speechRound = 5;
// 阿拉伯数字汉子对应关系
const _chnNumChar =
    {
        1:'一',
        2:'二',
        3:'三',
        4:'四',
        5:'五',
        6:'六',
        7:'七',
        8:'八',
        9:'九',
        10:'十'
    };
// 意向级别可选项
const _defaultIntentionLevelOptions = '意图分类级别可以帮助您对对话术模板中的每个意图进行标记并归类，便于话术流程管理。';
const _intentionLevelOptions =
    [
        {
            value: 'A',
            label: 'A',
            description:'立即还款'
        }, {
        value: 'B',
        label: 'B',
        description:'不清楚'
    }, {
        value: 'C',
        label: 'C',
        description:'是本人、不还款'
    }, {
        value: 'D',
        label: 'D',
        description:'能否还款后所有横行意图中异常、静默、复述挂断'
    }, {
        value: 'E',
        label: 'E',
        description:'非本人、以及能否还款前一轮的意图'
    }, {
        value: 'F',
        label: 'F',
        description:'未接通、开场白就主动挂断'
    }
    ];
var currentIntentionLevelOptions = [];

var highlight = {};

var lastV1 = "";
var lastv2 = "";
var lastIndex = [];

(function ($) {
    if (!$.utils) {
        $.extend({utils:{}});
    }

    $.fn.extend({
        disable : function() {
            return $(this).find("*").each(function() {
                    $(this).attr("disabled", "disabled");
                    $(this).addClass('disabled');
                }
            );
        },
        enable : function() {
            return $(this).find("*").each(function() {
                    $(this).removeAttr("disabled");
                    $(this).removeClass('disabled');
                }
            );
        },
        insertArCaret : function(jqobj, html) {
            let sel, range;
            jqobj.focus();
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    var el = document.createElement("div");
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                } else {
                    jqobj.append(html);
                }
            } else if (document.selection && document.selection.type != "Control") {
                document.selection.createRange().pasteHTML(html);
            }
            // 知识库设置
            if ($.utils._dialogVue.knowledgeVisible) {
                richEditor.bindEvent(_style, false);
            }
            // 话术编辑器
            else {
                richEditor.bindEvent(_style, $.utils._speechcraftContentVue.isDisabled);
            }

            return $(this);
        },
    });

    $.extend($.utils, {
        /**
         * 获得URL参数值
         *
         * param:name 参数名称
         */
        getUrlParam: function (name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results == null ? "": decodeURIComponent(results[1]);
        },

        /**
         * 获得意图分类级别描述
         */
        getIntentionLevelDescription: function(intentionLevel) {
            let description = "";
            var Options = _intentionLevelOptions
            if (currentIntentionLevelOptions.length > 0){
                Options = currentIntentionLevelOptions
            }
            Options.forEach((value,index,arr) => {
                if (value.value === intentionLevel) {
                    description = value.description;
                    return false;
                }
            });
            return description;
        },

        /**
         * 获得错误信息
         *
         * @param errorInfoList
         * @returns
         */
        getErrorMessage:function (errorInfoList){
            var errorMessage;
            for (var i = 0; i < errorInfoList.length; i++) {
                if(typeof(errorMessage) == "undefined"){
                    errorMessage = errorInfoList[i].errorMessage;
                } else {
                    errorMessage = errorMessage + '\n' + errorInfoList[i].errorMessage;
                }
            }
            return errorMessage;
        },

        /**
         * 提示框
         *
         * @param type
         * @param text
         */
        tooltip:function (text,type) {
            let _vue = new Vue({});
            text = text + '';
            switch(type)
            {
                case 'success':
                    _vue.$message.success(text);
                    break;
                case 'error':
                    _vue.$message.error(text);
                    break;
                case 'info':
                    _vue.$message.info(text);
                    break;
                case 'warning':
                    _vue.$message.warning(text);
                    break;
            }
        },

        /**
         * 确认框
         *
         * @param type
         * @param text
         */
        confirm:function (text) {
            let _vue = new Vue({});
            _vue.$confirm(text).then(item => {
                console.log('确定');
            }).catch(item => {
                console.log('取消');
            });
        },
        /**
         * String to Boolean.
         */
        convertStr2Bool:function (str) {
            var bReturn = false;
            if (str == "false") {
                bReturn = false;
            } else if (str == "true") {
                bReturn = true;
            }
            return bReturn;
        },

        /**
         *  获取汉字长度
         */
        getByteLen:function (str) {
            var lReturn = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charAt(i);
                if (char.match(/[^\x00-\xff]/ig) != null)
                {
                    lReturn += 2;
                }
                else
                {
                    lReturn += 1;
                }
            }
            return lReturn;
        },


        /**
         * 解析XML
         *
         * @param xmlDoc    xml格式的文档
         * @param nodePath  需要查询的节点路径 （父子关系用空格相隔。eg：mxGraphModel root Start）
         */
        parseXML:function(xml, nodePath) {
            let xmlDoc = $.parseXML(xml);
            let regex = /\[[^\[\]]+\]+/g;
            $(xmlDoc).find(nodePath).each(function() {
                if(typeof($(this).attr("speechcraft")) != 'undefined' && $(this).attr("speechcraft") != ''){
                    let speechcraft = $.parseJSON($(this).attr("speechcraft"));
                    let json = $.parseJSON($(this).attr("speechcraft"));
                    for ( var key in json) {
                        let jsonArr = json[key];
                        jsonArr.forEach(element => {
                            let elemContent = element.content;
                            let arr = elemContent.match(regex);
                            if(null != arr){
                                arr.forEach(elem => {
                                    let e = '©' + elem.substring(1,elem.length-1) + '©';
                                    elemContent = elemContent.replace(elem,e);
                                });
                                element.content = elemContent;
                            }
                        });
                    }
                    xml = xml.replace(JSON.stringify(speechcraft).replace(/\"/g,'&quot;'),JSON.stringify(json).replace(/\"/g,'&quot;'));
                }
            });
            return xml;
        },

        /**
         * 获取意图分类级别
         */
        getIntentionLevel:function(xml, nodeId, nodeName){
            let xmlDoc = $.parseXML(xml);
            let level = '';

            let node = $($(xmlDoc).find(nodeName + '[id="'+ nodeId +'"]')[0]);
            let edgeNode = $.utils.getEdgeNodeByTarget(xml, nodeId);
            let answerNode = $.utils.getAnswerNodeById(xml, edgeNode.attr('source'));
            if (answerNode) {
                level = answerNode.attr('level');
            }

            return level;
        },


        /**
         * 获取当前机器人节点下级意图节点
         */
        getNextAnswerNode:function(xml,nodeId){
            let xmlDoc = $.parseXML(xml);
            let arrReturn = [];

            let targetIds = $.utils.getTargetIdsBySource(xmlDoc,nodeId);
            targetIds.forEach((value,index,arr) => {
                let answerNode = $($(xmlDoc).find('Answer[id="'+ value +'"]')[0]);
                arrReturn.push({nodeId:answerNode.attr("id"),nodeLabel:answerNode.attr("label")});
            });

            return arrReturn;
        },

        /**
         * 根据目标查找连线
         */
        getEdgeNodeByTarget:function(xml, target){
            let xmlDoc = $.parseXML(xml);
            let edgeNode;
            edgeNode = $($(xmlDoc).find('mxCell[target="'+ target +'"]')[0]);
            return edgeNode;
        },

        /**
         * 根据Id查找意图节点
         */
        getAnswerNodeById:function(xml, nodeId){
            let xmlDoc = $.parseXML(xml);
            let answerNode = $($(xmlDoc).find('Answer[id="'+ nodeId +'"]')[0]);
            return answerNode;
        },

        /**
         * 设置机器人节点意图分类级别
         */
        setRobotIntentionLevel:function(xml, answerNode){
            let xmlDoc = $.parseXML(xml);
            let targetId = $($(xmlDoc).find('mxCell[source="'+ answerNode.attr('id') +'"]')[0]).attr('target');
            let robotNode = $($(xmlDoc).find('Robot[id="'+ targetId +'"]')[0]);
            if(robotNode){
                robotNode.attr('intentionLevel',answerNode.attr('level'));
            }
        },

        /**
         * 继承意图分类级别
         */
        inheritIntentionLevel:function(xml){
            let xmlDoc = $.parseXML(xml);
            let level = '';
            $(xmlDoc).find('mxGraphModel root Answer').each((index,value) => {
                $.utils.setRobotIntentionLevel(xml, $(value));
            });
            // XMLDocument串化
            let oSerializer = new XMLSerializer();
            let sXML = oSerializer.serializeToString(xmlDoc);

            return sXML;
        },


        /**
         * 根据源Id查找目标Id
         */
        getTargetIdsBySource:function(xmlDoc, source){
            let targetIds = [];

            $(xmlDoc).find('mxCell[source="'+ source +'"]').each((index,value) => {
                if ($(value).attr("source") === source) {
                    targetIds.push($(value).attr("target"));
                }
            });

            return targetIds;
        },

        /**
         * 解析json
         */
        parseJSON:function(jsonStr){
            let json = $.parseJSON(jsonStr);
            for ( var key in json) {
                let jsonArr = json[key];
                jsonArr.forEach(element => {
                    let elemContent = element.content;
                    let regex = /©[^©]+©/g;
                    let arr = elemContent.match(regex);
                    if(null != arr){
                        arr.forEach(elem => {
                            let e = '[' + elem.substring(1,elem.length-1) + ']';
                            elemContent = elemContent.replace(elem,e);
                        });
                        element.content = elemContent;
                    }
                });
            }
            return json;
        },

        /**
         * 加载Html内容
         */
        loadHTML:function(url){
            let content = '';
            $.ajax({
                url: url,
                cache: false,
                async: false,
                success: function (html) {
                    content = html;
                }
            });
            return content;
        },

        /**
         * 创建可移除标签
         */
        createRemovableTag:function(obj){
            let hReturn = '<span isValid="true" contenteditable="false" class="el-tag" ';
            if (typeof obj.soundDuration != 'undefined') {
                hReturn += ' duration="';
                hReturn += obj.soundDuration;
                hReturn += '"';
            }
            if (typeof obj.soundPath != 'undefined') {
                hReturn += ' path="';
                hReturn += obj.soundPath;
                hReturn += '"';
            }
            if (typeof obj.soundContent != 'undefined') {
                hReturn += ' content="';
                hReturn += obj.soundContent;
                hReturn += '">';
                hReturn += obj.soundContent;
            } else {
                hReturn += '">';
            }
            hReturn += '{';
            if (typeof obj.fileName != 'undefined') {
                hReturn += obj.fileName;
            }
            hReturn += '}';
            hReturn += '<i contenteditable="false" class="el-icon-close"></i>';
            hReturn += '</span>&nbsp;';
            return hReturn;
        },

        /**
         * 处理话术内容。按照[xxx]、[]分割
         * @param content 话术内容
         * @returns
         */
        handleSpeech:function(content){
            var sReturn = [];

            // 正则表达式
            var regex = /\[[^\]]*\]+/g;
            // 按照指定的正则把字符串分割为字符串数组
            let arr = content.split(regex);
            // 过滤数组中的空字符串项
            sReturn = arr.filter(elem => elem);

            return sReturn;
        },
        //是否有下一级的节点
        hasChildNodeInfo(cell){
            if (typeof cell === 'undefined') {
                return false;
            }
            let arr = [cell.id]
            let out_cells = {}
            let _all_cells = graph.getModel().cells
            for (let ii in  _all_cells){
                for (let _ai in _all_cells){
                    let _item = _all_cells[_ai]
                    let _item_cells = _all_cells[_ai].edges
                    //如果当前节点的ID在列表里面,添加当前节点到out_cells
                    if($.inArray(_item.id,arr) >=0){
                        out_cells[_item.id] = _item
                        //如果当前节点的cells不为空，把当前cell 放到out_cells 并且把target.id放到arr里面
                        if (_item_cells !=null &&  _item_cells.length > 0){
                            for (let _ci in _item_cells){
                                out_cells[_item_cells[_ci].id] = _item_cells[_ci]
                                arr.push(_item_cells[_ci].target.id)
                            }
                        }
                    }
                }
            }
            let re = {}
            //arr去重复
            var r = arr.filter(function(element,index,self){
                return self.indexOf(element) === index;
            })
            let out_cells_count = 0
            for (let i in out_cells){
                out_cells_count += 1;
            }
            re.arr = r
            re.outCells = out_cells
            re.outCellsCount = out_cells_count
            if (re.outCellsCount > 0 ){
                return re
            }
            return false;
        },
        //获取当前选择的节点
        getLastCells(){
            let _cel;
            if (graph.getSelectionCell() != null){
                _cel = graph.getSelectionCell()
            }
            if (graph.lastTouchCell != null){
                _cel = graph.lastTouchCell
            }

            return _cel;
        },
        //更改按钮
        changeCellRobotToEnd(cell){
            //获取当前cell下所有的线
            let edgs = cell.edges
            //当前cell的ID
            let cellId = cell.id
            //指向当前cell的sourceCell
            let sourceCell;
            //获取当前cell的位置
            let x = cell.geometry.x
            let y = cell.geometry.y
            if (edgs != null){
                for (let i in edgs){
                    if (edgs[i].target.id == cellId){
                        sourceCell = edgs[i].source
                    }
                }
            }
            //默认值
            let spc = JSON.stringify($.utils._speechcraftContent)
            //	新建一个end按钮
            parent =  graph.getDefaultParent()
            var doc = mxUtils.createXmlDocument();
            var node = doc.createElement('End')
            node.setAttribute('label', '结束语');
            node.setAttribute('nodeType', 'end');
            node.setAttribute('speechcraft', spc);
            node.setAttribute('intentionLevel', '');
            node.setAttribute('isAllow', 'false');
            node.setAttribute('isEnd', 'true');
            node.setAttribute('artificialIntention', '');
            let v1 =graph.insertVertex(parent,null,node,x+15,y,70,30,mxEditor.templates.end.style);
            graph.insertEdge(parent,null,mxEditor.templates.edge.value,sourceCell,v1,"straightEdge")
            return v1;
        },

        changeCellEndTorobot(cell){
            //获取当前cell下所有的线
            let edgs = cell.edges
            //当前cell的ID
            let cellId = cell.id
            //指向当前cell的sourceCell
            let sourceCell;
            //获取当前cell的位置
            let x = cell.geometry.x
            let y = cell.geometry.y
            if (edgs != null){
                for (let i in edgs){
                    if (edgs[i].target.id == cellId){
                        sourceCell = edgs[i].source
                    }
                }
            }
            //默认值
            let spc = JSON.stringify($.utils._speechcraftContent)
            //	新建一个end按钮
            parent =  graph.getDefaultParent()
            var doc = mxUtils.createXmlDocument();
            var node = doc.createElement('Robot')
            node.setAttribute('label', '机器人话术');
            node.setAttribute('nodeType', 'robot');
            node.setAttribute('speechcraft', spc);
            node.setAttribute('intentionLevel', '');
            node.setAttribute('isAllow', 'false');
            node.setAttribute('isInterrupt', 'true');
            node.setAttribute('isSkip', 'false');
            node.setAttribute('isEnd', 'false');
            node.setAttribute('isEXCSkip', 'false');
            node.setAttribute('artificialIntention', '');
            node.setAttribute('excSkipNode', '');
            let v1 =graph.insertVertex(parent,null,node,x-30,y+100,100,30,"robot");
            graph.insertEdge(parent,null,mxEditor.templates.edge.value,sourceCell,v1,"straightEdge")
            return v1;
        },

        /**
         * 获取节点所有下级节点
         *
         * @param cell
         * @param childrenCells
         */
        getChildrenCells(childrenCells,cell){
            let cellEdges = cell.edges;
            for (let i in cellEdges){
                if (cellEdges[i].target != null && cellEdges[i].target.id != cell.id) {
                    childrenCells.push($.utils.getChildrenCells(childrenCells,cellEdges[i].target));
                }
            }
            return cell
        },

        /**
         * 获取节点所有下游节点
         * @param ids
         * @param cells
         */
        getCellsChildren(ids,cells){
            ids.push(cells.id);
            let cellsEdges = cells.edges
            for (let i in cellsEdges){
                if (cellsEdges[i].source !== null && cells.id === cellsEdges[i].source.id){
                    $.utils.getCellsChildren(ids,cellsEdges[i].target);
                }
            }
        },
        /**
         * 获取当前的所有节点，除去开场白,还有自己
         * @param exSelf 是否除去自己
         * @returns {Array}
         */
        getACellsExStart(exSelf = true){

            let _lastCells = this.getLastCells()
            let _allCells = graph.getModel().cells
            let _filterArr = ["End","Robot",]
            let _filterId = []
            let _result = []
            $.utils.getCellsChildren(_filterId,_lastCells);
            for (var i in _allCells){
                let item = _allCells[i]
                //所有节点name 在_filterArr and 节点ID 不在 _filterId
                if ($.inArray(item.value.nodeName,_filterArr) >= 0 && $.inArray(item.id,_filterId) < 0){
                    let addItem = {
                        value:item.id,
                        cell:item,
                        nodeName:item.value.nodeName,
                        label:item.value.attributes.label.nodeValue
                    }
                    _result.push(addItem)
                }
            }

            return _result
        },

        getCellByNodeId(id){
            let _allCells = graph.getModel().cells;
            for (let i in _allCells){
                let item = _allCells[i];
                //所有节点name 在_filterArr and 节点ID 不在 _filterId
                if (item.id === id){
                    return item;
                }
            }
        },
        // 当前流程类型名称
        _flowTypeName:'main',
        // 话术内容
        _speechcraftContent :	{
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
        },
        //  意向筛选节点、转人工等复选框列表。此列表与节点属性必须对应
        _checkList:[],
        // 已选列表
        _checkedList:[],
        // 已选意向级别
        _intentionLevel:'',
        // 异常跳转相关
        _EXCSkipVisible:false,
        _EXCSkipOptions:[],
        _excSkipNode:'',
        // 话术内容Vue实例
        _speechcraftContentVue:null,
        // 话术内容Vue实例
        createSpeechcraftContentVue:function(){
            $.utils._dialogVue.editRecordTabs = $.utils._speechcraftContent;
            return new Vue({
                el: '#_speechcraftContent',
                data: {
                    title:'',
                    // 当前流程分类名称
                    flowTypeName:'main',
                    // 当前流程的话术内容
                    editableTabs: $.utils._speechcraftContent.main,
                    // 当前话术内容名称
                    editableTabsName: 1,
                    maxTabName: $.utils._speechcraftContent.main[$.utils._speechcraftContent.main.length - 1].name,
                    checkedList:$.utils._checkedList,
                    checkList:$.utils._checkList,
                    intentionLevel:$.utils._intentionLevel,
                    intentionLevelOptions: _intentionLevelOptions,
                    intentionLevelVisible:false,
                    isDisabled: false,
                    // 异常跳转相关
                    EXCSkipVisible:$.utils._EXCSkipVisible,
                    EXCSkipOptions:$.utils._EXCSkipOptions,
                    excSkipNode:$.utils._excSkipNode,
                    // 允许转人工相关
                    isGlobalArtificial:$.utils._dialogVue.speechForm.isArtificial,
                },
                created(){
                    this.tabClick();
                    this.initEditor();
                },
                methods:{
                    // 初始化富文本编辑器
                    initEditor(){
                        this.$nextTick(function() {
                            $.utils._speechcraftContent[this.flowTypeName].forEach((elem) => {
                                if(elem.name === this.editableTabsName){
                                    let id = '_' + this.flowTypeName + '-' + this.editableTabsName;
                                    if (this.flowTypeName === 'exception'){
                                        new richEditor(id, _style, elem.content, this.isDisabled || this.EXCSkipVisible);
                                    } else {
                                        new richEditor(id, _style, elem.content, this.isDisabled);
                                    }
                                }
                            });
                        });
                    },
                    disable(){
                        if (viewType == null || viewType == "" || viewType == "0") {
                            this.isDisabled = true;
                            this.$nextTick(function(){
                                $("a").removeAttr('href');
                                $("a").removeAttr('onclick');
                                $("input[type='text'],textarea").attr('disabled','disabled');
                                $("input[type='text'],textarea").addClass('disabled');
                            });
                        }
                    },
                    tabClick() {
                        $.utils._flowTypeName = this.flowTypeName;
                        let activeEditableTab = $.utils._speechcraftContent[$.utils._flowTypeName];
                        this.editableTabsName = 1;
                        this.editableTabs = activeEditableTab;
                        this.maxTabName = activeEditableTab[activeEditableTab.length - 1].name,
                            $.utils._dialogVue.editRecordTabsName = 1,
                            $.utils._dialogVue.editRecordTabs = activeEditableTab;
                        $.utils._dialogVue.recordData = activeEditableTab[0].recordData;
                        this.disable();
                        this.initEditor();
                    },
                    speechTabClick() {
                        $.utils._dialogVue.editRecordTabsName = this.editableTabsName;
                        this.disable();
                        this.initEditor();
                    },
                    unlockSpeechCont: function(){
                        $.utils._speechcraftContent[this.flowTypeName].forEach((elem) => {
                            if(elem.name === this.editableTabsName){
                                /* let recordData = elem.recordData;
                                recordData.forEach((data) => {
                                    if (data.title === elem.content) {
                                        recordData = recordData.splice(data,1);
                                    }
                                });
                                elem.content = '';*/
                                elem.recordData = [];
                                elem.isLocked = false;
                                elem.viewCont = elem.content;
                                $('#_' + this.flowTypeName + '-' + this.editableTabsName).removeAttr('disabled');
                                $('#_' + this.flowTypeName + '-' + this.editableTabsName).parent().removeClass('is-disabled');
                            }
                        });
                    },
                    handleTabsEdit(targetName, action) {
                        if (action === 'add') {
                            let editableTabsLength = this.editableTabs.length;
                            let tabTitle = '';
                            let tabContent = '';
                            let recordData =[];
                            if(editableTabsLength < _speechRound){
                                let newTabName = ++ this.maxTabName;
                                tabTitle = _chnNumChar[newTabName] + '轮话术';
                                this.editableTabs.push({
                                    title: tabTitle,
                                    name: newTabName,
                                    content: tabContent,
                                    isLocked:false,
                                    recordData: []
                                });
                                this.editableTabsName = newTabName;
                            }
                            $.utils._speechcraftContent[$.utils._flowTypeName] = this.editableTabs;
                            $.utils._dialogVue.editRecordTabs = this.editableTabs;
                            this.disable();
                            this.initEditor();
                        }
                        if (action === 'remove') {
                            if(targetName === 1 || targetName !== this.maxTabName){
                                return false;
                            }
                            let tabs = this.editableTabs;
                            let activeName = this.editableTabsName;
                            if (activeName === targetName) {
                                tabs.forEach((tab, index) => {
                                    if (tab.name === targetName) {
                                        let nextTab = tabs[index + 1] || tabs[index - 1];
                                        if (nextTab) {
                                            activeName = nextTab.name;
                                        }
                                    }
                                });
                            }
                            tabs.forEach((tab, index) => {
                                if (tab.name === targetName) {
                                    let nextTab = tabs[index + 1] || tabs[index - 1];
                                    if (nextTab) {
                                        this.maxTabName = nextTab.name;
                                    }
                                }
                            });
                            this.editableTabsName = activeName;
                            this.editableTabs = tabs.filter(tab => tab.name !== targetName);
                            $.utils._speechcraftContent[$.utils._flowTypeName] = this.editableTabs;
                            $.utils._dialogVue.editRecordTabs = this.editableTabs;
                            this.disable();
                            this.initEditor();
                        }
                    },
                    checkItemChange(item,checked){
                        if (item === 'isEnd') {
                            if (checked){
                                $.utils._dialogVue.dialogVisibleChild = true;
                            }else {
                                let lastCell = $.utils.getLastCells();
                                if (lastCell.style == "robot"){
                                    lastCell = $.utils.lastV1
                                }
                                let cellsChildInfo = $.utils.hasChildNodeInfo(lastCell)
                                let delCells = [];
                                for (let i in cellsChildInfo.outCells){
                                    delCells.push(cellsChildInfo.outCells[i])
                                }
                                let v1 = $.utils.changeCellEndTorobot(lastCell)
                                graph.removeCells(delCells)
                                //关闭弹窗
                                mxEditor.hideProperties()
                                setTimeout(function () {
                                    mxEditor.execute("showProperties",v1);
                                },50,mxEditor,v1)
                                $.utils.lastv2 = v1
                            }
                        }
                        if (item === 'isInterrupt' && !checked){
                            $.utils._dialogVue.speechForm.isInterrupt = false;
                            $.utils._dialogVue.setting('speechForm',false);
                        }
                    },
                    checkListChange(val){
                        $.utils._checkedList = val;

                        if($.inArray('isEXCSkip',$.utils._checkedList) >= 0){
                            this.EXCSkipVisible = true;
                            if ($.utils._EXCSkipOptions.length === 1) {
                                this.excSkipNode = $.utils._EXCSkipOptions[0].nodeId;
                            }
                            if (this.flowTypeName === 'exception') {
                                $.utils._speechcraftContent[this.flowTypeName].forEach((elem) => {
                                    if (elem.name === this.editableTabsName) {
                                        let id = '_' + this.flowTypeName + '-' + this.editableTabsName;
                                        $('#' + id + '>div').attr('contenteditable', false);
                                        $('#' + id + '>div').addClass(_style + '-disabled');
                                    }
                                });
                            }
                        } else {
                            this.EXCSkipVisible = false;
                            this.excSkipNode = '';
                            $.utils._excSkipNode = '';
                            if (this.flowTypeName === 'exception') {
                                $.utils._speechcraftContent[this.flowTypeName].forEach((elem) => {
                                    if (elem.name === this.editableTabsName) {
                                        let id = '_' + this.flowTypeName + '-' + this.editableTabsName;
                                        $('#' + id + '>div').attr('contenteditable', true);
                                        $('#' + id + '>div').removeClass(_style + '-disabled');
                                    }
                                });
                            }
                        }
                    },
                    createVideoPlayTest(){
                        //第几轮话术this.editableTabsName
                        let activeEditableTab = $.utils._speechcraftContent[$.utils._flowTypeName];
                        let editableTabsName = this.editableTabsName
                        let currentContent = "";
                        if (activeEditableTab.length<=0){
                            this.$message.error("数据错误！");
                            return;
                        }
                        activeEditableTab.forEach((element)=>{
                            if (element.name == editableTabsName){
                                currentContent = element.content;
                            }
                        })
                        //
                        if (currentContent.length <=0){
                            this.$message.error("没有任何信息不能试听");
                            return;
                        }
                        //解析当前的编辑器内容
                        let currentContentArr = currentContent.split("<");
                        let data = {}
                        data.audios = []
                        data.isAudit = 0
                        let inputTextArr = []
                        var showInnerHtml = '<div style=\'float:left;\'>'
                        currentContentArr.forEach((elements) => {
                            let pathIndex = elements.indexOf("path=");
                            let contentIndex = elements.indexOf("content=");
                            let splitArr = elements.split(">")
                            let _text = "";
                            let _url = "";
                            let item = {}
                            if (pathIndex!="-1" && contentIndex!="-1"){
                                let contentIndexEnd = elements.indexOf(">");
                                _url = elements.slice(pathIndex+6,contentIndex-2)
                                _text = elements.slice(contentIndex+9,contentIndexEnd-1);
                                _text = _text.replace(/&nbsp;/g,'');
                                item.url = _url;
                                item.text = _text;
                                data.audios.push(item)
                                showInnerHtml += _text
                            }else if (splitArr.length == 2 && splitArr[1]!="" && splitArr[1]!="&nbsp"
                                && splitArr[1].indexOf(".wav}") == -1
                                && splitArr[1].indexOf(".mp4}") == -1
                                && splitArr[1].indexOf(".mp3}") == -1
                            ){
                                _text = splitArr[1]
                                _text = _text.replace(/&nbsp;/g,'');
                                let leftKH = _text.split('[')
                                let rightKH = _text.split("]")
                                if (leftKH.length != rightKH.length){
                                    this.$message.error("变量的括号没有匹配成功,请检查括号是否一一对应");
                                    return;
                                }
                                //组装innerHtml
                                leftKH.forEach((el)=>{
                                    let leftKHSplit = [];
                                    leftKHSplit = el.split("]")
                                    if (leftKHSplit.length == 2){
                                        inputTextArr.push(leftKHSplit[0])
                                        let inputStr = '['+leftKHSplit[0]+']'+'<input type="text" placeholder="输入变量值" id="'+leftKHSplit[0]+'" value="">';
                                        showInnerHtml += inputStr + leftKHSplit[1];
                                    }else {
                                        showInnerHtml += el
                                    }
                                });
                                item.text = _text;
                                data.audios.push(item)
                            }
                        });
                        showInnerHtml +="</div>";
                        $.utils._dialogVue.videoVisible = true
                        $.utils._dialogVue.$nextTick(() => {
                            document.getElementById("testVideoHtml").innerHTML=showInnerHtml;
                        });
                        $.utils._dialogVue.splitAuditionArr =  inputTextArr;
                        $.utils._dialogVue.splitAuditionData = data
                    }

                }
            })
        },

        // 对话Vue实例
        _dialogVue:null,
        // 创建对话Vue实例
        createDialogVue:function(){
            return new Vue({
                el: '#_dialog',
                data: {
                    // 上传录音相关
                    dialogRecordVisible:false,
                    editRecordTabsName:1,
                    editRecordTabs:$.utils._speechcraftContent.main,
                    recordData:$.utils._speechcraftContent.main.recordData,
                    // 话术设置相关
                    dialogSpeechSettingVisible:false,
                    formLabelWidth:'80px',
                    speechForm:{
                        speechcraftName:'',
                        speechcraftType: '',
                        appKey: '',
                        industryName:'',
                        usedKnowledge:[],
                        isInterrupt:false,
                        isArtificial:false,
                        artificialIntention: '',
                    },
                    settingSpeechRules: {
                        speechcraftName:[
                            { required: true, message: '请输入话术名称'},
                        ]
                    },
                    speechRegion:[],
                    // 试拨相关
                    dialogDialVisible:false,
                    dialRadioInput:false,
                    dialForm:{
                        region:'',
                        resource:'',
                        iphone:''
                    },
                    // 在线试拨相关
                    dialogOnlineVisible:false,

                    // 错误提示相关
                    dialogErrorVisible:false,

                    // 退出提示
                    exitVisible:false,
                    exitText:'您确定退出当前话术编辑吗？',

                    // 保存提示
                    saveVisible:false,
                    saveText:'话术保存后，需重新提交审核。关联任务将全部失效，请确认是否保存？',

                    // 提交审批提示
                    approveVisible:false,
                    approveText:'您刚刚编辑的话术未保存，是否保存并提交审核？',

                    // 话术试听
                    videoVisible:false,
                    viewSource:'',
                    viewPlayValue:0,
                    videoPlay:true,
                    currentMusic:{
                        duration:0,
                        currentTime:0
                    },

                    // 话术内容库相关
                    /* dialogSpeechContLibVisible:false,
                    height:450,
                    speechContLibData:[],
                    speechTypeMenu:[],
                    itemActive:0, */

                    // 意图分类级别描述相关
                    intentLevelVisible:false,
                    intentLevelDesc:'',
                    intentLevelFormLabelWidth:'30px',
                    intentLevelForm:{
                        'A':{'initDescription':'', 'memberDescription':''},
                        'B':{'initDescription':'', 'memberDescription':''},
                        'C':{'initDescription':'', 'memberDescription':''},
                        'D':{'initDescription':'', 'memberDescription':''},
                        'E':{'initDescription':'', 'memberDescription':''},
                        'F':{'initDescription':'', 'memberDescription':''}
                    },

                    // 知识库设置相关
                    knowledgeList:[],
                    knowledgeVisible:false,
                    knowledgeFormLabelWidth:'100px',
                    knowledgeForm:{
                        useKnowledgeFlag:0,
                        knowledge:[],
                        singleAskedLimit:1,
                        hungupSpeechcraftContent:'',
                    },

                    isDisabled:false,
                    // 加载相关
                    fullScreenLoading:null,
                    dialogVisibleChild:false,
                    //异常跳转
                    dialogExceptionVisible:false,
                    removeCellTypeName:"",
                    dialogExceptionCellTarget:[],
                    dialogExceptionCellTargetNew:[],
                    // 转人工相关
                    artificialIntentionOptions: [
                        {id: 1, value: 'main', label:'正常'},
                        {id: 2, value: 'quiet', label:'静默'},
                        {id: 3, value: 'exception', label:'异常'},
                        {id: 4, value: 'retell', label:'复述'}
                    ],
                    // 打断相关
                    interruptVisible:false,
                    interruptChangeText:'',
                    //敏感词
                    dialogSensitiveWordVisible:false,
                    sensitiveWord:"",

                    //话术试听
                    splitAuditionArr:[],
                    splitAuditionData:{},
                    delindex:[],

                    dialognoJumpVisible:false,
                    showAppKeyCopyIcon: false,
                },
                created() {
                    this.disable();
                },
                methods:{
                    appKeyCopy(e) {
                        this.$refs['speechFormAppKey'].$refs.input.select();
                        try {
                            const successful = document.execCommand("Copy");
                            if (successful) {
                                this.$message.success(`复制到剪贴板成功`);
                            } else {
                                this.$message.error(`复制到剪贴板失败`);
                            }
                        } catch (err) {
                            this.$message.error(`复制到剪贴板失败`);
                        }
                    },

                    disable(){
                        if (viewType == null || viewType == "" || viewType == "0") {
                            this.isDisabled = true;
                        }
                    },
                    /**
                     * 保存知识库设置
                     */
                    saveKnowledge(){
                        let commonSpeechcraftVO = {
                            "modifyKnowledgeFlag": true,
                            "id" : speechcraftId,
                            "useKnowledgeFlag":this.knowledgeForm.useKnowledgeFlag,
                            "knowledgeList" : this.knowledgeForm.knowledge,
                            "singleAskedLimit" : this.knowledgeForm.singleAskedLimit,
                            "hungupSpeechcraftContent" : this.knowledgeForm.hungupSpeechcraftContent,
                        };
                        $.ajax({
                            type : "POST",
                            url : baseHost + "/services/speechcraft/modifySpeechcraft.json",
                            dataType : "json",
                            contentType : "application/json",
                            data : JSON.stringify(commonSpeechcraftVO),
                            async: false,
                        }).then((data) => {
                            if (data.resultMessageEnum == "0000") {
                                $.utils._dialogVue.knowledgeVisible = false;
                                $.utils.tooltip('保存成功！','success');
                            } else if(data.resultMessageEnum == "0001"){
                                $.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
                            }
                        });
                    },
                    /**
                     * 初始化挂机话术内容编辑器
                     */
                    initHungupSpeechcraftEditor(){
                        this.$nextTick(() => {
                            new richEditor('hungup-speechcraft-content', _style, this.knowledgeForm.hungupSpeechcraftContent, this.isDisabled);
                        });
                    },
                    /**
                     * 改变使用知识库状态
                     */
                    changeUseKnowledge(){
                        if (this.knowledgeForm.useKnowledgeFlag === 1) {
                            this.initHungupSpeechcraftEditor();
                        }else if (this.knowledgeForm.useKnowledgeFlag === 0) {
                            if (!this.isDisabled) {
                                this.knowledgeForm.knowledge = [];
                                this.knowledgeForm.singleAskedLimit = 1;
                                this.knowledgeForm.hungupSpeechcraftContent = '';
                            }
                        }
                    },
                    /**
                     * 查询话术详情
                     */
                    querySpeechcraftDetail(){
                        let speechcraftTypeList = [];
                        $.post(`${baseHost}/services/scheme/querySchemeList.json`).then(res => {
                            if (res.resultMessageEnum === "0000") {
                                speechcraftTypeList = res.returnObject;
                            }
                            return $.ajax({
                                type : "GET",
                                url : baseHost + '/services/speechcraft/querySpeechcraftDetail.json?speechcraftId=' + speechcraftId,
                                dataType : "json",
                                contentType : "application/json",
                                async: false,
                            })
                        }).then(res => {
                            if (res.resultMessageEnum === "0000") {
                                let data = res.returnObject;
                                let knowledgeList = data.knowledgeList;
                                const speechcraftTypeItem = speechcraftTypeList
                                    .filter(item => parseInt(item.schemeType) === data.speechcraftType);

                                $.utils._dialogVue.speechForm.industryName = data.industryName;
                                $.utils._dialogVue.speechForm.speechcraftType = speechcraftTypeItem[0]
                                    ? speechcraftTypeItem[0]['schemeName']
                                    : '';
                                $.utils._dialogVue.speechForm.appKey = data.nluAppKey || '暂无appKey';
                                $.utils._dialogVue.knowledgeForm.useKnowledgeFlag = data.useKnowledgeFlag;

                                if (data.useKnowledgeFlag === 1) {
                                    $.utils._dialogVue.knowledgeForm.singleAskedLimit = typeof data.singleAskedLimit === 'undefined' ? 1 : data.singleAskedLimit;
                                    $.utils._dialogVue.knowledgeForm.hungupSpeechcraftContent = typeof data.hungupSpeechcraftContent === 'undefined' ? '' : data.hungupSpeechcraftContent;
                                    if($.utils._dialogVue.knowledgeVisible){
                                        $.utils._dialogVue.initHungupSpeechcraftEditor();
                                    }
                                    if(knowledgeList != null){
                                        $.utils._dialogVue.knowledgeForm.knowledge = [];
                                        knowledgeList.forEach((item,index) => {
                                            $.utils._dialogVue.knowledgeForm.knowledge.push({knowledgeGroupId:item.knowledgeGroupId,knowledgeGroupName:item.knowledgeGroupName});
                                        });
                                    }
                                }
                            } else if(res.resultMessageEnum === "0001"){
                                $.utils.tooltip($.utils.getErrorMessage(res.errorInfoList),'error');
                            }
                        });
                    },
                    /**
                     * 查询知识库
                     */
                    queryKnowledgeGroupList(){
                        $.get(baseHost + '/services/knowledge/queryKnowledgeGroupList.json').then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                let data = res.returnObject;
                                if (data != null) {
                                    $.utils._dialogVue.knowledgeList = [];
                                    data.forEach((item,index) => {
                                        $.utils._dialogVue.knowledgeList.push({knowledgeGroupId:item.id,knowledgeGroupName:item.groupName});
                                    });
                                }
                            } else if(res.resultMessageEnum == "0001"){
                                $.utils.tooltip($.utils.getErrorMessage(res.errorInfoList),'error');
                            }
                        })
                    },
                    /**
                     * 查询所属行业
                     */
                    queryAllIndustryList(){
                        $.get(baseHost + '/services/intention/queryAllIndustryList.json').then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                $.utils._dialogVue.speechRegion=res.returnObject;
                            } else if(res.resultMessageEnum == "0001"){
                                $.utils.tooltip($.utils.getErrorMessage(res.errorInfoList),'error');
                            }
                        })
                    },
                    /**
                     * 初始化意图分类级别描述
                     */
                    initDescription(key){
                        if (templateType == 1) {
                            this.intentLevelForm[key].initDescription = '';
                        } else if (templateType == 2) {
                            this.intentLevelForm[key].memberDescription = this.intentLevelForm[key].initDescription;
                        }
                    },
                    /**
                     * 保存意图分类级别描述
                     */
                    saveIntentLevelDesc(){
                        let speechcraftPO = {
                            "id" : speechcraftId,
                            "intentionLevelDescription" : JSON.stringify(this.intentLevelForm)
                        };
                        $.ajax({
                            type : "POST",
                            url: baseHost + '/services/speechcraft/modifyIntentionLevelDescription.json',
                            dataType : "json",
                            contentType : "application/json",
                            data : JSON.stringify(speechcraftPO),
                            async: false,
                        }).then((data) => {
                            if(data.resultMessageEnum=='0000'){
                                $.utils._dialogVue.intentLevelVisible = false;
                                $.utils.tooltip('意图分类级别描述设置成功！','success');
                                //修改之后立刻更新页面数据，不影响展示
                                $.utils.queryCurrentSpeechcraftDetail();
                            }else{
                                $.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error')
                            }
                        });
                    },

                    /**
                     * 设置话术
                     * @param formName
                     * @param flag
                     */
                    setting(formName,flag){
                        this.$refs[formName].validate((valid) => {
                            let speechcraftNameLocal = this.speechForm['speechcraftName'];
                            if (valid) {
                                let commonSpeechcraftVO = {
                                    'modifyKnowledgeFlag': true,
                                    'id': speechcraftId,
                                    'speechcraftName': speechcraftNameLocal,
                                    'isInterrupt':this.speechForm.isInterrupt ? 1 : 0,
                                    'isArtificial': this.speechForm.isArtificial ? 1 : 0,
                                    'artificialIntention':this.speechForm.artificialIntention != '' ? this.speechForm.artificialIntention.join(',') : '',
                                };
                                $.ajax({
                                    type : "POST",
                                    url : baseHost + "/services/speechcraft/modifySpeechcraft.json",
                                    dataType : "json",
                                    contentType : "application/json",
                                    data : JSON.stringify(commonSpeechcraftVO),
                                    async: false,
                                    success : function(data) {
                                        if (data.resultMessageEnum == "0000") {
                                            speechcraftName = speechcraftNameLocal;
                                            $.utils._dialogVue.dialogSpeechSettingVisible = false;
                                            if (flag){
                                                $.utils.tooltip('话术设置成功','success');
                                            }
                                            $('#head .head-title').html(speechcraftName);
                                        } else if(data.resultMessageEnum == "0001"){
                                            $.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
                                        }
                                    }
                                });
                            } else {
                                return false;
                            }
                        });
                    },
                    /**
                     * 处理 页签
                     * @param {*} tab
                     * @param {*} event
                     */
                    handleRecordTabs(tab, event){
                        $.utils._speechcraftContent[$.utils._flowTypeName].forEach((elem,index) => {
                            if(elem.name === this.editRecordTabsName){
                                this.recordData = elem.recordData;
                            }
                        })
                    },
                    /**
                     * 处理上传文件input id
                     */
                    fileId(id){
                        return '_file_' + this.editRecordTabsName + '_' + id;
                    },
                    /**
                     * 上传录音
                     * @param {*} id
                     */
                    uploadRecord(id){
                        let formData = new FormData();
                        let uploadFile = this.$refs.uploadFile;
                        let file = null;
                        uploadFile.forEach((elem,index) => {
                            if(elem.$refs.input.files.length === 1)
                                file = elem.$refs.input.files[0];
                        });
                        formData.append("sourceType", 103);
                        formData.append("file", file);
                        $.ajax({
                            url: baseHost + '/services/common/uploadAnnexFile.json',
                            type: 'POST',
                            cache: false,
                            data: formData,
                            dataType: "json",
                            headers : {'Content-Type':'multipart/form-data'},
                            processData: false,
                            contentType: false,
                            async: false
                        }).then((data) => {
                            if(data.resultMessageEnum=='0000'){
                                $.utils.tooltip('上传成功！','success');
                                // 更新cell属性
                                $.utils._speechcraftContent[$.utils._flowTypeName].forEach((elem,index) => {
                                    if(elem.name === $.utils._dialogVue.editRecordTabsName){
                                        let recordData = $.utils._dialogVue.recordData;
                                        recordData.forEach((item) => {
                                            if(item.id === id){
                                                item.url = data.returnObject;
                                            }
                                        })
                                    }
                                });
                            }else{
                                $.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error')
                            }
                        });
                    },

                    /**
                     * 下载录音
                     * @param {*} id
                     */
                    downloadRecord(id){
                        let filePath = '';
                        $.utils._speechcraftContent[$.utils._flowTypeName].forEach((elem,index) => {
                            if(elem.name === $.utils._dialogVue.editRecordTabsName){
                                let recordData = elem.recordData;
                                recordData.forEach((item) => {
                                    if(item.id === id){
                                        filePath = item.url;
                                    }
                                })
                            }
                        });
                        if(filePath === ''){
                            $.utils.tooltip('您还没有上传录音文件！','warning');
                            return false;
                        }
                        window.location.href = baseHost + '/services/file/downloadFile.html?filePath=' + filePath;
                        $.utils.tooltip('下载成功！','success');
                    },

                    /**
                     * 删除录音
                     * @param {*} id
                     */
                    deleteRecord(id){
                        let flag = false;
                        $.utils._speechcraftContent[$.utils._flowTypeName].forEach((elem,index) => {
                            if(elem.name === $.utils._dialogVue.editRecordTabsName){
                                let recordData = elem.recordData;
                                recordData.forEach((item) => {
                                    if(item.id === id){
                                        if(item.url !== ''){
                                            flag = true;
                                            item.url = '';
                                        }
                                    }
                                })
                            }
                        });
                        if(flag){
                            $.utils.tooltip('删除成功！','success');
                        } else {
                            $.utils.tooltip('您还没有上传录音文件！','warning');
                        }
                    },
                    dialChange(val){
                        if(val==1){
                            this.dialRadioInput = true;
                        }else{
                            this.dialRadioInput = false;
                        }
                    },
                    /**
                     * 退出提示
                     */
                    exit(){
                        this.exitVisible = false;
                        window.location.href = frontHost + '/index.html#/speech';
                    },
                    /**
                     * 保存并退出
                     */
                    saveAndExit(){
                        this.exitVisible = false;
                        save(false);
                        window.location.href = frontHost + '/index.html#/speech';
                    },
                    /**
                     * 保存提示
                     */
                    saveFlow(){
                        this.saveVisible = false;
                        save(false);
                    },
                    /**
                     * 保存并提交审批提示
                     */
                    saveApprove(){
                        this.approveVisible = false;
                        save(true);
                    },
                    /**
                     * 关闭退出对话框
                     */
                    closeExitDialog(){
                        this.exitVisible = false;
                    },
                    /**
                     * 话术试听
                     */
                    handlePlaying(){
                        let self = this
                        if(self.videoPlay){
                            let fullScreenLoadingText = '生成中';
                            $.utils._dialogVue.openFullScreenLoading(fullScreenLoadingText);
                            // document.getElementsByClassName()
                            this.splitAuditionArr.forEach((el)=>{
                                let elValue = document.getElementById(el).value;
                                for (var i in this.splitAuditionData.audios){
                                    if (!this.splitAuditionData.audios[i].hasOwnProperty("url")){
                                        if (this.splitAuditionData.audios[i].text.indexOf(el)!=-1){
                                            this.splitAuditionData.audios[i].text =
                                                this.splitAuditionData.audios[i].text.replace("["+el+"]",elValue);
                                        }
                                    }
                                }
                            });
                            $.ajax({
                                type : "POST",
                                url : baseHost +"/services/speechcraft/testListen.json",
                                dataType : "json",
                                contentType : "application/json",
                                data : JSON.stringify(this.splitAuditionData),
                                success : function(data) {
                                    $.utils._dialogVue.fullScreenLoading.close();
                                    if (data.resultMessageEnum == "0000") {
                                        self.viewSource = baseHost + "/services/file/downloadFile.html?filePath="+data.returnObject.joinUrl;
                                        self.currentMusic.duration = data.returnObject.joinDuration
                                        self.$nextTick(() => {
                                            self.videoPlay = false;
                                            setTimeout(function(){
                                                self.$refs.w_audio.play();
                                                self.percentMusic();
                                            },200,self);
                                        })
                                    } else if(data.resultMessageEnum == "0001"){
                                        $.utils.tooltip($.utils.getErrorMessage(data.errorInfoList),'error');
                                    }
                                },
                                error: function(){
                                    $.utils._dialogVue.fullScreenLoading.close();
                                    showInfo("errorInfo");
                                }
                            });
                        }else {
                            self.$nextTick(() => {
                                self.videoPlay = true;
                                self.$refs.w_audio.pause();
                            })
                        }
                    },

                    percentMusic(){
                        const duration = this.$refs.w_audio.duration;
                        this.currentMusic.duration = duration;
                        this.$refs.w_audio.ontimeupdate = () => {

                            this.currentMusic.currentTime = this.$refs.w_audio.currentTime;

                            var value = this.currentMusic.currentTime && duration ? this.currentMusic.currentTime / duration*100 : 0;

                            this.viewPlayValue = value;

                        };
                    },
                    barDown(val){
                        this.$refs.w_audio.pause();
                    },
                    changeSlider(time){

                        if(this.$refs.w_audio){
                            this.viewPlayValue = time;
                            this.currentMusic.currentTime = this.$refs.w_audio.currentTime = time*this.$refs.w_audio.duration/100 ||0;
                            this.$refs.w_audio.play();
                        }
                    },
                    showSpeechContLib: function(){
                        // this.dialogSpeechContLibVisible = true; // 设置显示标识
                        // this.querySoundConfigGroupList(); // 获取数据
                        window.open(baseHost + '/flow/sound.html','_blank');
                    },
                    hideSpeechContLib: function(){
                        this.dialogSpeechContLibVisible = false;
                    },
                    /**
                     * 打开加载遮罩
                     */
                    openFullScreenLoading(text) {
                        this.fullScreenLoading = this.$loading({
                            lock: true,
                            text: text + '...',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                    },
                    resetCheckedList(val){
                        $.utils._checkedList = $.utils._checkedList.filter(function (element, index, self) {
                            return element !== val;
                        });
                        $.utils._speechcraftContentVue.checkedList = $.utils._checkedList.filter(function (element, index, self) {
                            return element !== val;
                        });
                        this.dialogVisibleChild = false;
                    },
                    //转换按钮颜色回调函数
                    changeRobotToEnd:function () {
                        this.dialogVisibleChild = false
                        let lastCell = $.utils.getLastCells();
                        if (lastCell.style!="robot"){
                            lastCell = $.utils.lastv2
                        }else {
                            if ($.inArray(lastCell.id,this.delindex)>=0){
                                lastCell = $.utils.lastv2
                            }
                        }
                        let cellsChildInfo = $.utils.hasChildNodeInfo(lastCell)

                        let delCells = [];
                        for (let i in cellsChildInfo.outCells){
                            delCells.push(cellsChildInfo.outCells[i])
                        }
                        //更改按钮颜色
                        let v1 = $.utils.changeCellRobotToEnd(lastCell)
                        // 删除
                        for (var i in delCells){
                            this.delindex.push(delCells[i].id)
                        }
                        graph.removeCells(delCells)
                        //关闭弹窗
                        mxEditor.hideProperties()
                        setTimeout(function () {
                            mxEditor.execute("showProperties",v1);
                        },50,mxEditor,v1)
                        $.utils.lastV1 = v1
                    },
                    exceptionFunc:function () {
                        //红线效果
                        _lastTouchCellId = []
                        this.dialogExceptionVisible = false
                        let _allCell = graph.getModel().cells
                        let _currentCell = $.utils.getLastCells()
                        // 所有下游节点
                        let childrenCells = [];
                        let _targetCell = this.dialogExceptionCellTarget
                        let _targetCellNew = this.dialogExceptionCellTargetNew
                        let targetType,targetTypeNew
                        let childInfoCurrent
                        let currentId,targetId,targetNewId
                        let targetEdgs
                        let rm = []
                        let setStyle = []
                        var parent = graph.getDefaultParent();
                        //删除下游节点
                        $.utils.getChildrenCells(childrenCells,_currentCell);
                        graph.getModel().beginUpdate();
                        try {
                            for (let i in childrenCells) {
                                graph.removeCells([childrenCells[i]]);
                            }
                        } finally {
                            graph.getModel().endUpdate();
                        }
                        //如果当前cell有指向的targetCell
                        if (_targetCell != [] && _targetCell!= null) {
                            //当前targetCell的类型
                            targetType = _targetCell.value.nodeName
                            //当前targetCellnew的类型
                            targetTypeNew = _targetCellNew.value.nodeName
                            //当前currentCell的所有的下级信息
                            childInfoCurrent = $.utils.hasChildNodeInfo(_currentCell)
                            //当前的currentCell的id
                            currentId = _currentCell.id
                            targetId = _targetCell.id
                            targetNewId = _targetCellNew.id
                            targetEdgs = _targetCell.edges
                            //判断当前的targetCell有多少source（源cell）指向她，如果只有一根edge指向他，直接删除
                            if (targetEdgs.length == 1) {
                                let childInfoTarget = $.utils.hasChildNodeInfo(_targetCell)
                                for (let i in childInfoTarget.outCells) {
                                    graph.removeCells([childInfoTarget.outCells[i]])
                                }
                            }
                            //如果edge>1,需要判断，如果edge是虚线的直接变成实线，并且把currentCell到targetCell的edge删除
                            if (targetEdgs.length > 1) {
                                for (let i in targetEdgs) {
                                    // 删除当前的线
                                    rm.push(targetEdgs[i].id)
                                    if (targetEdgs[i].style == "redEdge" && targetEdgs[i].source.id != currentId) {
                                        let item = {
                                            source: targetEdgs[i].source,
                                            target: targetEdgs[i].target
                                        }
                                        setStyle.push(item)
                                    }
                                }
                            }
                            //删除原来的线
                            graph.getModel().beginUpdate();
                            try {
                                for (let i in _allCell) {
                                    if ($.inArray(_allCell[i].id, rm) >= 0) {
                                        graph.removeCells([_allCell[i]])
                                    }
                                }
                            } finally {
                                graph.getModel().endUpdate();
                            }

                            //建立新的线
                            let ans = []
                            graph.getModel().beginUpdate();
                            try {
                                for (let i in setStyle) {
                                    graph.insertEdge(parent, null, mxEditor.templates.edge.value, setStyle[i].source, setStyle[i].target, "straightEdge")
                                    ans.push(setStyle[i].source.id)
                                    let sourcecellover = graph.getCellOverlays(setStyle[i].source)
                                    let targetecellover = graph.getCellOverlays(setStyle[i].target)

                                    for (let i in sourcecellover) {
                                        graph.removeCellOverlay(setStyle[i].source, sourcecellover[i])
                                    }
                                    for (let i in targetecellover) {
                                        graph.removeCellOverlay(setStyle[i].target, targetecellover[i])
                                    }

                                }
                            }
                            finally {
                                graph.getModel().endUpdate();
                            }
                            //返回原来的style
                            for (let i in _allCell) {
                                if ($.inArray(_allCell[i].id, ans) >= 0) {
                                    _allCell[i].setStyle("answer")
                                }
                            }
                        }
                        var ev1
                        graph.getModel().beginUpdate();
                        try
                        {
                            //最终都是要连线
                            ev1 = graph.insertEdge(parent, null, mxEditor.templates.edge.value, _currentCell, _targetCellNew, "redEdge")
                            graph.getModel().setStyle(_currentCell,"answerforwrd")
                            let _overlay = new mxCellOverlay(
                                new mxImage('images/undo.gif', 16, 16),
                                '', 'right', "top");
                            let _overlay1 = new mxCellOverlay(
                                new mxImage('images/undo.gif', 16, 16),
                                '', 'right', "top");

                            graph.addCellOverlay(_currentCell, _overlay)
                            graph.addCellOverlay(_targetCellNew, _overlay1)
                        }
                        finally
                        {
                            graph.getModel().endUpdate();
                        }
                        //对添加的线做隐藏
                        let state = graph.view.getState(ev1)
                        state.shape.node.getElementsByTagName('path')[0].setAttribute("display","none")
                        state.shape.node.getElementsByTagName('path')[1].setAttribute("display","none")
                        state.shape.node.getElementsByTagName('path')[2].setAttribute("display","none")

                    },

                    //确定不跳转
                    nochangeJumpConfirm(){
                        //获取当前跳转按钮的cell 和targetCell
                        var currentEdges = currentCell.edges;
                        var sourceCell;
                        var targetCell;
                        for (var i in currentEdges){
                            if (currentEdges[i].style == "redEdge"){
                                sourceCell = currentEdges[i].source
                                targetCell = currentEdges[i].target
                            }
                        }
                        //删除当前按钮的overlay
                        var g = sourceCell.getGeometry()
                        //判断targetCell的redEdge有多少条
                        var targetEdges = targetCell.edges;
                        var targetEdgesRedCount = 0;
                        var redEdge = '';
                        for (var i in targetEdges){
                            if (targetEdges[i].style == "redEdge"){
                                targetEdgesRedCount = targetEdgesRedCount + 1;

                            }
                        }
                        for (var i in sourceCell.edges){
                            if (sourceCell.edges[i].style == "redEdge"){
                                redEdge = sourceCell.edges[i];
                                sourceCell.removeEdge(redEdge)
                            }
                        }

                        graph.getModel().beginUpdate();
                        try
                        {
                            //如果只有一条红线也需要删除overlay
                            if (targetEdgesRedCount == 1){
                                graph.removeCellOverlays(targetCell)
                            }
                            // 添加新的机器人节点
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

                            var doc1 = mxUtils.createXmlDocument();
                            var node1 = doc1.createElement('Answer');
                            node1.setAttribute('label',"客户意图");
                            node1.setAttribute('nodeType',"answer");
                            node1.setAttribute('keywords',"");
                            node1.setAttribute('intentionId',"");
                            node1.setAttribute('level',"");
                            node1.setAttribute('jumpType',"");
                            node1.setAttribute('jumpItemType',"");
                            let v2 = graph.insertVertex(parent,null,node1,g.x,g.y,100,30,'answer')
                            let v1 = graph.insertVertex(parent,null,node,g.x-30,g.y+150,100,30,"robot");
                            graph.insertEdge(parent,null,mxEditor.templates.edge.value,v2,v1,"straightEdge")
                            var removeIds = [];
                            for (var i in sourceCell.edges){
                                removeIds.push(sourceCell.edges[i].id)
                            }
                            var allcells = graph.getModel().cells
                            var removeCellArr = [];
                            for (var i in allcells){
                                if ($.inArray(allcells[i].id,removeIds) >= 0){
                                    removeCellArr.push(allcells[i])
                                }
                            }
                            removeCellArr.push(sourceCell)
                            graph.removeCells(removeCellArr)
                            mxEditor.hideProperties()
                        }finally {
                            graph.getModel().endUpdate();
                        }
                        $.utils._dialogVue.dialognoJumpVisible = false
                    },
                    handleArtificialChange(val){
                        window.MessageBridgeUtils.handleArtificialChange(val)
                    },
                    handleartificialIntentionChange(val){
                        window.MessageBridgeUtils.handleArtificialIntentionChange(val);
                    },
                    handleInterruptChange(val){
                        if (val){
                            this.interruptChangeText = '您已在话术编辑器中设置了部分话术可打断，勾选后所有话术均可打断。';
                        }else {
                            this.interruptChangeText = '取消勾选后，在对话过程中所有话术将不能被打断。';
                        }
                        this.interruptVisible = true;
                    },
                    cancelInterruptChange(){
                        this.speechForm.isInterrupt = !this.speechForm.isInterrupt;
                        this.interruptVisible = false;
                    },
                    confirmInterruptChange(){
                        let isInterrupt = $.utils._dialogVue.speechForm.isInterrupt;
                        if (isInterrupt){
                            if ($.inArray('isInterrupt',$.utils._checkedList <= 0)){
                                $.utils._checkedList.push('isInterrupt');
                            }
                        } else {
                            if ($.inArray('isInterrupt',$.utils._checkedList > 0)){
                                $.utils._checkedList.splice($.inArray('isInterrupt',$.utils._checkedList,1));
                            }
                        }
                        let model = mxEditor.graph.getModel()
                        let childrenCell = mxEditor.graph.getDefaultParent().children;
                        try {
                            // 开始更新cell数据
                            model.beginUpdate();
                            $.each(childrenCell, function (index, ele) {
                                if (ele.isVertex() && ele.getAttribute('nodeType','') === 'robot'){
                                    let edit = new mxCellAttributeChange(ele, 'isInterrupt', $.utils._dialogVue.speechForm.isInterrupt);
                                    model.execute(edit);
                                }
                            });
                        } finally {
                            // 结束更新
                            model.endUpdate();
                        }
                        this.interruptVisible = false;
                    },

                },
                filters: {
                    //时间格式化
                    format(value) {
                        let minute = Math.floor(value / 60);
                        let second = Math.floor(value % 60);
                        return `${addZero(minute)}:${addZero(second)}`
                    },
                    formatDuration(value) {
                        let other = value % 3600;
                        let minutes = Math.floor(other / 60);
                        let seconds = Math.floor(other % 60);
                        return addZero(minutes) + ':' + addZero(seconds)
                    }
                },
                watch:{
                    videoVisible(param){
                        if(!param){
                            this.videoPlay = true;
                            this.$refs.w_audio.pause();
                        }
                    }
                }
            })
        },
        /**
         * 意图编辑器相关
         */
        // 意图模板Id
        _intentId:'',
        // 分类级别
        _intentLevel:'',
        // 标题
        _intentLabel:'',
        // 意图语料
        _intentKeywords:'',
        _jumpItemType:"",
        _jumpType:"",
        // 意图编辑器Vue实例
        _intentionEditorVue:null,
        // 创建意图编辑器Vue实例
        createIntentionEditorVue:function(){
            return new Vue({
                el: '#_intentionEditor',
                data: {
                    // 意图模板
                    intentTemplateData:[],
                    // 已选意图模板Id
                    intentId:$.utils._intentId,
                    // 分类级别可选项
                    intentLevelData:_intentionLevelOptions,
                    // 已选分类级别
                    intentLevel:$.utils._intentLevel,
                    // 标题
                    intentLabel:$.utils._intentLabel,
                    // 意图语料
                    intentKeywords:$.utils._intentKeywords,
                    // 分页相关
                    pagecondition: {
                        currentPage:0,
                        pageSize: 500
                    },
                    // 禁用标识
                    isDisabled:false,
                    //跳转类型
                    jumpType:$.utils._jumpType,
                    jumpTypeList:[
                        {
                            value:"1",
                            label:"话术跳转"
                        }
                    ],
                    //跳转列表
                    jumpItemType:$.utils._jumpItemType,
                    jumpItemTypeList: []

                },
                created(){
                    this.disable();
                    this.queryIntentionTemplateList();
                    //如果选择的是话数据跳转的列表
                    if (this.jumpType == 1){
                        this.jumpItemTypeList = $.utils.getACellsExStart(false);
                    }
                    if (this.jumpItemType !== ''){
                        let item = $.utils.getCellByNodeId(this.jumpItemType);
                        this.jumpItemTypeList.push({
                            value: item.id,
                            cell: item,
                            nodeName: item.value.nodeName,
                            label: item.value.attributes.label.nodeValue
                        });
                    }
                },
                methods:{
                    // 设置只读标识
                    disable(){
                        if (viewType == null || viewType == "" || viewType == "0") {
                            this.isDisabled = true;
                        }
                    },
                    // 初始化意图模板
                    initIntentTemplate:function(){
                        this.intentTemplateData.forEach((elem) => {
                            if(elem.id === $.utils._intentId){
                                $.utils._intentionEditorVue.intentId = elem.id;
                            }
                        });
                    },
                    // 获取意图模板
                    queryIntentionTemplateList:function(){
                        let data={
                            industryId:(industryType == null ? '' : industryType),
                            currentPage:this.pagecondition.currentPage,
                            pageSize:this.pagecondition.pageSize
                        };

                        $.ajax({
                            type : 'POST',
                            url : baseHost + '/services/intention/queryIntentionSpeechcraftList.json',
                            dataType : 'json',
                            contentType : 'application/json',
                            data : JSON.stringify(data),
                            async: false
                        }).then((res) => {
                            if (res.resultMessageEnum == "0000") {
                                $.utils._intentionEditorVue.intentTemplateData = res.returnObject.recordList;
                                $.utils._intentionEditorVue.initIntentTemplate();
                            } else if(res.resultMessageEnum == "0001"){
                                $.utils.tooltip($.utils.getErrorMessage(res.errorInfoList),'error');
                            }
                        });
                    },
                    // 更改意图模板
                    changeIntentionTemplate(val){
                        this.intentTemplateData.forEach((elem) => {
                            if(elem.id === val){
                                $.utils._intentId = val;
                                $.utils._intentLabel = elem.intentionName;
                                this.intentLabel = elem.intentionName;
                            }
                        });
                    },
                    // 更改分类级别
                    changeIntentionLevel(val){
                        $.utils._intentLevel = val;
                    },
                    // 更改标题
                    changeLabel(val){
                        $.utils._intentLabel = val;
                    },
                    // 更改意图语料
                    changeKeywords(val){
                        $.utils._intentKeywords = val;
                    },
                    //跳转类型回调
                    changeJumpList(val){
                        $.utils._jumpType = val
                        this.jumpItemTypeList = $.utils.getACellsExStart(true);

                    },
                    //不跳转
                    nochangeJumpList(){
                        var currentEdges = currentCell.edges;
                        var sourceCell;
                        for (var i in currentEdges){
                            if (currentEdges[i].style == "redEdge"){
                                sourceCell = currentEdges[i].source
                            }
                        }
                        if (!sourceCell) {
                            return false;
                        }
                        $.utils._dialogVue.dialognoJumpVisible = true;
                    },

                    //跳转列表回调
                    changejumpItemList:function (val) {
                        $.utils._jumpItemType = val
                        let _allAcellsExStart =  $.utils.getACellsExStart()
                        //获取当前的cell
                        let _currentCell = $.utils.getLastCells()
                        let _currentCellEdges = _currentCell.edges

                        //获取当前cell的target
                        let _currentCellTarget = ""
                        let _currentCellTargetType = ""
                        //新的target
                        let _currentCellTargetNew = ""
                        let _currentCellTargetNewType = ""

                        //获取当前的cell的targetCell,和type,old
                        for (var i in _currentCellEdges){
                            if (_currentCell.id == _currentCellEdges[i].source.id){
                                _currentCellTarget = _currentCellEdges[i].target
                                _currentCellTargetType = _currentCellTarget.value.nodeName
                            }
                        }

                        //新的选择的targetCell和他的type new
                        for (let  i in _allAcellsExStart){
                            if (_allAcellsExStart[i].value == val){
                                _currentCellTargetNew = _allAcellsExStart[i].cell
                                _currentCellTargetNewType  = _allAcellsExStart[i].nodeName
                            }
                        }

                        /**
                         * A:当前连接的是紫色结束语模块，选择跳转的为黄色话术模块 (紫色=> 黄色)
                         */
                        if (_currentCellTargetType == "End" && _currentCellTargetNewType == "Robot"){
                            $.utils._dialogVue.removeCellTypeName = "结束模块"
                        }

                        /**
                         * B:当前连接的是紫色结束语模块A，选择跳转的是紫色结束模块B(紫色=>紫色)
                         */
                        if (_currentCellTargetType == "End" && _currentCellTargetNewType == "End"){
                            $.utils._dialogVue.removeCellTypeName = "结束模块"
                        }
                        /**
                         * D:黄色话术模块A，选择跳转的为黄色话术模块B (黄色=>黄色)
                         */

                        if (_currentCellTargetType == "Robot" && _currentCellTargetNewType == "Robot"){
                            $.utils._dialogVue.removeCellTypeName = "话术模块"

                        }
                        /**
                         * ( 黄色=>紫色)
                         */
                        if (_currentCellTargetType == "Robot" && _currentCellTargetNewType == "end"){
                            $.utils._dialogVue.removeCellTypeName = "话术模块"
                        }
                        $.utils._dialogVue.dialogExceptionVisible = true
                        $.utils._dialogVue.dialogExceptionCellTarget = _currentCellTarget
                        $.utils._dialogVue.dialogExceptionCellTargetNew = _currentCellTargetNew
                    }
                }
            })
        },
        queryCurrentSpeechcraftDetail(){
            $.ajax({
                type : "GET",
                url : baseHost + '/services/speechcraft/querySpeechcraftDetail.json?speechcraftId=' + speechcraftId,
                dataType : "json",
                contentType : "application/json",
                async: false,
            }).then((res) => {
                if (res.resultMessageEnum === "0000") {
                    let data = res.returnObject;
                    const intentionLevelDescriptionStr = data.intentionLevelDescription;
                    if (typeof intentionLevelDescriptionStr !== 'undefined' && intentionLevelDescriptionStr !=  ""){
                        const intentionLevelDescriptionObj = JSON.parse(intentionLevelDescriptionStr);
                        currentIntentionLevelOptions = [
                            {
                                description: intentionLevelDescriptionObj.A.memberDescription,
                                label:"A",
                                value:"A"
                            },
                            {
                                description: intentionLevelDescriptionObj.B.memberDescription,
                                label:"B",
                                value:"B"
                            },
                            {
                                description: intentionLevelDescriptionObj.C.memberDescription,
                                label:"C",
                                value:"C"
                            },
                            {
                                description: intentionLevelDescriptionObj.D.memberDescription,
                                label:"D",
                                value:"D"
                            },
                            {
                                description: intentionLevelDescriptionObj.E.memberDescription,
                                label:"E",
                                value:"E"
                            },
                            {
                                description: intentionLevelDescriptionObj.F.memberDescription,
                                label:"F",
                                value:"F"
                            },
                        ]
                    }
                }else {

                }
            })
        },

    });
})(jQuery);
