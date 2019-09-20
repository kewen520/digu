<template>
	<div class="table">
		<div class="content-box-top">
			<el-input v-model="select_word" clearable placeholder="筛选关键词" @change="searchChange" class="handle-input mr10"
			 @keyup.native.13="search"></el-input>
			<el-button type="primary" class="search-btn" icon="search" @click="search">搜索</el-button>
			<div class="content-box-top-right">
				<el-button type="primary" icon="el-icon-tickets" @click="handleImport">导入录音</el-button>
				<el-button type="primary" icon="iconfont icon-ico_new-task" @click="creatSpeech">新建话术</el-button>
			</div>
		</div>
		<div class="w-container">
			<div class="speech_top" :style="{height:height+100+'px'}">
				<el-button type="primary" icon="delete" class="speech_top_btn_del" :disabled="del_disabled" @click="delVisible = true"
				 v-show="btn_del">删除</el-button>
				<el-tabs v-model="activeName" @tab-click="handleTabClick">
					<el-tab-pane label="我的话术库" name="my_speech">
					</el-tab-pane>
					<el-tab-pane label="通用模版库" name="second">
					</el-tab-pane>
				</el-tabs>
				<el-table :data="speechcraftData" stripe class="table" ref="multipleTable" @sort-change="sortChange" @filter-change="filterChange"
				 @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="55" align="center"></el-table-column>
					<el-table-column prop="speechcraftName" label="话术名称" width="150">
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间" sortable width="180">
					</el-table-column>
					<el-table-column prop="editTime" label="更新时间" sortable width="180">
					</el-table-column>
					<el-table-column prop="industryName" column-key="industryName" :label="industryNameTxt" :filters="filtersIndustry">
					</el-table-column>
					<el-table-column prop="copyOperationType" label="意图类型">
						<template slot-scope="scope">
							{{scope.row.copyOperationType==1?'固定节点':'自定义节点'}}
						</template>
					</el-table-column>
					<el-table-column prop="speechcraftStatus" column-key="speechcraftStatus" :label="speechcraftStatusText" v-if="activeName=='my_speech'"
					 :formatter="speechcraftStatus" :filters="[{text: '待发布', value: '1'},{text: '待审核', value: '2'},{text: '已驳回', value: '6'},{text: '待重审', value: '7'},{text: '已发布', value: '5'}]"
					 :filter-multiple="false">
					</el-table-column>
					<el-table-column class-name="speechSecond" column-key="speechSecond" v-if="activeName=='second'" prop="speechcraftStatus"
					 :filters="[{}]" label="状态" :formatter="speechcraftStatus">
					</el-table-column>
					<el-table-column label="操作" width="220" align="center">
						<template slot-scope="scope">
							<span v-if="activeName=='my_speech'">
								<el-button type="text" @click="handleView(scope.$index, scope.row)">查看</el-button>
								<el-button type="text" @click="openMySpeechCopyModal(scope.row, speechcraftData)">复制</el-button>
								<el-button type="text" v-if="scope.row.isEditable==true" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
								<el-button type="text" v-else disabled>编辑</el-button>
								<el-button type="text" @click="downTaskItemExcelTemplate(scope.$index, scope.row)">下载变量表</el-button>
							</span>
							<span v-else>
								<el-button type="text" @click="handleView(scope.$index, scope.row)">查看</el-button>
								<el-button type="text" @click="handelCopy(scope.$index,scope.row)">复制</el-button>
							</span>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagination">
					<el-pagination background @current-change="handleCurrentChange" layout="total, prev, pager, next,jumper" :total="pagination.total"
					 :page-size="pagination.pageSize">
					</el-pagination>
				</div>
			</div>
		</div>
		<!-- 新建话术出框 -->
		<el-dialog title="新建话术" :visible.sync="creatSpeechVisible" width="600px">
			<el-form ref="creatSpeechform" :rules="rules.creatSpeechRules" :model="creatSpeechform" label-width="100px">
				<el-form-item label="话术名称" :error="errors.speechcraftName" prop="speechcraftName">
					<el-input placeholder="请输入话术名称" style="width:350px" v-model="creatSpeechform.speechcraftName">
					</el-input>
				</el-form-item>
				<el-form-item prop="speechcraftType" label="方案类型">
					<el-select v-model="creatSpeechform.speechcraftType" placeholder="请选择方案类型" style="width:350px;">
						<el-option v-for="item in speechcraftTypeList" :key="item.id" :label="item.schemeName" :value="item.id">
						</el-option>
					</el-select>
					<el-popover placement="right" width="160" trigger="hover">
						<p>请选择与您业务对口的方案类型后</p>
						<i slot="reference" class="el-icon-question"></i>
					</el-popover>
				</el-form-item>
				<el-form-item prop="industryType" label="行业领域">
					<el-select v-model="creatSpeechform.industryType" placeholder="请选择行业领域" style="width:350px;" @change="selectIndustryList">
						<el-option v-for="item in industryList" :key="item.id" :label="item.industryName" :value="item.id">
						</el-option>
					</el-select>
					<el-popover placement="right" width="160" trigger="hover">
						<p>选择与您业务对口的行业领域后，您就可以使用该行业领域下的通用话术模板。</p>
						<i slot="reference" class="el-icon-question"></i>
					</el-popover>
				</el-form-item>
				<el-form-item label="" v-show="isShowMoban">
					<el-checkbox label="使用通用模版" name="type" v-model="moban" @change="isMobanChange"></el-checkbox>
					<el-popover placement="right" width="340" popper-class="speech-tip-2" trigger="hover">
						<div class="pop-box-speech">
							<p>勾选即使用“通用模板库”的话术模板来新建话术。您可以根据您的业务需求选择匹配的模板。</p>
							<img src="../../../static/img/speech_01.png" alt="">
						</div>
						<i slot="reference" class="el-icon-question tymb"></i>
					</el-popover>
				</el-form-item>

				<el-form-item prop="speechcraftId" label="" v-show="moban">
					<el-select v-model="creatSpeechform.speechcraftId" placeholder="请选择话术模板" style="width:350px;" @change="selectChange">
						<el-option v-for="item in creatSpeechOptions" :key="item.id" :label="item.speechcraftName" :value="item.id">
						</el-option>
					</el-select>
				</el-form-item>

				<el-form-item v-if="moban">
					<el-checkbox v-model="creatSpeechform.isCopySound" class="copySpeechRead">同时复制音频</el-checkbox>
					<el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
						<div slot="content">该话术模版关联的音频也会自<br />动复制到【音频库】中的【话<br />术音频】文件夹下</div>
						<i class="el-icon-question"></i>
					</el-tooltip>
				</el-form-item>
				<el-form-item prop="soundConfigGroup" v-if="creatSpeechform.isCopySound">
					<el-select default-first-option filterable allow-create clearable @change="handleChangeForCret" v-model="creatSpeechform.soundConfigGroup"
					 value-key="id" placeholder="选择音频存储文件夹" style="width:350px">
						<el-option v-for="item in soundConfigGroup" :key="item.id" :label="item.configGroupName" :value="item">
						</el-option>
					</el-select>
				</el-form-item>

				<el-form-item label="流程类型" class="creat-radio-box">
					<el-radio v-model="creatSpeechform.CopyOperationTypeEnum" label="1" border size="medium" style="width:167px;"
					 v-show="moban">固定</el-radio>
					<el-radio v-model="creatSpeechform.CopyOperationTypeEnum" label="2" border size="medium" style="width:167px;">自定义</el-radio>
					<el-popover placement="right" width="160" trigger="hover">
						<p>自定义流程支持用户自定义增加或删除问答对</p>
						<i slot="reference" class="el-icon-question"></i>
					</el-popover>
				</el-form-item>

				<el-form-item>
					<el-checkbox v-model="creatSpeechform.isArtificial">允许挂机转人工</el-checkbox>
				</el-form-item>

				<el-form-item v-if="creatSpeechform.isArtificial">
					<el-select w v-model="creatSpeechform.artificialIntention" style="width:350px;" filterable multiple placeholder="请选择转人工意图类型">
						<el-option v-for="item in artificialIntentionOptions" :key="item.id" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>

				<el-form-item>
					<el-checkbox v-model="creatSpeechform.isInterrupt">允许打断(不包含开场白和结束语)</el-checkbox>
					<el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
						<div slot="content" width="50px">勾选后，允许机器人在说话时<br />识别到用户有效说话内容，进<br />行智能打断，该操作排除环境<br />背景音等误打断情景，不包括<br />开场白和结束语。</div>
						<i class="el-icon-question"></i>
					</el-tooltip>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-checkbox v-model="creatSpeechRead" class="creatSpeechRead"><a href="#/protocol" target="_blank">已阅读《云知声外呼协议》</a></el-checkbox>
				<el-button @click="creatSpeechVisible = false">取 消</el-button>
				<el-button type="primary" @click="submitFormCreat('creatSpeechform')">开始创建</el-button>
			</span>
		</el-dialog>
		<!-- 复制 -->
		<el-dialog title="复制模版" :visible.sync="copyVisible" width="600px">
			<el-form ref="copySpeechform" :rules="rules.copySpeechRules" :model="copySpeechform" label-width="100px">
				<el-form-item label="话术名称" prop="speechcraftName">
					<el-input placeholder="请输入话术名称" style="width:350px" v-model="copySpeechform.speechcraftName" @change="handleChange">
					</el-input>
				</el-form-item>
				<el-form-item label="流程类型">
					<el-radio v-model="copySpeechform.CopyOperationTypeEnum" label="1" border size="medium" style="width:167px;">固定</el-radio>
					<el-radio v-model="copySpeechform.CopyOperationTypeEnum" label="2" border size="medium" style="width:167px;">自定义</el-radio>
					<el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
						<div slot="content">动态话术支持用户自定义增加<br />或删减问答对（敬请期待）</div>
						<i class="el-icon-question"></i>
					</el-tooltip>
				</el-form-item>
				<el-form-item>
					<el-checkbox v-model="copySpeechform.isCopySound" class="copySpeechRead">同时复制音频</el-checkbox>
					<el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
						<div slot="content">该话术模版关联的音频也会自<br />动复制到【音频库】中的【话<br />术音频】文件夹下</div>
						<i class="el-icon-question"></i>
					</el-tooltip>
				</el-form-item>
				<el-form-item prop="soundConfigGroup" v-if="copySpeechform.isCopySound">
					<el-select default-first-option filterable allow-create clearable @change="handleChange" v-model="copySpeechform.soundConfigGroup"
					 value-key="id" placeholder="选择音频存储文件夹" style="width:350px">
						<el-option v-for="item in soundConfigGroup" :key="item.id" :label="item.configGroupName" :value="item">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-checkbox v-model="copySpeechRead" class="copySpeechRead"><a href="#/protocol" target="_blank">已阅读《云知声外呼协议》</a></el-checkbox>
				<el-button @click="copyVisible = false">取 消</el-button>
				<el-button type="primary" @click="submitFormCopy('copySpeechform')">开始创建</el-button>
			</span>
		</el-dialog>
		<MySpeechCopyModal
				ref="mySpeechCopyModal"
				v-bind:speechcraftTypeList="speechcraftTypeList"
				v-bind:industryList="industryList"
				v-on:updateSpeechCraftTypeList="handleCurrentChange(1)"
		>
		</MySpeechCopyModal>
		<!-- 导入话术弹出框 -->
		<el-dialog title="导入话术" :visible.sync="importSpeechVisible" width="600px">
			<el-form ref="importSpeechform" :rules="rules.importSpeechRules" :model="importSpeechform" style="width:350px;margin:0 auto;">
				<el-form-item :rules="[
                        { required: true, message: '话术名称不能为空！'},
                    ]"
				 prop="name">
					<el-input placeholder="输入话术名称" v-model="importSpeechform.name">
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-input type="file" placeholder="选择本地话术音频导入" v-model="importSpeechform.fileName" @change="fileChange">
					</el-input>
					<div style="position:absolute;right:-10px;top:0;">
						<i class="el-icon-lx-file"></i>
					</div>
				</el-form-item>
				<div class="import_footer_tip">
					注：仅支持导入wav、mp3、wma格式的音频文件
				</div>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="importSpeechVisible = false">取 消</el-button>
				<el-button type="submit">导 入</el-button>
			</span>
		</el-dialog>
		<!-- 删除提示框 -->
		<el-dialog title="话术删除确认" :visible.sync="delVisible" width="400px">
			<div>您确定要删除此{{this.multipleSelection.length}}条话术吗？删除后将不能恢复？</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="delVisible = false">取 消</el-button>
				<el-button type="primary" @click="deleteRow">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 通用模版使用弹框 -->
		<el-dialog title="使用模版" :visible.sync="useVisible" width="30%">
			<el-input v-model="stencilForm.name" :disabled="true"></el-input>
			<span slot="footer" class="dialog-footer">
				<el-button @click="useVisible = false">取 消</el-button>
				<el-button type="primary" @click="useStencil">开始使用</el-button>
			</span>
		</el-dialog>
		<div class="sound-content" v-show="visibleSound">
			<w-sound :from="pageFrom" />
		</div>
	</div>
