
export default {
    formatterPhase(type){
        let text ='';
        switch (type){
            case 0:
            text='待认证';
            case 1:
            text='待审核';
            break;
            case 2:
            text='审核中';
            break;
            case 3:
            text='审核通过';
            break;
            case 4:
            text='已驳回';
            break;
            case 5:
            text='待重申';
            break;
        }
        return text;
    },
    formatterSpeechcraftStatus(type){
        let text ='';
        switch (type){
            case 1:
            text='待发布';
            break;
            case 2:
            text='待审核';
            break;
            // case 4:
            // text='审核中';
            // break;
            case 4:
            text='审核中';
            break;
            case 5:
            text='已发布';
            break;
            case 6:
            text='已驳回';
            break;
            case 7:
            text='待重审';
            break;
        }
        return text;
    },
    paymentTypeEnum(paymentType){
        let txt = '';
        switch(paymentType){
            case 1:
            txt='微信';
            break;
            case 2:
            txt='支付宝';
            break;
            case 3:
            txt='银联';
            break;
        }
        return txt;
    },
    orderStatus(orderStatus){
        let txt = '';
        switch(orderStatus){
            case 1:
            txt='未支付';
            break;
            case 2:
            txt='处理中';
            break;
            case 3:
            txt='充值成功';
            break;
            case 4:
            txt='未支付已关单';
            break;
            case 5:
            txt='支付错误';
            break;
            case 6:
            txt='退款中';
            break;
            case 7:
            txt='已退款';
            break;
        }
        return txt;
    },
    intentionLevel(type){
        let txt = '';
        switch(type){
            case 1:
            txt='A';
            break;
            case 2:
            txt='B';
            break;
            case 3:
            txt='C';
            break;
            case 4:
            txt='D';
            break;
            case 5:
            txt='E';
            break;
            case 6:
            txt='F';
            break;
        }
        return txt;
    },
    connectedResultType(type){
        let txt = '';
        switch(type){
            case 1:
            txt='接听';
            break;
            case 2:
            txt='关机';
            break;
            case 3:
            txt='通话中';
            break;
            case 4:
            txt='无应答';
            break;
            case 5:
            txt='拒接';
            break;
            case 6:
            txt='空号';
            break;
            case 7:
            txt='呼叫转移';
            break;
            case 8:
        	txt='呼叫失败';
        	break;
			case 9:
			txt='队列中';
			break;
			case 10:
			txt='限制骚扰';
			break;
			case 11:
			txt='限制呼叫';
			break;
        }
        return txt;
    },
    /**
     * 音频使用状态
     * @param orderStatus
     * @returns {string}
     */
    soundUseStatus(useFlag){
        let txt = '';
        switch(useFlag){
            case 0:
                txt='未使用';
                break;
            case 1:
                txt='使用中';
                break;
        }
        return txt;
    },
    taskCheckRole(roleValue){
        let txt = '';
        switch (roleValue) {
            case 1:
                txt = '企业账户';
                break;
            case 2:
                txt = '组长';
                break;
            case 3:
                txt = '质检员';
                break;
        }
        return txt;
    },
    /**
     * 处理任务质检状态
     * @param checkStatus
     * @returns {string}
     */
    taskCheckStatus(checkStatus){
        let txt = '';
        switch (checkStatus) {
            case 1:
                txt = '未释放';
                break;
            case 2:
                txt = '待领取';
                break;
            case 3:
                txt = '质检中';
                break;
            case 4:
            txt = '已完成';
            break;
        }
        return txt;
    },
    /**
     * 处理热词词条发状态
     * @param checkStatus
     * @returns {string}
     */
    entryStatus(entryStatus){
        let txt = '';
        switch (entryStatus) {
            case 1:
                txt = '未更新';
                break;
            case 2:
                txt = '已更新';
                break;
        }
        return txt;
    },
    encodeUnicode(str){
        var res = [];
        for (var i = 0; i < str.length; i++) {
            res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
        }
        return "\\u" + res.join("\\u");
    },
    decodeUnicode(str){
        str = str.replace(/\\/g, "%");
        return unescape(str);
    }
};
