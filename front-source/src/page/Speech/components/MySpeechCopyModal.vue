<template>
    <!-- 复制到我的话术库  -->
    <el-dialog title="复制到我的话术库" :visible.sync="mySpeechCopyVisible" width="600px">
        <el-form ref="copyMySpeechform" :rules="rules.copyMySpeechRules" :model="copyMySpeechform" label-width="100px">
            <el-form-item label="话术名称" prop="speechcraftName">
                <el-input
                        placeholder="请输入话术名称"
                        style="width:350px"
                        ref="speechcraftName"
                        v-model="copyMySpeechform.speechcraftName"
                >
                </el-input>
            </el-form-item>
            <el-form-item prop="speechcraftType" label="方案类型">
                <el-select v-model="copyMySpeechform.speechcraftType" placeholder="请选择方案类型" style="width:350px;">
                    <el-option v-for="item in speechcraftTypeList" :key="item.id" :label="item.schemeName" :value="item.id">
                    </el-option>
                </el-select>
                <el-popover placement="right" width="160" trigger="hover">
                    <p>请选择与您业务对口的方案类型后</p>
                    <i slot="reference" class="el-icon-question"></i>
                </el-popover>
            </el-form-item>
            <el-form-item prop="industryType" label="行业领域">
                <el-select v-model="copyMySpeechform.industryType" placeholder="请选择行业领域" style="width:350px;">
                    <el-option v-for="item in industryList" :key="item.id" :label="item.industryName" :value="item.id">
                    </el-option>
                </el-select>
                <el-popover placement="right" width="160" trigger="hover">
                    <p>选择与您业务对口的行业领域后，您就可以使用该行业领域下的通用话术模板。</p>
                    <i slot="reference" class="el-icon-question"></i>
                </el-popover>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="copyVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitFormCopy()">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import getRules from '../rules';
    import { isUndefined } from 'lodash/lang';
    import { sortBy } from 'lodash/collection';
	import axios from 'axios';
	import { find } from 'lodash/collection';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../../../common/enums';

	export default {
		props: [
			'speechcraftTypeList',
			'industryList',
        ],

		data() {
			const self = this;
		    return {
				rules: getRules(self),
				// 复制到我的话术库弹窗开关
				mySpeechCopyVisible: false,
				copyMySpeechform: {
					speechcraftId: '',
					speechcraftName: '',
					speechcraftType: '',
					industryType: null,
				},
            }
        },

        methods: {
			/**
             * 复制我的话术,打开modal
             */
			openMySpeechCopyModal(row, speechcraftData) {
				this.mySpeechCopyVisible = true;
				const regSpeechcraftName = row.speechcraftName.replace(/的副本[0-9]*$/, '');
				const regExp = new RegExp(`${regSpeechcraftName}(的副本([0-9]*)?)?$`);
				const sameNamesSpeechesNums = sortBy(speechcraftData.map(({ speechcraftName }) => {
					const match = speechcraftName.match(regExp);
					if (match) {
						if (match[2]) return parseInt(match[2], 10);
						if (match[1]) return 1;
						if (match[0]) return 0;
                    }
                }).filter(o => !isUndefined(o))).reverse();

				if (sameNamesSpeechesNums[0] === 0) {
					this.copyMySpeechform.speechcraftName = `${regSpeechcraftName}的副本`;
                } else if (sameNamesSpeechesNums[0] > 0) {
					this.copyMySpeechform.speechcraftName = `${regSpeechcraftName}的副本${sameNamesSpeechesNums[0] + 1}`;
                }

                this.copyMySpeechform.speechcraftId = row.id;
                this.copyMySpeechform.speechcraftType = row.speechcraftType;
				this.copyMySpeechform.industryType = row.industryType;
			},

			/**
             * 提交表单
			 * @return {Promise.<void>}
			 */
			async submitFormCopy() {
				try {
					await this.$refs.copyMySpeechform.validate();
					const newIndustry = find(this.industryList, { id: this.copyMySpeechform.industryType });
					const { data } = await axios.post(
						`${this.$baseUrl}/speechcraft/copySpeechcraftFlow.json`,
						{
							speechcraftId: this.copyMySpeechform.speechcraftId,
							newSpeechcraftName: this.copyMySpeechform.speechcraftName,
							newSpeechcraftType: this.copyMySpeechform.speechcraftType,
							newIndustryType: this.copyMySpeechform.industryType,
							newIndustryName: newIndustry ? newIndustry.industryName : '',
						}
					);

                    if (data.resultMessageEnum === API_SUCCESS_CODE) {
						this.mySpeechCopyVisible = false;
						this.$emit('updateSpeechCraftTypeList');
                    } else {
						this.$message.error(data.errorInfoList[0].errorMessage);
                    }
                } catch (e) {
                }
			}
        },
    };
</script>`
