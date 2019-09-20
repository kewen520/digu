import axios from 'axios';

/**
 * 检查我的话术是否重名
 * @param context
 * @return {Function}
 */
const checkMySpeech = context => async (rule, value, callback) => {
	if (value.trim() === '') {
		callback(new Error('输入话术名称'));
	}

	const res = await axios.get(context.$baseUrl + 'speechcraft/checkSpeechcraftFlowDuplicateName.json', {
		params: {
			'newSpeechcraftName': value,
		},
	});

	if (res.data.resultMessageEnum === '0000') {
		if (res.data.returnObject === false) {
			callback();
		} else {
			callback(new Error('话术重复'));
		}
	} else {
		this.$message.error(res.data.resultMessage);
		callback(new Error(res.data.resultMessage));
	}
};

export default function(context) {
	return {
		creatSpeechRules: {
			speechcraftName: [{
				required: true,
				message: '输入话术名称'
			}, ],
			industryType: [{
				required: true,
				message: '请选择行业'
			}],
			speechcraftType: [{
				required: true,
				message: '请选择方案类型'
			}]
		},

		copySpeechRules: {
			speechcraftName: [{
				required: true,
				message: '话术名称不能为空！'
			}, ],
			soundConfigGroup: [{
				required: true,
				message: '选择“同时复制音频”选项时，音频存储文件夹不能为空！'
			}, ],
		},

		importSpeechRules: {

		},

		// 复制我的话术库
		copyMySpeechRules: {
			speechcraftName: [{
				validator: checkMySpeech(context),
				trigger: 'blur',
			}, ],
			industryType: [{
				required: true,
				message: '请选择行业'
			}],
			speechcraftType: [{
				required: true,
				message: '请选择方案类型'
			}],
		},
	}
};