</template>

<script>
	import bus from '../../common/bus';
	import common from '../../common/common';
	import wSound from '../Sound'
	import getRules from './rules';
	import MySpeechCopyModal from './components/MySpeechCopyModal';
	import axios from 'axios';

	export default {
		name: 'basetable',
		components: {
			wSound,
			MySpeechCopyModal,
		},

		data() {
			const self = this;
			return {
				rules: getRules(self),
				pageFrom: '',
				activeName: 'my_speech',
				btn_del: true,
				height: '',
				speechcraftData: [],
				speechcraftStatusText: '状态',
				creatSpeechRead: true,
				copySpeechRead: true,
				// speechTotal:0,
				cur_page: 1,
				multipleSelection: [],
				speechcraftStatusList: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				copySpeechcraftId: '',
				copyVisible: false,
				del_disabled: true,
				is_search: false,
				// editVisible: false,
				// viewVisible:false,
				delVisible: false,
				creatSpeechVisible: false,
				importSpeechVisible: false,
				errors: {
					speechcraftName: ''
				},
				form: {
					name: '',
					startDate: '',
					endDate: '',
					type: '',
					status: ''
				},
				// 新建话术
				creatSpeechform: {
					speechcraftType: '',
					speechcraftName: '',
					speechcraftId: '',
					CopyOperationTypeEnum: '2',
					isInterrupt: false,
					isArtificial: false,
					artificialIntention: '',
					isCopySound: false,
					soundConfigGroup: null,
					industryType: null,
				},
				creatSpeechOptions: [],
				// 复制弹框
				copySpeechform: {
					speechcraftName: '',
					CopyOperationTypeEnum: '2',
					isCopySound: false,
					soundConfigGroup: null,
				},
				soundConfigGroup: [],
				//倒入话术
				importSpeechform: {
					name: '',
					fileName: ''
				},
				// 通用模版数据
				useVisible: false,
				stencilData: [],
				stencilForm: {
					name: '',
					file: ''
				},
				pagination: {
					show: true,
					total: 0,
					pageIndex: 1,
					pageSize: 20
				},
				// 行业
				industryList: [],
				moban: false,
				isShowMoban: false,
				industryNameTxt: '行业领域',
				filtersIndustry: [],
				industryTypeList: [],
				visibleSound: false,
				// 加载相关
				fullScreenLoading: null,
				// 转人工相关
				artificialIntentionOptions: [{
						id: 1,
						value: 'main',
						label: '正常'
					},
					{
						id: 2,
						value: 'quiet',
						label: '静默'
					},
					{
						id: 3,
						value: 'exception',
						label: '异常'
					},
					{
						id: 4,
						value: 'retell',
						label: '复述'
					}
				],
				// 方案列表
				speechcraftTypeList: [],
			}
		},

		async created() {
			const clintHeight = document.documentElement.clientHeight;
			this.height = clintHeight - 260;

			bus.$emit('contentTop', true);
			bus.$on('closeSound', msg => {
				if (msg) {
					this.visibleSound = false;
				}
			});
			await this.querySpeechcraftList(2);
			// this.queryAllIndustryList();
			this.queryValidIndustryList();
		},

		computed: {

		},

		methods: {
			handleImport() {
				// this.$router.push('/sound');
				this.pageFrom = 'speech';
				this.visibleSound = true;
			},

			selectChange(val) {
				if (val == 999) {
					this.creatSpeechform.CopyOperationTypeEnum = '2';
				}
			},

			selectIndustryList(val) {
				let obj = this.industryList.find((item) => {
					return item.id == val;
				});
				if (obj.indestryNameEn === 'other') {
					this.moban = false;
					this.isShowMoban = false;
				} else {
					this.isShowMoban = true;
				}
			},

			fileChange(event) {
				let data = {
					sourceType: 102,
					file: this.importSpeechform.fileName
				};
				$.post(this.$baseUrl + 'common/uploadAnnexFile.json', JSON.stringify(data)).then((res) => {
					if (res.resultMessageEnum === '0000') {
						this.creatSpeechVisible = false;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},

			// 分页导航
			async handleCurrentChange(val) {
				this.cur_page = val;
				await this.querySpeechcraftList();
			},

			speechcraftStatus(row, column) {
				return common.formatterSpeechcraftStatus(row.speechcraftStatus);
			},

			isMobanChange(val) {
				// if(val){
				//     this.creatSpeechOptions.forEach((item,index)=>{
				//         if(item.id==999){
				//             this.creatSpeechOptions = this.creatSpeechOptions.splice(index,1);
				//         }
				//     })
				// }
			},

			/*
			 * 1 通用
			 * 2 会员模版
			 */
			async querySpeechcraftList(type) {
				let ttype = 1;
				if (type) {
					ttype = type;
				} else {
					if (this.activeName === 'my_speech') {
						ttype = 2;
					} else if (this.activeName === 'second') {
						ttype = 1;
					}
				}

				let data = {
					templateType: ttype,
					currentPage: this.cur_page - 1,
					pageSize: this.pagination.pageSize
				};
				if (this.select_word) {
					data.speechcraftName = this.select_word;
				}
				if (this.speechcraftStatusList.length) {
					data.speechcraftStatusList = this.speechcraftStatusList;
				}
				if (this.industryTypeList.length) {
					data.industryTypeList = this.industryTypeList;
				}
				if (this.sortList) {
					data.sortList = this.sortList;
				}

				const { data: resData } = await axios.post(this.$baseUrl + 'speechcraft/querySpeechcraftList.json', data);
				if (resData.resultMessageEnum === '0000') {
					this.pagination.total = resData.returnObject.totalNumber;
					this.speechcraftData = resData.returnObject.recordList;
					if (this.speechcraftData && this.speechcraftData.length) {
						this.speechcraftData.forEach((item) => {
							if (!item.industryName) {
								item.industryName = '其他'
							}
						})
					}
				} else {
					this.$message.error(resData.errorInfoList[0].errorMessage);
				}
			},

			// 2.7.1.查询话术列表
			async querySpeechcraftListOpt() {
				this.creatSpeechOptions = [];
				let data = {
					templateType: 1,
				};

				const { data: returnData } = await axios.post(this.$baseUrl + 'speechcraft/querySpeechcraftList.json', data);
				if (returnData.resultMessageEnum === '0000') {
					let list = [];
					// let list = res.returnObject.recordList;
					if (returnData.returnObject.recordList && returnData.returnObject.recordList.length) {
						list = returnData.returnObject.recordList;
						// list.unshift(this.defe);
					} else {
						// list.push(this.defe)
					}

					this.creatSpeechOptions = list;
				} else {
					this.$message.error(returnData.errorInfoList[0].errorMessage);
				}
			},

			/**
			 * 打开复制我的话术弹窗
			 * @return {Promise.<void>}
			 */
			async openMySpeechCopyModal(row, speechcraftData) {
				await Promise.all([
					this.querySchemeList(),
					this.queryAllIndustryList(),
				]);
				this.$refs.mySpeechCopyModal.openMySpeechCopyModal(row, speechcraftData);
			},

			async sortChange(column) {
				let flag = true;
				if (column.prop) {
					flag = column.order === 'ascending';
					this.sortList = [{
						propertyName: column.prop,
						ascendingFlag: flag
					}];
				} else {
					this.sortList = '';
				}

				await this.querySpeechcraftList();
			},

			// 2.7.2.复制话术为新话术
			copySpeechcraft(opt) {
				const dtd = $.Deferred();
				let data = $.extend({}, {
					newSpeechcraftName: this.creatSpeechform.speechcraftName,
					copyOperationType: this.creatSpeechform.CopyOperationTypeEnum,
				}, opt);
				$.post(this.$baseUrl + 'speechcraft/copySpeechcraft.json', JSON.stringify(data)).then((res) => {
					if (res.resultMessageEnum === '0000') {
						dtd.resolve(res);
					} else {
						dtd.resolve();
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
				return dtd;
			},

			handleChange(val) {
				if (typeof val === 'string') {
					this.soundConfigGroup.forEach((item, index) => {
						if (item.id === 'duplicateid') {
							item.configGroupName = val;
						}
					});
					this.copySpeechform.soundConfigGroup = {
						id: 'duplicateid',
						configGroupName: val,
						soundConfigGroupType: 1
					};
				}
			},

			handleChangeForCret(val) {
				if (typeof val === 'string') {
					this.creatSpeechform.soundConfigGroup = {
						id: 'duplicateid',
						configGroupName: val,
						soundConfigGroupType: 1
					};
				}
			},

			handelCopy(index, row) {
				this.querySoundConfigGroupList();
				this.activeSpeechcraft = row;
				this.copySpeechform.speechcraftName = `${row.speechcraftName}副本`;
				this.copySpeechform.soundConfigGroup = {
					id: 'duplicateid',
					configGroupName: this.copySpeechform.speechcraftName,
					soundConfigGroupType: 1
				};
				this.copyVisible = true;
			},

			// 查询录音文件夹列表
			querySoundConfigGroupList() {
				this.soundConfigGroup = [];
				$.get(this.$baseUrl + 'sound/querySoundConfigGroupList.json?duplicateFlag=1&soundConfigGroupType=1').then((res) => {
					if (res.resultMessageEnum === '0000') {
						if (res.returnObject) {
							this.soundConfigGroup = res.returnObject;
						}
						this.soundConfigGroup.push({
							id: 'duplicateid',
							configGroupName: this.copySpeechform.speechcraftName,
							soundConfigGroupType: 1
						});
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				})
			},

			// 查询录音文件夹列表
			async querySoundConfigGroupListForCret() {
				this.soundConfigGroup = [];
				const { data } = await axios.get(
					this.$baseUrl + 'sound/querySoundConfigGroupList.json?duplicateFlag=1&soundConfigGroupType=1'
				);
				if (data.resultMessageEnum === '0000') {
					if (data.returnObject) {
						this.soundConfigGroup = data.returnObject;
					}
				} else {
					this.$message.error(data.errorInfoList[0].errorMessage);
				}
			},

			// 通用模版复制
			submitFormCopy() {
				if (!this.copySpeechRead) {
					this.$message.error("请先阅读协议！");
					return false;
				}
				this.$refs['copySpeechform'].validate((valid) => {
					if (valid) {
						/*this.openFullScreenLoading('复制中');*/
						this.copySpeechcraft({
							speechcraftId: this.activeSpeechcraft.id,
							newTemplateType: 2,
							newSpeechcraftName: this.copySpeechform.speechcraftName,
							copyOperationType: this.copySpeechform.CopyOperationTypeEnum,
							industryType: this.activeSpeechcraft.industryType,
							industryName: this.activeSpeechcraft.industryName,
							isCopySound: this.copySpeechform.isCopySound,
							soundConfigGroup: this.copySpeechform.soundConfigGroup,
						}).then(async res => {
							/*this.fullScreenLoading.close();*/
							if (res) {
								this.copyVisible = false;
								this.$refs['copySpeechform'].resetFields();
								await this.querySpeechcraftList(1);
								if (this.copySpeechform.isCopySound) {
									this.$message({
										type: 'success',
										dangerouslyUseHTMLString: true,
										message: this.copySpeechform.soundConfigGroup.configGroupName + '音频复制成功，<a target="_blank" href="' +
											this.$baseHost + '/index.html#/sound">点击查看</a>',
									});
								} else {
									this.$message.success("复制模版成功！");
								}
							}
						});
					}
				});
			},

			/**
			 * 新建弹框
			 */
			async creatSpeech() {
				await Promise.all([
					this.querySpeechcraftListOpt(),
				 	this.queryAllIndustryList(),
					this.querySoundConfigGroupListForCret(),
					this.querySchemeList(),
				]);

				this.creatSpeechVisible = true;
			},

			/**
			 * 查询方案列表接口
			 */
			async querySchemeList() {
				const { data } = await axios.post(`${this.$baseUrl}scheme/querySchemeList.json`);
				const schemeList = data.returnObject;
				this.speechcraftTypeList = schemeList.map(item => ({
					id: item.id,
					schemeType: item.schemeType,
					schemeName: item.schemeName,
				}));
			},

			/**
			 * 新建话术
			 */
			addSpeechcraft() {
				const data = {
					speechcraftName: this.creatSpeechform.speechcraftName,
					speechcraftType: this.creatSpeechform.speechcraftType,
					isInterrupt: this.creatSpeechform.isInterrupt ? 1 : 0,
					isArtificial: this.creatSpeechform.isArtificial ? 1 : 0,
					artificialIntention: this.creatSpeechform.artificialIntention != '' ? this.creatSpeechform.artificialIntention.join(
						',') : '',
				};

				let industryType = this.creatSpeechform.industryType;

				if (industryType) {
					let obj = this.industryList.find((item) => {
						return item.id === industryType;
					});
					data.industryType = obj.id;
					data.industryName = obj.industryName;
				}

				$.post(this.$baseUrl + 'speechcraft/addSpeechcraft.json', JSON.stringify(data)).then(async (res) => {
					if (res.resultMessageEnum === '0000') {
						this.creatSpeechVisible = false;
						this.$refs['creatSpeechform'].resetFields();
						await this.querySpeechcraftList();
						window.open(
							`${this.$baseHost}/flow/index.html?viewType=1&speechcraftId=${res.returnObject}&speechcraftName=${this.creatSpeechform.speechcraftName}&flowType=1`
						);
					} else if (res.resultMessageEnum === '060000') {
						this.errors.speechcraftName = '话术名称已存在，请修改 !';
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				})
			},

			async search() {
				if (!this.select_word) {
					this.$message.error("请输入关键字！");
					return false;
				}
				this.cur_page = 1;
				await this.querySpeechcraftList();
			},

			// 搜索框为空时
			async searchChange(val) {
				if (!val) {
					await this.querySpeechcraftList();
				}
			},

			// 新建话术
			submitFormCreat(formName) {
				if (!this.creatSpeechRead) {
					this.$message.error("请先阅读协议！");
					return false;
				}
				this.$refs[formName].validate((valid) => {
					if (valid) {
						// 如果为空白模版,否则用复制接口
						let industryType = this.creatSpeechform.industryType;
						let obj = {};
						if (industryType) {
							obj = this.industryList.find((item) => {
								return item.id == industryType;
							});
						}
						if (this.moban) {
							if (!this.creatSpeechform.speechcraftId) {
								this.$message.error('请选择话术模版！');
								return false;
							}
							this.copySpeechcraft({
								newTemplateType: 2,
								industryType: obj.id,
								industryName: obj.industryName,
								speechcraftId: this.creatSpeechform.speechcraftId,
								isCopySound: this.creatSpeechform.isCopySound,
								soundConfigGroup: this.creatSpeechform.soundConfigGroup,
							}).then(async res => {
								if (res) {
									this.creatSpeechVisible = false;
									this.$refs['creatSpeechform'].resetFields();
									await this.querySpeechcraftList(2);
								}
							});
						} else {
							this.addSpeechcraft();
						}
					} else {
						return false;
					}
				});
			},

			// tab 切换
			async handleTabClick(tab) {
				this.$refs.multipleTable.clearSelection();
				this.$refs.multipleTable.clearFilter();
				this.del_disabled = true;
				this.multipleSelection = [];
				if (this.activeName === 'my_speech') {
					this.btn_del = true;
				} else if (this.activeName === 'second') {
					this.btn_del = false;
				}

				this.speechcraftStatusList = [];
				this.speechcraftStatusText = '状态';
				await this.querySpeechcraftList();
			},

			// 确定删除
			deleteRow() {
				this.removeSpeechcraftList();
			},

			// 2.7.5.删除话术
			removeSpeechcraftList() {
				let data = [];
				this.multipleSelection.forEach(item => {
					data.push(item.id);
				});
				$.post(this.$baseUrl + 'speechcraft/removeSpeechcraftList.json', JSON.stringify(data)).then(async (res) => {
					if (res.resultMessageEnum === '0000') {
						await this.querySpeechcraftList();
						this.$message.success('删除成功');
						this.delVisible = false;
						this.multipleSelection = [];
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},

			// 所有行业列表
			async queryAllIndustryList() {
				const { data } = await axios.get(this.$baseUrl + 'intention/queryAllIndustryList.json');
				if (data.resultMessageEnum === '0000') {
					if (data.returnObject && data.returnObject.length) {
						this.industryList = data.returnObject;
					}
				}
			},

			// 选择
			handleSelectionChange(val) {
				this.multipleSelection = val;
				this.del_disabled = !this.multipleSelection.length;
			},

			async filterChange(filters) {
				let name = Object.keys(filters)[0];
				let array = [];
				for (let item in filters) {
					if (filters.hasOwnProperty(item)) {
						array = filters[item];
					}
				}

				if (name === 'speechcraftStatus') {
					this.speechcraftStatusList = array;
					this.speechcraftStatusText = common.formatterSpeechcraftStatus(array[0] * 1) || '状态';
				} else if (name === 'industryName') {
					const curItem = this.filtersIndustry.filter(item => {
						return item.value === array[0];
					});
					this.industryTypeList = array;
					this.industryNameTxt = (curItem[0] && curItem[0].text) || '行业领域';
				}

				await this.querySpeechcraftList();
			},

			// 导入话术
			submitFormImport(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						let data = {
							sourceType: 103,
							file: this.importSpeechform.file
						};
						$.post(this.$baseUrl + 'common/uploadAnnexFile.json', data).then((res) => {
							if (res.resultMessageEnum === '0000') {
								this.creatSpeechVisible = false;
							} else {
								this.$message.error(res.errorInfoList[0].errorMessage);
							}
						});
					} else {
						return false;
					}
				});
			},

			// 话术编辑
			handleEdit(index, row) {
				window.location.href = `${this.$baseHost}/flow/index.html?viewType=1&speechcraftId=${row.id}&speechcraftName=${row.speechcraftName}&flowType=1`;;
			},

			// 编辑确认
			handleEditEnter() {},

			// 查看
			handleView(index, row) {
				window.open(`${this.$baseHost}/flow/index.html?viewType=0&speechcraftId=${row.id}&speechcraftName=${row.speechcraftName}&flowType=1`);
			},

			downTaskItemExcelTemplate(index, row) {
				window.location.href = this.$baseUrl + `task/downTaskItemExcelTemplate.html?speechcraftId=${row.id}`;
			},

			/**
			 * 以下为通用模版事件
			 * stencil
			 */
			// 获取通用模版数据
			getStencilData() {
				this.$axios.get(this.url, {
					page: this.cur_page
				}).then((res) => {
					this.stencilData = res.data.list;
				})
			},

			// 使用
			handleUse(index, row) {
				this.stencilForm.name = row.name;
				this.useVisible = true;
			},

			useStencil() {
				$.get('', data).then((res) => {
					if (res.resultMessageEnum === '0000') {
						this.useVisible = false;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				})
			},

			//得到所有有效的行业列表(未上线、已下线、已上线)
			queryValidIndustryList() {
				$.get(this.$baseUrl + 'intention/queryValidIndustryList.json').then((res) => {
					if (res.resultMessageEnum === '0000') {
						this.filtersIndustry = [];
						if (res.returnObject.length) {
							res.returnObject.forEach((item, index) => {
								this.filtersIndustry[index] = {};
								this.filtersIndustry[index]['text'] = item.industryName;
								this.filtersIndustry[index]['value'] = item.id;
							})
						}
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
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
		},

		destroyed() {
			bus.$emit('contentTop', false);
		},

		watch: {
			creatSpeechVisible(val) {
				if (!val) {
					this.$refs['creatSpeechform'].resetFields();
					this.isShowMoban = false;
					this.moban = false;
				}
			},
		},
	}
</script>

<style scoped lang="less">
	.speech_top {
		padding: 10px 0px 20px;
		position: relative;

		.speech_top_btn_del {
			position: absolute;
			right: 20px;
			top: 12px;
			z-index: 5;
		}
	}

	.handle-box {
		margin-bottom: 20px;
	}

	.handle-select {
		width: 120px;
	}

	.handle-input {
		width: 240px;
		display: inline-block;
	}

	.del-dialog-cnt {
		font-size: 16px;
		text-align: center
	}

	.table {
		width: 100%;
		font-size: 14px;
	}

	.el-icon-question,
	.el-icon-lx-file {
		position: absolute;
		/*right:85px;*/
		top: 11px;
		font-size: 18px;
		color: #919FA9;
		margin-left: 10px;

		&.tymb {
			right: auto;
			left: 120px;
		}
	}

	.import_footer_tip {
		font-size: 13px;
		color: #303133;
	}

	.creatSpeechRead,
	.copySpeechRead {
		float: left;
		font-weight: normal;
		margin-top: 5px;
	}

	.creat-radio-box {

		.el-form-item__label {
			color: #f56c6c;
		}

		.el-radio.is-bordered+.el-radio.is-bordered {
			margin-left: 0;
		}

		label:nth-child(1) {
			margin-right: 10px;
		}
	}

	.pop-box-speech {
		p {
			width: 110px;
			padding: 30px 10px 0 15px;
			float: left;
		}

		img {
			float: right;
			width: 200px;
		}
	}

	.sound-content {
		position: fixed;
		z-index: 15;
		background-color: #fff;
		left: 0;
		width: 100%;
		top: 0;
		bottom: 0
	}

	.content-box-top-right {
		.el-button {
			padding: 0 10px;
			// width: 114px;
		}
	}

	.search-btn {
		width: 93px;
	}
</style>
