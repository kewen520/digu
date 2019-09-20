
(() => {
    const $ngFlowIFrame = $('#ngFlowIFrame');
    const messageBridgeUtils = {};

    // postMessage的桥接
    window.addEventListener("message", (e) => {
        const data = e.data;
        let returnData = {};
        switch (data.controller) {
            case 'flow':
                switch (data.action) {
                    case 'get':
                        returnData = window.getFlowContent();
                        break;
                    case 'set':
                        window.showFlowDiagram(data.params.xml);
                        if(isChange){
                            if(isOnline){
                                save(false, () => {
                                    returnData = 'success';
                                    returnPostMessage(e, returnData);
                                }, () => {
                                    returnData = 'error';
                                    returnPostMessage(e, returnData);
                                });
                                isChange = false;
                                return;
                            }else{
                                showInfo("errorInfo");
                            }
                        }
                        break;
                }
                break;
            case 'backToFlow':
                window.MessageBridgeUtils.hideListViewType();
                break;
            case 'mxResources':
                switch (data.action) {
                    case 'get':
                        returnData = window.mxResources.get(data.params.name);
                        break;
                    default:
                }
                break;
            case 'handleArtificialChange':
                switch (data.action) {
                    case 'get':
                        returnData = $.utils._dialogVue.speechForm.isArtificial;
                        break;
                    case 'set':
                        window.MessageBridgeUtils.handleArtificialChange(data.params.val);
                        break;
                }
                break;
            case 'handleArtificialIntentionChange':
                switch (data.action) {
                    case 'get':
                        returnData = $.utils._dialogVue.speechForm.artificialIntention;
                        break;
                    case 'set':
                        window.MessageBridgeUtils.handleArtificialIntentionChange(data.params.val);
                        break;
                }
                break;
            case 'handleInterruptChange':
                switch (data.action) {
                    case 'get':
                        returnData = $.utils._dialogVue.speechForm.isInterrupt;
                        break;
                    case 'set':
                        window.MessageBridgeUtils.handleInterruptChange(data.params.val);
                        break;
                }
                break;
            default:
        }

        returnPostMessage(e, returnData);
    }, false);

    function returnPostMessage(e, params) {
        const data = e.data || {};
        $ngFlowIFrame.get(0).contentWindow.postMessage({
            controller: data.controller || '',
            action: data.action || '',
            params,
            randomId: data.randomId || '',
        }, '*');
    }

    messageBridgeUtils.handleArtificialChange = val => {
        $.utils._dialogVue.speechForm.isArtificial = !!val;

        if (val){
            if ($.inArray('isAllow', $.utils._checkedList <= 0)){
                $.utils._checkedList.push('isAllow');
            }
        } else {
            if ($.inArray('isAllow', $.utils._checkedList > 0)){
                $.utils._checkedList.splice($.inArray('isAllow',$.utils._checkedList,1));
            }
        }

        let model = mxEditor.graph.getModel();
        let childrenCell = mxEditor.graph.getDefaultParent().children;
        try {
            // 开始更新cell数据
            model.beginUpdate();
            $.each(childrenCell, function (index, ele) {
                if (ele.isVertex() && ele.getAttribute('nodeType', '') !== 'answer'){
                    let edit = new mxCellAttributeChange(ele, 'isAllow', val);
                    model.execute(edit);
                }
            });
        } finally {
            // 结束更新
            model.endUpdate();
        }
    };

    messageBridgeUtils.handleArtificialIntentionChange = val => {
        $.utils._dialogVue.speechForm.artificialIntention = val;

        let model = mxEditor.graph.getModel()
        let childrenCell = mxEditor.graph.getDefaultParent().children;
        try {
            // 开始更新cell数据
            model.beginUpdate();
            $.each(childrenCell, function (index, ele) {
                if (ele.isVertex() && ele.getAttribute('nodeType','') !== 'answer'){
                    let edit = new mxCellAttributeChange(ele, 'artificialIntention', val);
                    model.execute(edit);
                }
            });
        } finally {
            // 结束更新
            model.endUpdate();
        }
    };

    messageBridgeUtils.handleInterruptChange = val => {
        $.utils._dialogVue.speechForm.isInterrupt = val;
    };


    messageBridgeUtils.showListViewType = () => {
        updateModel(currentCell);
        mxEditor.hideProperties();
        window.location.hash = 'listViewType';
        $ngFlowIFrame.attr('src', `${frontHost}/#/flow/?${window.location.search.substring(1)}`);
        $ngFlowIFrame.show();
    };

    messageBridgeUtils.hideListViewType = () => {
        window.location.hash = '';
        $ngFlowIFrame.attr('src', '');
        $ngFlowIFrame.hide();
    };

    window.MessageBridgeUtils = messageBridgeUtils;
})();

