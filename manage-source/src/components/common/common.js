export default {
	formatterPhase(type) {
		let text = '';
		switch (type) {
			case 0:
				text = '待认证';
			case 1:
				text = '待审核';
				break;
			case 2:
				text = '审核中';
				break;
			case 3:
				text = '审核通过';
				break;
			case 4:
				text = '已驳回';
				break;
			case 5:
				text = '待重申';
				break;
		}
		return text;
	},
	formatterSpeechcraftStatus(type) {
		let text = '';
		switch (type) {
			case 1:
				text = '待发布';
				break;
			case 2:
				text = '待审核';
				break;
				// case 4:
				// text='审核中';
				// break;
			case 4:
				text = '审核中';
				break;
			case 5:
				text = '已发布';
				break;
			case 6:
				text = '已驳回';
				break;
			case 7:
				text = '待重审';
				break;
		}
		return text;
	},
	paymentTypeEnum(paymentType) {
		let txt = '';
		switch (paymentType) {
			case 1:
				txt = '微信';
				break;
			case 2:
				txt = '支付宝';
				break;
			case 3:
				txt = '银联';
				break;
			case 4:
				txt = '手动打款';
				break;
		}
		return txt;
	},

	/**
	 * 音频使用状态
	 * @param orderStatus
	 * @returns {string}
	 */
	soundUseStatus(useFlag) {
		let txt = '';
		switch (useFlag) {
			case 0:
				txt = '未使用';
				break;
			case 1:
				txt = '使用中';
				break;
		}
		return txt;
	},
	/**
	 * 处理热词词条发状态
	 * @param checkStatus
	 * @returns {string}
	 */
	entryStatus(entryStatus) {
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
	/**格式化订单状态
	 * @param {Object} orderStatus
	 */
	orderStatus(orderStatus) {
		let txt = '';
		switch (orderStatus) {
			case 1:
				txt = '未支付';
				break;
			case 2:
				txt = '处理中';
				break;
			case 3:
				txt = '充值成功';
				break;
			case 4:
				txt = '未支付已关单';
				break;
			case 5:
				txt = '支付错误';
				break;
			case 6:
				txt = '退款中';
				break;
			case 7:
				txt = '已退款';
				break;
		}
		return txt;
	}
};
