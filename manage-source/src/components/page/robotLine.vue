<template>
	<el-tabs v-model="activeName" @tab-click="handleClick">
		<el-tab-pane label="机器人线路分配" name="first">
			<el-form ref="form" :rules="rules" :model="robotLineConfigVO" label-width="100px" size="medium" style="width:450px">
				<el-form-item label="线路总数" required prop="total">
					<el-input-number v-model="robotLineConfigVO.total" controls-position="right" :min="1"></el-input-number>
				</el-form-item>
				<el-form-item label="允许分配" required prop="allowed">
					<el-input-number v-model="robotLineConfigVO.allowed" controls-position="right" :min="1"></el-input-number>
					<!-- 注：只能小于等于线路总数 -->
				</el-form-item>
				<el-form-item label="分配比例" prop="distributionRatio">
					<el-col :key="index" v-for="(item, index) in robotLineConfigVO.robotLineDistributionRatios">
						{{item.valueName}}：
						<el-input type="text" v-model="robotLineConfigVO.robotLineDistributionRatios[index].systemValue" size="medium"
						 style="width:60px">
						</el-input> %
					</el-col>
					注：该比例为高、中、低各优先级的线路分配比；各级比数值的总和必须等于100
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitForm('form')">保存</el-button>
				</el-form-item>
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="任务分配详情" name="second">
			<el-form :inline="true" class="demo-form-inline">
				<el-form-item label="关键词">
					<el-input v-model="pageInfo.queryKey" placeholder="任务名称"  @keyup.native.13="search"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="search()">搜索</el-button>
				</el-form-item>

			</el-form>
			<el-table :data="taskData" style="width: 100%">
				<el-table-column prop="name" label="任务名称" width="280">
				</el-table-column>
				<el-table-column prop="maxAllowAgent" label="当前线路数" width="180">
				</el-table-column>
			</el-table>
			<el-pagination background layout="prev, pager, next" :total="this.total" :page-size="20" @current-change="handleCurrentChange">
			</el-pagination>

		</el-tab-pane>
	</el-tabs>
</template>
<script>
	export default {
		data() {
			var validateTotal = (rule, value, callback) => {
				if (!value) {
					callback(new Error('请输入线路总数'));
				} else {
					callback();
				}
			};
			var validateAllowed = (rule, value, callback) => {
				if (!value) {
					callback(new Error('请输入允许分配的线路数'));
				} else {
					if (parseInt(value) > parseInt(this.robotLineConfigVO.total)) {
						callback(new Error('允许分配的线路数必须小于等于线路总数'));
					} else {
						callback();
					}
				}
			};
			var validateDistributionRatios = (rule, value, callback) => {
				let totalRatio = 0;
				for (let i = 0; i < this.robotLineConfigVO.robotLineDistributionRatios.length; i++) {
					console.log("===" + this.robotLineConfigVO.robotLineDistributionRatios[i].systemValue);
					totalRatio += parseInt(this.robotLineConfigVO.robotLineDistributionRatios[i].systemValue);
				}
				console.log(totalRatio);
				if (totalRatio !== 100) {
					callback(new Error('各级比数值的总和必须等于100'));
				} else {
					callback();
				}
			};
			return {
				activeName: 'first',
				robotLineConfigVO: {
					total: '',
					allowed: '',
					robotLineDistributionRatios: []
				},
				rules: {
					total: [{
						validator: validateTotal
					}],
					allowed: [{
						validator: validateAllowed
					}],
					distributionRatio: [{
						validator: validateDistributionRatios,
					}]
				},
				total: null,
				pageInfo: {
					queryKey: null,
					currentPage: 1,
					pageSize: 20
				},
				taskData: []
			};
		},
		created: function() {
			$.get(this.$baseUrl + 'services/config/queryRobotLineConfig.json').then((res) => {
				if (res.resultMessageEnum == '0000') {
					this.robotLineConfigVO = res.returnObject;
					console.log(this.robotLineConfigVO);

				} else {
					this.$message.error(res.errorInfoList[0].errorMessage);
				}
			});
		},
		methods: {
			handleClick(tab, event) {
				console.log(tab, event);
				// 切换到第二个tag页
				if (this.activeName === 'second') {
					$.post(this.$baseUrl + 'services/config/getTaskDistribut.json', JSON.stringify(this.pageInfo)).then((res) => {
						if (res.resultMessageEnum == '0000') {
							var pageBean = res.returnObject;
							this.total = pageBean.totalNumber;
							this.taskData = pageBean.recordList;
						} else {
							this.$message.error(res.errorInfoList[0].errorMessage);
						}
					});
				}
			},
			handleCurrentChange(page) {
				//	console.log(`当前页: ${page}`);
				this.pageInfo.currentPage = page;
				$.post(this.$baseUrl + 'services/config/getTaskDistribut.json', JSON.stringify(this.pageInfo)).then((res) => {
					if (res.resultMessageEnum == '0000') {
						var pageBean = res.returnObject;
						this.total = pageBean.totalNumber;
						this.taskData = pageBean.recordList;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},
			search() {
				$.post(this.$baseUrl + 'services/config/getTaskDistribut.json', JSON.stringify(this.pageInfo)).then((res) => {
					if (res.resultMessageEnum == '0000') {
						var pageBean = res.returnObject;
						this.total = pageBean.totalNumber;
						this.taskData = pageBean.recordList;
					} else {
						this.$message.error(res.errorInfoList[0].errorMessage);
					}
				});
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						$.post(this.$baseUrl + 'services/config/updateRobotLineConfig.json', JSON.stringify(this.robotLineConfigVO)).then(
							(res) => {
								if (res.resultMessageEnum == '0000') {
									this.$message.success('保存成功');
								} else {
									this.$message.error(res.errorInfoList[0].errorMessage);
								}
							});
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			}
		}
	};
</script>
